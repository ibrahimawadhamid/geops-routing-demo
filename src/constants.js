/**
 * The valid supported mots by the application
 * @type {string[]}
 * @category Constants
 */
export const DEFAULT_MOTS = ['rail', 'bus', 'foot'];

export const OTHER_MOTS = [
  'tram',
  'subway',
  'gondola',
  'funicular',
  'ferry',
  'car',
];

export const VALID_MOTS = [...DEFAULT_MOTS, ...OTHER_MOTS];

export const GRAPHHOPPER_MOTS = ['foot', 'car'];

export const SEARCH_MODES = ['default', 'barrier-free'];
