'use client';

import { useState } from 'react';
import { EnrichedProblem, Example } from '@/types';

const difficultyStyle: Record<string, string> = {
  Easy: 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30',
  Medium: 'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30',
  Hard: 'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30',
};

export default function ProblemCard({
  problem,
  index,
}: {
  problem: EnrichedProblem;
  index: number;
}) {
  const [tab, setTab] = useState<'brute' | 'optimal'>('brute');

  const content = tab === 'brute' ? problem.bruteForce : problem.optimal;
  const html = tab === 'brute' ? problem.bruteHtml : problem.optimalHtml;

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
        <div className="flex gap-2 flex-wrap">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${difficultyStyle[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full border text-[#58a6ff] bg-[#58a6ff]/10 border-[#58a6ff]/30 font-medium">
            {problem.topic}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#8b949e] text-sm px-5 pb-3 leading-relaxed">{problem.description}</p>

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

      {/* Tabs */}
      <div className="flex border-b border-[#30363d] px-5">
        <button
          onClick={() => setTab('brute')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'brute'
              ? 'border-[#f85149] text-[#f85149]'
              : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          Brute Force
        </button>
        <button
          onClick={() => setTab('optimal')}
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
        <p className="text-sm text-[#8b949e] mb-4 leading-relaxed">
          <span className="text-[#e6edf3] font-medium">Approach: </span>
          {content.explanation}
        </p>

        {/* Code */}
        <div
          className="rounded-lg border border-[#30363d] overflow-hidden mb-4 [&_.shiki]:!m-0 [&_.shiki_code]:!p-4 [&_.shiki]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Complexity */}
        <div className="flex gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e] text-xs">Time</span>
            <code className="text-xs bg-[#0d1117] text-[#58a6ff] px-2 py-0.5 rounded font-mono border border-[#30363d]">
              {content.timeComplexity}
            </code>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e] text-xs">Space</span>
            <code className="text-xs bg-[#0d1117] text-[#3fb950] px-2 py-0.5 rounded font-mono border border-[#30363d]">
              {content.spaceComplexity}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
