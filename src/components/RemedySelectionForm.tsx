// src/components/RemedySelectionForm.tsx
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

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSrNo, setActiveSrNo] = useState<string | null>(null);

  // Build a quick index of abbreviation → combined keynotes text (for symptom search)
  const symptomIndex = useMemo(() => {
    const index = new Map<string, string>();

    Object.entries(REMEDY_KEYNOTES).forEach(([abbr, k]) => {
      const combined = [
        k.mentalEmotionalThemes,
        k.generalThemes,
        k.keyLocalSymptoms,
        k.worseFrom,
        k.betterFrom,
        k.notesSphere,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      index.set(abbr, combined);
    });

    return index;
  }, []);

  // Filter remedies by:
  // - name
  // - abbreviation
  // - AND any matching text inside the keynotes (symptom search)
  const filteredRemedies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return remedies;

    return remedies.filter((remedy) => {
      const nameMatch = remedy.name.toLowerCase().includes(q);
      const abbrMatch = remedy.abbreviation.toLowerCase().includes(q);

      const symptomText =
        symptomIndex.get(remedy.abbreviation) ??
        symptomIndex.get(remedy.abbreviation.toUpperCase()) ??
        "";

      const symptomMatch = symptomText.includes(q);

      return nameMatch || abbrMatch || symptomMatch;
    });
  }, [remedies, searchTerm, symptomIndex]);

  // Pick the active remedy for keynotes:
  // - if a row was clicked, use that
  // - otherwise, default to the first remedy in the filtered list
  const activeRemedy = useMemo(() => {
    if (!filteredRemedies.length) return null;
    if (activeSrNo) {
      const found = filteredRemedies.find((r) => r.srNo === activeSrNo);
      if (found) return found;
    }
    return filteredRemedies[0];
  }, [filteredRemedies, activeSrNo]);

  const activeKeynotes =
    activeRemedy && REMEDY_KEYNOTES[activeRemedy.abbreviation];

  const handleRowClick = (remedy: Remedy) => {
    setActiveSrNo(remedy.srNo);
  };

  const handleTogglePotency = (srNo: string, potency: Potency) => {
    setSelections((prev) => {
      const current = prev[srNo] ?? new Set<Potency>();
      const next = new Set<Potency>(current);

      if (next.has(potency)) {
        next.delete(potency);
      } else {
        next.add(potency);
      }

      const updated: ClientSelections = { ...prev };
      if (next.size === 0) {
        delete updated[srNo];
      } else {
        updated[srNo] = next;
      }
      return updated;
    });
  };

  const selectionCount = Object.keys(selections).length;

  const handleGenerateClick = () => {
    if (!patientName.trim() || selectionCount === 0) return;
    onGenerate();
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-50/60">
      {/* Client & Search */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Client &amp; Remedy Selection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient's full name"
              className="w-full rounded-md bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Search by name / abbreviation / symptoms */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Search Remedies
              <span className="ml-1 text-xs font-normal text-slate-500">
                (name, abbreviation, or symptom keywords)
              </span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type symptoms like 'jaw pain night grinding', or remedy name..."
              className="w-full rounded-md bg-white border border-slate-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Remedy list */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col max-h-[55vh]">
        <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Remedy List
            </h2>
            <p className="text-xs text-slate-500">
              Click a row to view keynotes below and use the checkboxes to
              choose potencies.
            </p>
          </div>
        </div>

        {/* Table header */}
        <div className="px-4 border-t border-slate-200 bg-slate-100/80 sticky top-0 z-10">
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_repeat(3,60px)] text-xs font-semibold text-slate-600 py-2">
            <span>Name</span>
            <span>Abbreviation</span>
            {POTENCIES.map((p) => (
              <span key={p} className="text-center">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {filteredRemedies.map((remedy) => {
            const isActive = activeRemedy?.srNo === remedy.srNo;
            const selectedForThis = selections[remedy.srNo];

            return (
              <button
                key={remedy.srNo}
                type="button"
                onClick={() => handleRowClick(remedy)}
                className={[
                  "w-full text-left px-4 py-2 border-t border-slate-200 transition-colors",
                  isActive
                    ? "bg-cyan-50"
                    : "bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_repeat(3,60px)] items-center text-sm text-slate-900">
                  <span className="truncate">{remedy.name}</span>
                  <span className="text-slate-600">
                    {remedy.abbreviation}
                  </span>
                  {POTENCIES.map((potency) => (
                    <span key={potency} className="flex justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-cyan-500 cursor-pointer"
                        checked={selectedForThis?.has(potency) ?? false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTogglePotency(remedy.srNo, potency);
                        }}
                      />
                    </span>
                  ))}
                </div>
              </button>
            );
          })}

          {filteredRemedies.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-500">
              No remedies found matching your search.
            </div>
          )}
        </div>
      </section>

      {/* Keynotes panel */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm print-readable">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Remedy Keynotes
        </h2>

        {activeRemedy && activeKeynotes ? (
          <div>
            <h3 className="text-base font-semibold text-cyan-700 mb-1">
              {activeRemedy.name}{" "}
              <span className="text-xs text-slate-500">
                ({activeRemedy.abbreviation})
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-900">
              <div className="space-y-1">
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Mental &amp; Emotional Themes
                  </h4>
                  <p>{activeKeynotes.mentalEmotionalThemes || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    General Themes
                  </h4>
                  <p>{activeKeynotes.generalThemes || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Key Local Symptoms
                  </h4>
                  <p>{activeKeynotes.keyLocalSymptoms || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Worse from
                  </h4>
                  <p>{activeKeynotes.worseFrom || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Better from
                  </h4>
                  <p>{activeKeynotes.betterFrom || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Sphere / Notes
                  </h4>
                  <p>{activeKeynotes.notesSphere || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Select a remedy from the list above to view its keynotes.
          </p>
        )}
      </section>

      {/* Bottom bar – selection count + generate button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 flex items-center justify-between shadow-[0_-4px_12px_rgba(148,163,184,0.35)]">
        <span className="text-sm text-slate-700">
          {selectionCount === 0
            ? "No remedies selected"
            : selectionCount === 1
            ? "1 remedy selected"
            : `${selectionCount} remedies selected`}
        </span>
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!patientName.trim() || selectionCount === 0}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
            !patientName.trim() || selectionCount === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-400 text-white"
          }`}
        >
          Generate Prescription
        </button>
      </div>
    </div>
  );
};


