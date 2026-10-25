import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-helpers';
import {
  buildRuleRoadmap,
  normalizeRoadmap,
  detectTrack,
  roundLpa,
  Roadmap,
  RoadmapInput,
} from '@/lib/salary-roadmap';

const RoadmapSchema = z.object({
  headline: z.string(),
  months: z.number(),
  levers: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      lpa: z.number(),
      hours: z.number(),
      why: z.string(),
      subtopics: z.array(z.object({ name: z.string(), lpa: z.number(), hours: z.number() })),
    })
  ),
  hops: z.array(z.object({ ctc: z.number(), when: z.string(), note: z.string() })),
  warnings: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are a blunt, realistic career coach for software engineers in India. You turn a salary goal into a study plan where every topic has money attached, measured in LPA (lakhs per annum).

You will receive the engineer's profile and a DRAFT roadmap produced by a market model. The draft's reachable CTC, market bands and verdict are fixed. Do not change them, and never promise more than the reachable CTC. Your job is to tailor the draft:
- Rewrite each lever's "why" for this specific person: their stack, YOE and the kinds of companies that would hire them. Keep it to one or two sentences, concrete and honest.
- Rewrite subtopics so they fit the person's stack and seniority (for example, Spring Boot internals for a Java dev, or frontend system design for a React dev). Keep 3–11 subtopics per lever.
- Re-balance LPA between levers and subtopics if the profile clearly calls for it, but keep every lever's LPA a share of the same total jump. The server rescales the numbers to the exact total, so relative sizes are what matter.
- Keep the "baseline" lever (switching with no prep) if it is in the draft, with no subtopics.
- Keep lever keys from the draft. You may drop a lever that makes no sense for this person, or add at most one lever that the draft missed and that clearly matters for their stack.
- Hours are realistic focused-study hours for someone at this level.
- Warnings: keep the draft's realism warnings, and add any profile-specific ones (for example, a service-to-product switch needing referrals, or a notice period).
- Headline: one sentence with the rupee numbers.
Write in plain, direct English. No hype.`;

function parseInput(body: unknown): RoadmapInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
  const input = {
    currentCtc: num(b.currentCtc),
    yoe: num(b.yoe),
    stack: typeof b.stack === 'string' ? b.stack.slice(0, 300) : '',
    targetCtc: num(b.targetCtc),
    hoursPerWeek: num(b.hoursPerWeek),
  };
  if (
    !(input.currentCtc >= 0 && input.currentCtc <= 500) ||
    !(input.yoe >= 0 && input.yoe <= 40) ||
    !(input.targetCtc > 0 && input.targetCtc <= 1000) ||
    !(input.hoursPerWeek >= 1 && input.hoursPerWeek <= 80)
  ) {
    return null;
  }
  return input;
}

async function tailorWithClaude(input: RoadmapInput, draft: Roadmap): Promise<Roadmap | null> {
  const client = new Anthropic();
  const profile = {
    currentCtcLpa: input.currentCtc,
    yearsOfExperience: input.yoe,
    techStack: input.stack || '(not given)',
    detectedTrack: detectTrack(input.stack),
    targetCtcLpa: input.targetCtc,
    studyHoursPerWeek: input.hoursPerWeek,
  };

  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(RoadmapSchema) },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `<profile>\n${JSON.stringify(profile, null, 2)}\n</profile>\n\n<draft_roadmap>\n${JSON.stringify(
          {
            verdict: draft.verdict,
            reachableCtc: draft.reachableCtc,
            marketCeiling: draft.marketCeiling,
            stretchCeiling: draft.stretchCeiling,
            headline: draft.headline,
            months: draft.months,
            levers: draft.levers.map((l) => ({
              key: l.key,
              name: l.name,
              lpa: l.lpa,
              hours: l.hours,
              why: l.why,
              subtopics: l.subtopics.map((s) => ({ name: s.name, lpa: s.lpa, hours: s.hours })),
            })),
            hops: draft.hops,
            warnings: draft.warnings,
          },
          null,
          2
        )}\n</draft_roadmap>`,
      },
    ],
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) return null;
  const out = response.parsed_output;

  // Links and fixed market numbers come from the draft, never the model.
  const draftByKey = new Map(draft.levers.map((l) => [l.key, l]));
  const tailored: Roadmap = {
    ...draft,
    source: 'ai',
    headline: out.headline,
    months: Math.max(1, Math.round(out.months)),
    levers: out.levers.map((l) => {
      const base = draftByKey.get(l.key);
      const subLink = base?.subtopics.find((s) => s.link)?.link;
      return {
        ...l,
        link: base?.link,
        subtopics: l.key === 'baseline' ? [] : l.subtopics.map((s) => ({ ...s, link: subLink })),
      };
    }),
    hops: out.hops.length > 0 ? out.hops.map((h) => ({ ...h, ctc: roundLpa(h.ctc) })) : draft.hops,
    warnings: out.warnings,
  };
  return normalizeRoadmap(tailored);
}

export async function POST(req: NextRequest) {
  const input = parseInput(await req.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: 'Enter a valid CTC, YOE, target and hours per week.' }, { status: 400 });
  }

  const draft = buildRuleRoadmap(input);

  // The AI pass costs money per call, so it only runs for signed-in users.
  const user = await getCurrentUser();
  if (!user || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ roadmap: draft, aiAvailable: !!process.env.ANTHROPIC_API_KEY, signedIn: !!user });
  }

  try {
    const tailored = await tailorWithClaude(input, draft);
    return NextResponse.json({ roadmap: tailored ?? draft, aiAvailable: true, signedIn: true });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('roadmap: rate limited, serving rule-based roadmap');
    } else if (error instanceof Anthropic.APIError) {
      console.error(`roadmap: API error ${error.status}:`, error.message);
    } else {
      console.error('roadmap: failed to tailor roadmap', error);
    }
    return NextResponse.json({ roadmap: draft, aiAvailable: true, signedIn: true });
  }
}
