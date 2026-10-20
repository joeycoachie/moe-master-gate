import './recup.css';

// RECUP.STN pages (team sign-in, Team Guide, studio log): the deck's warm palette, light and dark.
export default function RecupLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="rt">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Rubik:wght@400;500;700&display=swap" />
      {children}
    </main>
  );
}
