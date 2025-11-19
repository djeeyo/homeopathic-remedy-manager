// src/constants/remedyKeynotes.ts

export interface RemedyKeynote {
  mentalEmotionalThemes?: string;
  generalThemes?: string;
  keyLocalSymptoms?: string;
  worseFrom?: string;
  betterFrom?: string;
  notesSphere?: string;
}

// Map by remedy abbreviation, e.g. "ABR", "ACON", etc.
export const REMEDY_KEYNOTES: Record<string, RemedyKeynote> = {
  // Example structure – you can swap this out for your real data later.
  /*
  ACON: {
    mentalEmotionalThemes: "Acute fear, panic, shock.",
    generalThemes: "Sudden onset complaints after fright or cold wind.",
    keyLocalSymptoms: "Violent, throbbing pains; dry, burning fevers.",
    worseFrom: "Cold, dry wind; night; fright.",
    betterFrom: "Fresh air; rest.",
    notesSphere: "Acute states, early stages of inflammation.",
  },
  */
};
