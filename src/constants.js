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
  'car',
];

export const VALID_MOTS = [...DEFAULT_MOTS, ...OTHER_MOTS];

export const GRAPHHOPPER_MOTS = ['foot', 'car'];

export const ROUTING_BASE_URL = 'https://api.geops.io/routing/';

export const STATION_SEARCH_BASE_URL = 'https://api.geops.io/stops/';
