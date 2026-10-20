'use client';

import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="linkbtn"
      onClick={async () => {
        await fetch('/recup/api/logout', { method: 'POST' }).catch(() => null);
        router.replace('/recup/login');
      }}
    >
      Sign out
    </button>
  );
}
