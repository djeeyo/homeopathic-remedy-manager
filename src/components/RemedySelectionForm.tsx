import React, { useState, useMemo } from "react";
import type { Remedy, ClientSelections, Potency } from "../types";
import { POTENCIES } from "../types";
import { REMEDY_KEYNOTES } from "../constants/remedyKeynotes";

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: (name: string) => void;
  selections: ClientSelections;
  setSelections: React.Dispatch<React.SetStateAction<ClientSelections>>;
  onGenerate: () => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M10.5 4a6.5 6.5 0 0 1 5.16 10.5l3.92 3.92a1 1 0 0 1-1.42 1.42l-3.92-3.92A6.5 6.5 0 1 1 10.5 4zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"
      fill="currentColor"
    />
  </svg>
);

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRemedyAbbr, setActiveRemedyAbbr] = useState<string | null>(null);

  // --- Filter remedies by search ------------------------------------------------
  const filteredRemedies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return remedies;

    return remedies.filter((remedy) => {
      const name = remedy.name.toLowerCase();
      const abbr = remedy.abbreviation.toLowerCase();
      return name.includes(q) || abbr.includes(q);
    });
  }, [remedies, searchQuery]);

  // --- Which remedy is "active" for keynotes ------------------------------------
  const activeRemedy = useMemo(() => {
    if (activeRemedyAbbr) {
      const byAbbr = remedies.find(
        (r) => r.abbreviation === activeRemedyAbbr
      );
      if (byAbbr) return byAbbr;
    }
    // Fallback: first in filtered list
    return filteredRemedies[0] ?? null;
  }, [activeRemedyAbbr, filteredRemedies, remedies]);

  const keynotes =
    activeRemedy && REMEDY_KEYNOTES[activeRemedy.abbreviation]
      ? REMEDY_KEYNOTES[activeRemedy.abbreviation]
      : null;

  // --- Selection helpers --------------------------------------------------------
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

  // ----------------------------------------------------------------------------- //
  //                                  RENDER                                       //
  // ----------------------------------------------------------------------------- //

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
            <label
              htmlFor="searchRemedies"
              className="text-sm font-medium text-slate-300"
            >
              Search Remedies
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="searchRemedies"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or abbreviation..."
                className="w-full rounded-md border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
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
                  Name
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
              {filteredRemedies.map((remedy) => {
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
                    onClick={() => setActiveRemedyAbbr(remedy.abbreviation)}
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

              {filteredRemedies.length === 0 && (
                <tr>
                  <td
                    colSpan={2 + POTENCIES.length}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No remedies match your search.
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
