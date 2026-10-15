import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import StudioPage from './StudioPage';

const inter = Inter({ subsets: ['latin'], variable: '--font-studio-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-studio-serif' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-studio-mono' });

export const metadata: Metadata = {
  title: 'Kinetic Studio OS · The M.O.E. Group',
  description:
    'The system behind every studio that takes the body seriously. One standard for every instructor, a record for every client, and a portal your clients can see.',
};

// Public sales page for studios (BC3, the Showroom). Served at /studio and at
// studio.theoperatorplaybook.com (proxy.ts rewrites that host to this route).
export default function Page() {
  return (
    <div className={`${inter.variable} ${playfair.variable} ${mono.variable}`}>
      <StudioPage />
    </div>
  );
}
