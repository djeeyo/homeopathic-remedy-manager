// src/utils/symptomSearch.ts
import type { RemedyKeynotes } from "../constants/remedyKeynotes";

export type SymptomSearchOptions = {
  includeMentalEmotional?: boolean;
  includeGeneralThemes?: boolean;
  includeLocalSymptoms?: boolean;
  includeModalities?: boolean; // worseFrom + betterFrom
  includeNotesSphere?: boolean;
};

const DEFAULT_OPTIONS: Required<SymptomSearchOptions> = {
  includeMentalEmotional: true,
  includeGeneralThemes: true,
  includeLocalSymptoms: true,
  includeModalities: true,
  includeNotesSphere: true,
};

// very simple stop word list – can expand later
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "without",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "that",
  "this",
  "it",
  "as",
  "by",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const norm = normalize(text);
  if (!norm) return [];
  return norm
    .split(" ")
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

type FieldKey =
  | "mentalEmotionalThemes"
  | "generalThemes"
  | "keyLocalSymptoms"
  | "worseFrom"
  | "betterFrom"
  | "notesSphere";

const FIELD_WEIGHTS: Record<FieldKey, number> = {
  mentalEmotionalThemes: 1.2,
  generalThemes: 1.0,
  keyLocalSymptoms: 1.5,
  worseFrom: 1.1,
  betterFrom: 1.1,
  notesSphere: 0.8,
};

function getActiveFields(options: SymptomSearchOptions): FieldKey[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fields: FieldKey[] = [];

  if (opts.includeMentalEmotional) fields.push("mentalEmotionalThemes");
  if (opts.includeGeneralThemes) fields.push("generalThemes");
  if (opts.includeLocalSymptoms) fields.push("keyLocalSymptoms");
  if (opts.includeModalities) {
    fields.push("worseFrom", "betterFrom");
  }
  if (opts.includeNotesSphere) fields.push("notesSphere");

  return fields;
}

export type SymptomSearchResult = {
  remedy: RemedyKeynotes;
  score: number;
};

function scoreRemedy(
  remedy: RemedyKeynotes,
  queryTokens: string[],
  options: SymptomSearchOptions
): number {
  if (queryTokens.length === 0) return 0;

  const activeFields = getActiveFields(options);
  if (activeFields.length === 0) return 0;

  let score = 0;

  for (const field of activeFields) {
    const raw = (remedy[field] || "") as string;
    const fieldTokens = new Set(tokenize(raw));
    let matches = 0;

    for (const token of queryTokens) {
      if (fieldTokens.has(token)) {
        matches += 1;
      }
    }

    if (matches > 0) {
      score += matches * FIELD_WEIGHTS[field];
    }
  }

  return score;
}

export function searchBySymptoms(
  allKeynotes: RemedyKeynotes[],
  query: string,
  options: SymptomSearchOptions = {}
): SymptomSearchResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: SymptomSearchResult[] = [];

  for (const remedy of allKeynotes) {
    const score = scoreRemedy(remedy, queryTokens, options);
    if (score > 0) {
      results.push({ remedy, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
