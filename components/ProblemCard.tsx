'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { EnrichedProblem, Example } from '@/types';

const difficultyStyle: Record<string, string> = {
  Easy: 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30',
  Medium: 'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30',
  Hard: 'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30',
};

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

export default function ProblemCard({
  problem: initialProblem,
  index,
  editMode,
  locked = false,
  onUpdate,
}: {
  problem: EnrichedProblem;
  index: number;
  editMode: boolean;
  locked?: boolean;
  onUpdate: (updated: EnrichedProblem) => void;
}) {
  const [tab, setTab] = useState<'brute' | 'optimal'>('brute');
  useEffect(() => {
    const saved = localStorage.getItem(`tab_${initialProblem.id}`);
    if (saved === 'optimal') setTab('optimal');
  }, [initialProblem.id]);
  const [problem, setProblem] = useState(initialProblem);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const descRef = useRef<HTMLTextAreaElement>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const spaceRef = useRef<HTMLInputElement>(null);

  const content = tab === 'brute' ? problem.bruteForce : problem.optimal;
  const html = tab === 'brute' ? problem.bruteHtml : problem.optimalHtml;

  const flashSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, []);

  const save = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/problems/${problem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated: EnrichedProblem = await res.json();
        setProblem(updated);
        onUpdate(updated);
        flashSaved();
      }
    } finally {
      setSaving(false);
    }
  }, [problem.id, onUpdate, flashSaved]);

  const handleDescBlur = useCallback(() => {
    const val = descRef.current?.value ?? '';
    if (val !== problem.description) save({ description: val });
  }, [problem.description, save]);

  const handleExplanationBlur = useCallback(() => {
    const val = explanationRef.current?.value ?? '';
    const key = tab === 'brute' ? 'bruteForce' : 'optimal';
    if (val !== content.explanation) save({ [key]: { explanation: val } });
  }, [tab, content.explanation, save]);

  const handleCodeBlur = useCallback(() => {
    const val = codeRef.current?.value ?? '';
    const key = tab === 'brute' ? 'bruteForce' : 'optimal';
    if (val !== content.code) save({ [key]: { code: val } });
  }, [tab, content.code, save]);

  const handleTimeBlur = useCallback(() => {
    const val = timeRef.current?.value ?? '';
    const key = tab === 'brute' ? 'bruteForce' : 'optimal';
    if (val !== content.timeComplexity) save({ [key]: { timeComplexity: val } });
  }, [tab, content.timeComplexity, save]);

  const handleSpaceBlur = useCallback(() => {
    const val = spaceRef.current?.value ?? '';
    const key = tab === 'brute' ? 'bruteForce' : 'optimal';
    if (val !== content.spaceComplexity) save({ [key]: { spaceComplexity: val } });
  }, [tab, content.spaceComplexity, save]);

  return (
    <div
      id={`problem-${problem.slug}`}
      className="rounded-xl border border-[#30363d] bg-[#161b22] mb-5 overflow-hidden"
      data-title={problem.title.toLowerCase()}
      data-topic={problem.topic.toLowerCase()}
      data-description={problem.description.toLowerCase()}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
        <h3 className="text-base font-semibold text-[#e6edf3] flex items-center gap-2">
          <span className="text-[#8b949e] text-sm font-normal">#{index + 1}</span>
          {problem.title}
        </h3>
        <div className="flex gap-2 flex-wrap items-center">
          {saving && <span className="text-[#8b949e] text-xs">saving…</span>}
          {saved && <span className="text-[#3fb950] text-xs">✓ saved</span>}
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${difficultyStyle[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full border text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/30 font-medium">
            {problem.topic}
          </span>
        </div>
      </div>

      {/* Description */}
      {editMode ? (
        <textarea
          ref={descRef}
          defaultValue={problem.description}
          onBlur={handleDescBlur}
          onChange={(e) => autoResize(e.target)}
          onFocus={(e) => autoResize(e.target)}
          rows={2}
          className="w-full bg-[#0d1117] border-y border-[#30363d] text-[#8b949e] text-sm px-5 py-3 leading-relaxed resize-none outline-none"
          style={{ overflow: 'hidden', fontFamily: 'inherit' }}
        />
      ) : (
        <p className="text-[#8b949e] text-sm px-5 pb-3 leading-relaxed">{problem.description}</p>
      )}

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="px-5 pb-4">
          <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">Examples</div>
          <div className="flex flex-col gap-2">
            {problem.examples.map((ex: Example, i: number) => (
              <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono">
                <div className="flex gap-3 flex-wrap">
                  <div>
                    <span className="text-[#8b949e]">Input: </span>
                    <span className="text-[#e6edf3]">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-[#8b949e]">Output: </span>
                    <span className="text-[#3fb950]">{ex.output}</span>
                  </div>
                </div>
                {ex.explanation && (
                  <div className="text-[#8b949e] mt-1 font-sans">
                    <span className="text-[#8b949e]">Explanation: </span>{ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {locked ? (
        <div className="p-5">
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-6 flex flex-col items-center text-center gap-3">
            <div className="text-2xl">🔒</div>
            <p className="text-sm text-[#8b949e] max-w-xs">
              Brute force &amp; optimal solutions for this topic are part of the paid unlock.
            </p>
            <a
              href="/#checkout"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#238636] text-white hover:opacity-90 transition-opacity"
            >
              Unlock full access
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[#30363d] px-5">
            <button
              onClick={() => { setTab('brute'); localStorage.setItem(`tab_${problem.id}`, 'brute'); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === 'brute'
                  ? 'border-[#f85149] text-[#f85149]'
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              Brute Force
            </button>
            <button
              onClick={() => { setTab('optimal'); localStorage.setItem(`tab_${problem.id}`, 'optimal'); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === 'optimal'
                  ? 'border-[#3fb950] text-[#3fb950]'
                  : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              ✦ Optimal
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* Approach */}
            {editMode ? (
              <textarea
                key={`${problem.id}-${tab}-explanation`}
                ref={explanationRef}
                defaultValue={content.explanation}
                onBlur={handleExplanationBlur}
                onChange={(e) => autoResize(e.target)}
                onFocus={(e) => autoResize(e.target)}
                rows={2}
                placeholder="Explain the approach..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg text-[#8b949e] text-sm p-3 mb-4 leading-relaxed resize-none outline-none"
                style={{ overflow: 'hidden', fontFamily: 'inherit' }}
              />
            ) : (
              <p className="text-sm text-[#8b949e] mb-4 leading-relaxed">
                <span className="text-[#e6edf3] font-medium">Approach: </span>
                {content.explanation}
              </p>
            )}

            {/* Code */}
            {editMode ? (
              <textarea
                key={`${problem.id}-${tab}-code`}
                ref={codeRef}
                defaultValue={content.code}
                onBlur={handleCodeBlur}
                onChange={(e) => autoResize(e.target)}
                onFocus={(e) => autoResize(e.target)}
                rows={8}
                placeholder="// C++ code here"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-xs p-4 mb-4 resize-none outline-none"
                style={{ overflow: 'hidden', fontFamily: 'ui-monospace, monospace', lineHeight: '1.6' }}
              />
            ) : (
              <div
                className="rounded-lg border border-[#30363d] overflow-hidden mb-4 [&_.shiki]:!m-0 [&_.shiki_code]:!p-4 [&_.shiki]:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}

            {/* Complexity */}
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5">
                <span className="text-[#8b949e] text-xs">Time</span>
                {editMode ? (
                  <input
                    key={`${problem.id}-${tab}-time`}
                    ref={timeRef}
                    defaultValue={content.timeComplexity}
                    onBlur={handleTimeBlur}
                    className="w-24 text-xs bg-[#0d1117] text-[#58a6ff] px-2 py-0.5 rounded font-mono border border-[#30363d] outline-none"
                  />
                ) : (
                  <code className="text-xs bg-[#0d1117] text-[#58a6ff] px-2 py-0.5 rounded font-mono border border-[#30363d]">
                    {content.timeComplexity}
                  </code>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8b949e] text-xs">Space</span>
                {editMode ? (
                  <input
                    key={`${problem.id}-${tab}-space`}
                    ref={spaceRef}
                    defaultValue={content.spaceComplexity}
                    onBlur={handleSpaceBlur}
                    className="w-24 text-xs bg-[#0d1117] text-[#3fb950] px-2 py-0.5 rounded font-mono border border-[#30363d] outline-none"
                  />
                ) : (
                  <code className="text-xs bg-[#0d1117] text-[#3fb950] px-2 py-0.5 rounded font-mono border border-[#30363d]">
                    {content.spaceComplexity}
                  </code>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
