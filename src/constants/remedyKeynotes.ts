// src/constants/remedyKeynotes.ts

export interface RemedyKeynotes {
  mentalEmotionalThemes: string;
  generalThemes: string;
  keyLocalSymptoms: string;
  worseFrom: string;
  betterFrom: string;
  notesSphere: string;
}

// Re-export the generated map
export { REMEDY_KEYNOTES } from "./remedyKeynotes.generated";
