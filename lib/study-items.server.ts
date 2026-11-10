// Server-only builders (kept out of client bundles: the banks are large).
import type { Problem } from '@/types';
import { answerToNotes, bulletsToNotes, NoteLine } from './answer-notes';
import { BANK_TOPICS, bankItemId } from './interview-bank';
import { bankDetail } from './interview-bank/detailed';
import { COURSE_DSA, COURSE_HLD, COURSE_LLD, CourseSection } from './course-syllabus';
import { courseItemStars, designItemStars, problemStars } from './importance';
import { DSA_TOPIC, HLD_TOPIC, LLD_TOPIC, SITE_DSA_TOPIC, type Progress, type StudyItem, type StudyTopic } from './study-items';

export function bankTopics(): StudyTopic[] {
  return BANK_TOPICS.map((t) => ({ key: t.key, label: t.label, color: t.color, source: 'bank' }));
}

let bankCache: StudyItem[] | null = null;
export function bankItems(): StudyItem[] {
  return (bankCache ??= buildBankItems());
}

function buildBankItems(): StudyItem[] {
  return BANK_TOPICS.flatMap((t) =>
    t.questions.map((q) => {
      const id = bankItemId(t.slug, q.id);
      return {
        key: id,
        topic: t.key,
        group: q.group,
        title: q.q,
        stars: q.stars,
        difficulty: q.difficulty,
        notes: bulletsToNotes(q.a),
        code: q.code,
        hasDetail: !!bankDetail(id),
        progress: { kind: 'checklist', id } as Progress,
        done: false,
      };
    })
  );
}


let courseCache: StudyItem[] | null = null;
export function courseDsaItems(): StudyItem[] {
  return (courseCache ??= buildCourseDsaItems());
}

function buildCourseDsaItems(): StudyItem[] {
  return COURSE_DSA.flatMap((section) =>
    section.items.map((it) => {
      const isProblem = it.kind === 'reading';
      return {
        key: it.id,
        topic: DSA_TOPIC.key,
        group: section.title,
        title: it.title,
        stars: courseItemStars(it.title, it.kind),
        kind: it.kind,
        progress: { kind: 'checklist', id: it.id } as Progress,
        done: false,
        noteId: it.id,
        links: isProblem
          ? [{ label: 'LeetCode ↗', href: `https://leetcode.com/problemset/?search=${encodeURIComponent(it.title)}` }]
          : undefined,
      };
    })
  );
}

export function siteProblemItems(problems: (Problem & { solved?: boolean })[]): StudyItem[] {
  return problems.map((p) => {
    const notes: NoteLine[] = [
      { text: 'Problem', level: 0, heading: true },
      ...answerToNotes(p.description).map((n) => ({ ...n, level: 1 as const })),
      { text: `Brute force · ${p.bruteForce.timeComplexity} time, ${p.bruteForce.spaceComplexity} space`, level: 0, heading: true },
      ...answerToNotes(p.bruteForce.explanation).map((n) => ({ ...n, level: 1 as const })),
      { text: `Optimal · ${p.optimal.timeComplexity} time, ${p.optimal.spaceComplexity} space`, level: 0, heading: true },
      ...answerToNotes(p.optimal.explanation).map((n) => ({ ...n, level: 1 as const })),
    ];
    const links = [{ label: 'Full solution →', href: `/#problem-${p.slug}` }];
    if (p.leetcodeUrl) links.push({ label: 'LeetCode ↗', href: p.leetcodeUrl });
    return {
      key: `problem:${p.id}`,
      topic: SITE_DSA_TOPIC.key,
      group: p.topic,
      title: p.title,
      stars: problemStars(p),
      difficulty: p.difficulty,
      notes,
      code: p.optimal.code,
      progress: { kind: 'problem', id: p.id } as Progress,
      done: !!p.solved,
      links,
    };
  });
}

// LLD / HLD lessons from the course syllabus — the same checklist ids the
// Salary Roadmap uses, so ticking one in either place shows in both.
function designItems(track: 'lld' | 'hld', sections: CourseSection[], topic: StudyTopic): StudyItem[] {
  return sections.flatMap((section) =>
    section.items.map((it) => ({
      key: it.id,
      topic: topic.key,
      group: section.group === section.title ? section.title : `${section.group} · ${section.title}`,
      // Case-study steps ("Requirements", "Class diagram") repeat per study — name the study.
      title: /case studies/i.test(section.group) ? `${section.title} — ${it.title}` : it.title,
      stars: designItemStars(track, section.title, it.title, it.kind),
      kind: it.kind,
      progress: { kind: 'checklist', id: it.id } as Progress,
      done: false,
      noteId: it.id,
    }))
  );
}

let designCache: StudyItem[] | null = null;
export function designCourseItems(): StudyItem[] {
  return (designCache ??= [
    ...designItems('lld', COURSE_LLD, LLD_TOPIC),
    ...designItems('hld', COURSE_HLD, HLD_TOPIC),
  ]);
}
