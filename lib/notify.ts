import 'server-only';

// Pings the founder's phone. Two channels, whichever has its keys set in Vercel:
//   Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (a private bot chat)
//   ntfy:     NTFY_TOPIC (the ntfy app subscribed to a long, secret topic name)
// Messages carry a first name and a product name only, never health data.
// Never throws: a failed ping must not fail the client's tap.
export async function notifyFounder(title: string, body: string, link?: string) {
  const sends: Promise<unknown>[] = [];
  const tg = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (tg && chat) {
    sends.push(
      fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: `${title}\n${body}${link ? `\n${link}` : ''}`, disable_web_page_preview: true }),
      }),
    );
  }
  const topic = process.env.NTFY_TOPIC;
  if (topic) {
    sends.push(
      fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: { Title: title, ...(link ? { Click: link } : {}), Tags: 'bell' },
        body,
      }),
    );
  }
  await Promise.allSettled(sends);
}
