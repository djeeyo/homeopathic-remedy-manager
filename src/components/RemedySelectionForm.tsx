// src/components/RemedySelectionForm.tsx
import React, { useState, useMemo, Dispatch, SetStateAction } from "react";
import type { Remedy, ClientSelections, Potency } from "../types";
import { POTENCIES } from "../types";
import { REMEDY_KEYNOTES } from "../constants/remedyKeynotes";

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: Dispatch<SetStateAction<string>>;
  selections: ClientSelections;
  setSelections: Dispatch<SetStateAction<ClientSelections>>;
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
  const [activeAbbreviation, setActiveAbbreviation] = useState<string | null>(
    null,
  );

  // --- filter remedies by search term ---
  const filteredRemedies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return remedies;

    return remedies.filter((r) => {
      const name = r.name.toLowerCase();
      const abbr = r.abbreviation.toLowerCase();
      return name.includes(term) || abbr.includes(term);
    });
  }, [remedies, searchTerm]);

  // --- count selected boxes ---
  const selectionCount = useMemo(() => {
    return Object.values(selections).reduce((sum, set) => {
      if (!set) return sum;
      return sum + set.size;
    }, 0);
  }, [selections]);

  // --- current keynotes ---
  const currentKeynotes =
    activeAbbreviation && REMEDY_KEYNOTES[activeAbbreviation]
      ? REMEDY_KEYNOTES[activeAbbreviation]
      : null;

  const currentKeynotesTitle = useMemo(() => {
    if (!activeAbbreviation) return "";
    const remedy = remedies.find(
      (r) => r.abbreviation === activeAbbreviation,
    );
    return remedy ? `${remedy.name} (${remedy.abbreviation})` : "";
  }, [activeAbbreviation, remedies]);

  // --- toggle a potency checkbox for given srNo + potency ---
  const togglePotency = (srNo: string, potency: Potency) => {
    setSelections((prev) => {
      const existing = prev[srNo] ?? new Set<Potency>();
      const next = new Set(existing);

      if (next.has(potency)) {
        next.delete(potency);
      } else {
        next.add(potency);
      }

      const updated: ClientSelections = {
        ...prev,
        [srNo]: next,
      };

      return updated;
    });
  };

  const handleGenerateClick = () => {
    if (!patientName.trim()) {
      alert("Please enter a patient name before generating.");
      return;
    }
    if (selectionCount === 0) {
      alert("Please select at least one remedy/potency.");
      return;
    }
    onGenerate();
  };

  return (
    <div className="space-y-6">
      {/* Top: Patient + Search (static) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900">
        {/* Patient */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Client &amp; Remedy Selection
          </h2>
          <label className="block text-sm text-slate-300 mb-1" htmlFor="patient">
            Patient Name
          </label>
          <input
            id="patient"
            type="text"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter patient's full name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>

        {/* Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Search Remedies
          </h2>
          <label
            className="block text-sm text-slate-300 mb-1"
            htmlFor="remedy-search"
          >
            Filter by name or abbreviation…
          </label>
          <input
            id="remedy-search"
            type="text"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Type to search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Keynotes (static panel) */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm min-h-[180px]">
        <h2 className="text-lg font-semibold text-slate-100 mb-3">
          Remedy Keynotes
        </h2>

        {currentKeynotes && currentKeynotesTitle ? (
          <div className="text-sm text-slate-100 space-y-1">
            <div className="font-semibold text-cyan-300 mb-2">
              {currentKeynotesTitle}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-200">
                    Mental &amp; Emotional Themes
                  </span>
                  <div>{currentKeynotes.mentalEmotionalThemes}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">
                    General Themes
                  </span>
                  <div>{currentKeynotes.generalThemes}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">
                    Key Local Symptoms
                  </span>
                  <div>{currentKeynotes.keyLocalSymptoms}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-200">Worse from</span>
                  <div>{currentKeynotes.worseFrom}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">Better from</span>
                  <div>{currentKeynotes.betterFrom}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-200">
                    Sphere / Notes
                  </span>
                  <div>{currentKeynotes.notesSphere}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Click a remedy row below to see its keynotes. If no keynotes exist
            for that remedy yet, you&apos;ll see a short message instead.
          </p>
        )}
      </section>

      {/* Remedies table in its own scroll area */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm flex flex-col max-h-[460px]">
        {/* Table header row stays fixed; body scrolls */}
        <div className="border-b border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_repeat(3,60px)] gap-4">
          <span>Name</span>
          <span className="text-center">Abbreviation</span>
          {POTENCIES.map((p) => (
            <span key={p} className="text-center">
              {p}
            </span>
          ))}
        </div>

        <div className="overflow-y-auto">
          {filteredRemedies.map((remedy) => {
            const isActive = activeAbbreviation === remedy.abbreviation;

            return (
              <div
                key={remedy.srNo}
                className={`px-4 py-2 text-sm grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_repeat(3,60px)] gap-4 items-center border-b border-slate-800 cursor-pointer ${
                  isActive ? "bg-slate-800/80" : "hover:bg-slate-800/40"
                }`}
                onClick={() => setActiveAbbreviation(remedy.abbreviation)}
              >
                <div className="truncate text-slate-100" title={remedy.name}>
                  {remedy.name}
                </div>

                <div className="text-center text-slate-300">
                  {remedy.abbreviation}
                </div>

                {POTENCIES.map((p) => {
                  const checked =
                    selections[remedy.srNo]?.has(p as Potency) ?? false;

                  return (
                    <div
                      key={p}
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        checked={checked}
                        onChange={() =>
                          togglePotency(remedy.srNo, p as Potency)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredRemedies.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-400 text-center">
              No remedies match your search.
            </div>
          )}
        </div>

        {/* Bottom bar: generate button */}
        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900">
          <span className="text-xs md:text-sm text-slate-300">
            {selectionCount} {selectionCount === 1 ? "remedy" : "remedies"}{" "}
            selected
          </span>
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={!patientName.trim() || selectionCount === 0}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          >
            Generate Prescription
          </button>
        </div>
      </section>
    </div>
  );
};

export default RemedySelectionForm;
