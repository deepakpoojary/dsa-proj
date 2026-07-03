import { getSingletonHighlighter } from 'shiki';

const SUPPORTED_LANGS = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'c'];

const cache = new Map<string, string>();

export async function highlight(code: string, lang: string): Promise<string> {
  const key = `${lang}:${code}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const hl = await getSingletonHighlighter({
      themes: ['github-dark'],
      langs: SUPPORTED_LANGS,
    });
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'python';
    const html = hl.codeToHtml(code, { lang: safeLang, theme: 'github-dark' });
    cache.set(key, html);
    return html;
  } catch {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<pre style="background:#0d1117;padding:1rem;border-radius:0.5rem;overflow-x:auto"><code style="color:#e6edf3;font-family:monospace">${escaped}</code></pre>`;
    cache.set(key, html);
    return html;
  }
}
