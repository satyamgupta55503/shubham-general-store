"use client";
// Drop-in replacement for <style>{`...`}</style> that avoids Next.js hydration mismatch.
// Usage: <GlobalStyles css={`...`} />
export default function GlobalStyles({ css }) {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
