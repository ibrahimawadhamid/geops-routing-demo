/**
 * The valid supported mots by the application
 * @type {string[]}
 * @category Constants
 */
const DEFAULT_MOTS = ['rail', 'bus', 'coach', 'pedestrian'];

const OTHER_MOTS = [
  'tram',
  'subway',
  'gondola',
  'funicular',
  'ferry',
  'car',
  'truck',
];

// car, truck, pedestrian

const VALID_MOTS = [...DEFAULT_MOTS, ...OTHER_MOTS];

export default {
  DEFAULT_MOTS,
  OTHER_MOTS,
  VALID_MOTS,
};
