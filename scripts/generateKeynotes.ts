// scripts/generateKeynotes.ts
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type RawRow = {
  Abbreviation: string;
  Mental_Emotional_Themes: string;
  General_Themes: string;
  Key_Local_Symptoms: string;
  Worse_From: string;
  Better_From: string;
  Notes_Sphere: string;
};

// Resolve paths from project root (works in ESM/CommonJS)
const projectRoot = process.cwd();
const csvPath = path.resolve(projectRoot, "src/data/RemedyKeynotesSheet.csv");
const outPath = path.resolve(
  projectRoot,
  "src/constants/remedyKeynotes.generated.ts",
);

// --- Read & parse CSV ---

const csvText = fs.readFileSync(csvPath, "utf8");

const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
}) as RawRow[];

const map: Record<string, any> = {};

for (const row of records) {
  const abbr = row.Abbreviation?.trim().toUpperCase();
  if (!abbr) continue;

  map[abbr] = {
    mentalEmotionalThemes: (row.Mental_Emotional_Themes || "").trim(),
    generalThemes: (row.General_Themes || "").trim(),
    keyLocalSymptoms: (row.Key_Local_Symptoms || "").trim(),
    worseFrom: (row.Worse_From || "").trim(),
    betterFrom: (row.Better_From || "").trim(),
    notesSphere: (row.Notes_Sphere || "").trim(),
  };
}

const fileContents = `// AUTO-GENERATED from RemedyKeynotesSheet.csv – do not edit by hand
import type { RemedyKeynotes } from "./remedyKeynotes";

export const REMEDY_KEYNOTES: Record<string, RemedyKeynotes> = ${JSON.stringify(
  map,
  null,
  2,
)} as const;
`;

fs.writeFileSync(outPath, fileContents, "utf8");
console.log("Generated", Object.keys(map).length, "keynote entries at", outPath);
