import localFont from 'next/font/local';
import { getCurrentUser } from '@/lib/auth-helpers';
import ResumeBuilder from '@/components/ResumeBuilder';

export const metadata = { title: 'resume' };

export const dynamic = 'force-dynamic';

// Computer Modern — the LaTeX typeface — for the Classic template. Bundled
// from the OFL-licensed `computer-modern` package so it renders (and prints)
// identically on any machine, no system install needed.
const latex = localFont({
  src: [
    { path: '../../node_modules/computer-modern/fonts/cmu-serif-500-roman.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/computer-modern/fonts/cmu-serif-500-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../node_modules/computer-modern/fonts/cmu-serif-700-roman.woff2', weight: '700', style: 'normal' },
    { path: '../../node_modules/computer-modern/fonts/cmu-serif-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-latex',
  display: 'swap',
});

export default async function ResumePage() {
  const user = await getCurrentUser();
  return (
    <div className={latex.variable}>
      <ResumeBuilder signedIn={!!user} />
    </div>
  );
}
