// src/constants/remedyKeynotes.ts

export interface RemedyKeynotes {
  mentalEmotionalThemes: string;
  generalThemes: string;
  keyLocalSymptoms: string;
  worseFrom: string;
  betterFrom: string;
  notesSphere: string;
}

// Map remedy ABBREVIATION -> keynotes
export const REMEDY_KEYNOTES: Record<string, RemedyKeynotes> = {
  // Example: ABRUS PRECATORIUS - JEQUIRITY (ABR)
  ABR: {
    mentalEmotionalThemes:
      'Irritable, oversensitive; feels attacked or persecuted; difficulty letting go.',
    generalThemes:
      'Marked affinity for mucous membranes; intense inflammation and ulceration.',
    keyLocalSymptoms:
      'Severe conjunctivitis; burning, smarting eyes; photophobia; profuse lacrimation.',
    worseFrom: 'Drafts, bright light, touch, exertion.',
    betterFrom: 'Resting in dark room, cold applications to eyes.',
    notesSphere: 'Primarily an eye remedy; think of it in violent conjunctivitis/keratitis.',
  },

  // Example: AMMONIUM PICRICUM (AM-PIC)
  'AM-PIC': {
    mentalEmotionalThemes:
      'Mental fatigue, dullness, prostration from long mental effort.',
    generalThemes:
      'Great tiredness, weakness, especially after exertion or overwork.',
    keyLocalSymptoms:
      'Headaches from mental strain; heaviness of head; tired, aching limbs.',
    worseFrom: 'Mental exertion, prolonged study, heat.',
    betterFrom: 'Rest, lying down, cool air.',
    notesSphere:
      'Useful in states of neurasthenia and exhaustion from long-continued brain work.',
  },

  // Add the rest of your remedies here, using the abbreviation as the key…
  // 'ACON': { ... },
  // 'ARN': { ... },
};
