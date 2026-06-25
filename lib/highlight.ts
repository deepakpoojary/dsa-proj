import { getSingletonHighlighter } from 'shiki';

const SUPPORTED_LANGS = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'c'];

export async function highlight(code: string, lang: string): Promise<string> {
  try {
    const hl = await getSingletonHighlighter({
      themes: ['github-dark'],
      langs: SUPPORTED_LANGS,
    });
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'python';
    return hl.codeToHtml(code, { lang: safeLang, theme: 'github-dark' });
  } catch {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre style="background:#0d1117;padding:1rem;border-radius:0.5rem;overflow-x:auto"><code style="color:#e6edf3;font-family:monospace">${escaped}</code></pre>`;
  }
}
