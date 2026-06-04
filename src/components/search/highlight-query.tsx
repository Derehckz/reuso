function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightQuery({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const term = query.trim();
  if (!term) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="bg-brand-orange/20 text-brand-orange"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}
