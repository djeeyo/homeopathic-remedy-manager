import React, { useState, useMemo } from "react";
import type { Remedy, ClientSelections, Potency } from "../types";
import { POTENCIES } from "../types";
import { REMEDY_KEYNOTES } from "../constants/remedyKeynotes";
import type { RemedyKeynotes as BaseKeynotes } from "../constants/remedyKeynotes";

/* -------------------------------------------------------------------------- */
/*                          Symptom search helpers                            */
/* -------------------------------------------------------------------------- */

type RemedyKeynotes = BaseKeynotes & { abbreviation: string };

type SearchMode = "name" | "symptoms";

type SymptomSearchOptions = {
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

// very small stop-word list – can expand later if you like
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

function tokenize(text: string): string[] {
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

type SymptomSearchResult = {
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

function searchBySymptoms(
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

// simple highlighter for matched words in local symptoms
function highlightMatches(text: string, query: string) {
  const tokens = Array.from(new Set(tokenize(query)));
  if (!tokens.length || !text) return text;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-yellow-200/60 text-slate-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                              Component props                               */
/* -------------------------------------------------------------------------- */

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: (name: string) => void;
  selections: ClientSelections;
  setSelections: React.Dispatch<React.SetStateAction<ClientSelections>>;
  onGenerate: () => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      d="M10.5 4a6.5 6.5 0 0 1 5.16 10.5l3.92 3.92a1 1 0 0 1-1.42 1.42l-3.92-3.92A6.5 6.5 0 1 1 10.5 4zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"
      fill="currentColor"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                           RemedySelectionForm                              */
/* -------------------------------------------------------------------------- */

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  const [activeRemedyAbbr, setActiveRemedyAbbr] = useState<string | null>(null);
  const [symptomOptions, setSymptomOptions] = useState<SymptomSearchOptions>(
    {}
  );

  // flatten keynotes map once, adding the abbreviation from the key
  const allKeynotes = useMemo<RemedyKeynotes[]>(
    () =>
      Object.entries(REMEDY_KEYNOTES).map(([abbr, data]) => ({
        abbreviation: abbr,
        ...(data as BaseKeynotes),
      })),
    []
  );

  // --- Filter remedies by name/abbrev -----------------------------------------
  const filteredRemedies = useMemo(() => {
    if (searchMode !== "name") return remedies;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return remedies;

    return remedies.filter((remedy) => {
      const name = remedy.name.toLowerCase();
      const abbr = remedy.abbreviation.toLowerCase();
      return name.includes(q) || abbr.includes(q);
    });
  }, [remedies, searchMode, searchQuery]);

  // --- Symptom search over keynotes -------------------------------------------
  const symptomResults = useMemo<SymptomSearchResult[]>(() => {
    if (searchMode !== "symptoms") return [];
    const q = searchQuery.trim();
    if (!q) return [];
    return searchBySymptoms(allKeynotes, q, symptomOptions);
  }, [allKeynotes, searchMode, searchQuery, symptomOptions]);

  // --- Which remedy is "active" for keynotes ----------------------------------
  const activeRemedy = useMemo(() => {
    // explicit selection wins
    if (activeRemedyAbbr) {
      const byAbbr = remedies.find(
        (r) => r.abbreviation === activeRemedyAbbr
      );
      if (byAbbr) return byAbbr;
    }

    // if in symptom mode, default to top match
    if (searchMode === "symptoms" && symptomResults.length > 0) {
      const firstAbbr = symptomResults[0].remedy.abbreviation;
      const match = remedies.find((r) => r.abbreviation === firstAbbr);
      if (match) return match;
    }

    // fallback: first in filtered list
    return filteredRemedies[0] ?? null;
  }, [
    activeRemedyAbbr,
    remedies,
    filteredRemedies,
    searchMode,
    symptomResults,
  ]);

  const keynotes =
    activeRemedy && REMEDY_KEYNOTES[activeRemedy.abbreviation]
      ? REMEDY_KEYNOTES[activeRemedy.abbreviation]
      : null;

  // --- Selection helpers -------------------------------------------------------
  const selectionCount = useMemo(
    () => Object.keys(selections).length,
    [selections]
  );

  const toggleSelection = (srNo: string, potency: Potency) => {
    setSelections((prev) => {
      const next: ClientSelections = { ...prev };
      const current = prev[srNo] ? new Set(prev[srNo]) : new Set<Potency>();

      if (current.has(potency)) {
        current.delete(potency);
      } else {
        current.add(potency);
      }

      if (current.size === 0) {
        delete next[srNo];
      } else {
        next[srNo] = current;
      }

      return next;
    });
  };

  const handleGenerateClick = () => {
    if (!patientName.trim() || selectionCount === 0) return;
    onGenerate();
  };

  // --------------------------------------------------------------------------- //
  //                                   RENDER                                   //
  // --------------------------------------------------------------------------- //

  return (
    <div className="space-y-6">
      {/* TOP: Patient + Search */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4">
          Client &amp; Remedy Selection
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Patient name */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="patientName"
              className="text-sm font-medium text-slate-300"
            >
              Patient Name
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient's full name"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Search remedies */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="searchRemedies"
                className="text-sm font-medium text-slate-300"
              >
                Search Remedies
              </label>
              <div className="inline-flex rounded-lg bg-slate-800 border border-slate-700 text-xs overflow-hidden">
                <button
                  type="button"
                  className={`px-2.5 py-1 ${
                    searchMode === "name"
                      ? "bg-cyan-500 text-slate-900"
                      : "text-slate-300"
                  }`}
                  onClick={() => setSearchMode("name")}
                >
                  By name
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 border-l border-slate-700 ${
                    searchMode === "symptoms"
                      ? "bg-cyan-500 text-slate-900"
                      : "text-slate-300"
                  }`}
                  onClick={() => setSearchMode("symptoms")}
                >
                  By symptoms
                </button>
              </div>
            </div>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="searchRemedies"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchMode === "name"
                    ? "Filter by name or abbreviation..."
                    : "Describe symptoms (e.g. jaw pain, grinding, worse on waking)..."
                }
                className="w-full rounded-md border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {searchMode === "symptoms" && (
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    checked={symptomOptions.includeMentalEmotional ?? true}
                    onChange={(e) =>
                      setSymptomOptions((prev) => ({
                        ...prev,
                        includeMentalEmotional: e.target.checked,
                      }))
                    }
                  />
                  Mental / emotional
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    checked={symptomOptions.includeGeneralThemes ?? true}
                    onChange={(e) =>
                      setSymptomOptions((prev) => ({
                        ...prev,
                        includeGeneralThemes: e.target.checked,
                      }))
                    }
                  />
                  Generals
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    checked={symptomOptions.includeLocalSymptoms ?? true}
                    onChange={(e) =>
                      setSymptomOptions((prev) => ({
                        ...prev,
                        includeLocalSymptoms: e.target.checked,
                      }))
                    }
                  />
                  Local symptoms
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    checked={symptomOptions.includeModalities ?? true}
                    onChange={(e) =>
                      setSymptomOptions((prev) => ({
                        ...prev,
                        includeModalities: e.target.checked,
                      }))
                    }
                  />
                  Modalities
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MIDDLE: Scrollable Remedy List */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <div className="border-b border-slate-800 px-4 py-3 md:px-6">
          <h2 className="text-lg font-semibold text-cyan-300">Remedy List</h2>
          <p className="text-xs text-slate-400 mt-1">
            Click a row to view keynotes below and use the checkboxes to choose
            potencies.
          </p>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-300 md:px-6">
                  Name / Symptoms
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-300 md:px-6">
                  Abbreviation
                </th>
                {POTENCIES.map((potency) => (
                  <th
                    key={potency}
                    className="px-2 py-2 text-center font-medium text-slate-300"
                  >
                    {potency}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* NAME/ABBREV MODE ROWS */}
              {searchMode === "name" &&
                filteredRemedies.map((remedy) => {
                  const isActive =
                    activeRemedy && activeRemedy.srNo === remedy.srNo;
                  return (
                    <tr
                      key={remedy.srNo}
                      className={`cursor-pointer border-b border-slate-800/60 transition-colors ${
                        isActive
                          ? "bg-slate-800/70"
                          : "hover:bg-slate-800/40"
                      }`}
                      onClick={() =>
                        setActiveRemedyAbbr(remedy.abbreviation)
                      }
                    >
                      <td className="px-4 py-2 md:px-6 text-slate-100">
                        {remedy.name}
                      </td>
                      <td className="px-4 py-2 md:px-6 text-slate-300">
                        {remedy.abbreviation}
                      </td>
                      {POTENCIES.map((potency) => {
                        const checked =
                          selections[remedy.srNo]?.has(potency) ?? false;
                        return (
                          <td
                            key={potency}
                            className="px-2 py-2 text-center align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                              checked={checked}
                              onChange={() =>
                                toggleSelection(remedy.srNo, potency)
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

              {searchMode === "name" && filteredRemedies.length === 0 && (
                <tr>
                  <td
                    colSpan={2 + POTENCIES.length}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No remedies match your search.
                  </td>
                </tr>
              )}

              {/* SYMPTOM MODE ROWS */}
              {searchMode === "symptoms" &&
                symptomResults.map(({ remedy: rk, score }) => {
                  const remedy = remedies.find(
                    (r) => r.abbreviation === rk.abbreviation
                  );
                  if (!remedy) return null;

                  const isActive =
                    activeRemedy && activeRemedy.srNo === remedy.srNo;

                  return (
                    <tr
                      key={remedy.srNo}
                      className={`cursor-pointer border-b border-slate-800/60 transition-colors ${
                        isActive
                          ? "bg-slate-800/70"
                          : "hover:bg-slate-800/40"
                      }`}
                      onClick={() =>
                        setActiveRemedyAbbr(remedy.abbreviation)
                      }
                    >
                      <td className="px-4 py-2 md:px-6 text-slate-100">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div>{remedy.name}</div>
                            <div className="mt-1 text-[11px] text-slate-300">
                              {highlightMatches(
                                rk.keyLocalSymptoms || "",
                                searchQuery
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            score {score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 md:px-6 text-slate-300">
                        {remedy.abbreviation}
                      </td>
                      {POTENCIES.map((potency) => {
                        const checked =
                          selections[remedy.srNo]?.has(potency) ?? false;
                        return (
                          <td
                            key={potency}
                            className="px-2 py-2 text-center align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                              checked={checked}
                              onChange={() =>
                                toggleSelection(remedy.srNo, potency)
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

              {searchMode === "symptoms" &&
                searchQuery.trim() &&
                symptomResults.length === 0 && (
                  <tr>
                    <td
                      colSpan={2 + POTENCIES.length}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      No remedies match these symptoms.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM: Remedy Keynotes */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-cyan-300 mb-3">
          Remedy Keynotes
        </h2>

        {activeRemedy ? (
          <>
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-100">
                {activeRemedy.name}{" "}
                <span className="text-xs text-slate-400">
                  ({activeRemedy.abbreviation})
                </span>
              </h3>
            </div>

            {keynotes ? (
              <div className="grid gap-4 md:grid-cols-2 text-sm leading-relaxed">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      Mental &amp; Emotional Themes
                    </h4>
                    <p className="text-slate-200">
                      {keynotes.mentalEmotionalThemes}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      General Themes
                    </h4>
                    <p className="text-slate-200">{keynotes.generalThemes}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      Key Local Symptoms
                    </h4>
                    <p className="text-slate-200">
                      {keynotes.keyLocalSymptoms}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-200">Worse from</h4>
                    <p className="text-slate-200">{keynotes.worseFrom}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      Better from
                    </h4>
                    <p className="text-slate-200">{keynotes.betterFrom}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      Sphere / Notes
                    </h4>
                    <p className="text-slate-200">{keynotes.notesSphere}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">
                No keynotes found for this remedy in your RemedyKeynotesSheet.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-300">
            Select a remedy from the list above to view its keynotes here.
          </p>
        )}
      </section>

      {/* STICKY BOTTOM BAR */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800 mt-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <span className="text-sm text-slate-300">
            {selectionCount === 0
              ? "No remedies selected"
              : `${selectionCount} ${
                  selectionCount === 1 ? "remedy" : "remedies"
                } selected`}
          </span>
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={!patientName.trim() || selectionCount === 0}
            className="inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 text-sm font-medium text-slate-900 shadow hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Prescription
          </button>
        </div>
      </div>
    </div>
  );
};
