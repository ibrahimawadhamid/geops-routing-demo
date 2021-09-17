/**
 * The valid supported mots by the application
 * @type {string[]}
 * @category Constants
 */
export const DEFAULT_MOTS = ['rail', 'bus', 'foot'];

export const OTHER_MOTS = [
  'tram',
  'coach',
  'subway',
  'gondola',
  'funicular',
  'ferry',
];

export const VALID_MOTS = [...DEFAULT_MOTS, ...OTHER_MOTS];

export const SEARCH_MODES = ['default', 'barrier-free'];

export const FLOOR_LEVELS = [-4, -3, -2, -1, 0, '2D', 1, 2, 3, 4];

export const ROUTING_BASE_URL = 'https://api.geops.io/routing/';

export const STATION_SEARCH_BASE_URL = 'https://api.geops.io/stops/';
