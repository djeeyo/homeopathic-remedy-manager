import React from "react";
import { tokenize } from "./symptomSearch";

export function highlightMatches(text: string, query: string) {
  const tokens = Array.from(new Set(tokenize(query)));
  if (!tokens.length) return text;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-yellow-200">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
