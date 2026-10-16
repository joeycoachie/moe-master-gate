import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-portal-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-portal-serif' });

export const metadata: Metadata = {
  title: 'Your Studio File · The M.O.E. Group',
  description: 'Your sessions, your progress and your fuel plan, in one place.',
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${playfair.variable}`}>{children}</div>;
}
