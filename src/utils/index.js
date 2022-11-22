import findMotIcon from './findMotIcon';
import { to4326, to3857 } from './projection';
import { graphs, getGeneralization } from './generalization';

export { default as findMotIcon } from './findMotIcon';
export { to4326, to3857 } from './projection';
export { graphs, default as getGeneralization } from './generalization';

export default {
  findMotIcon,
  to4326,
  to3857,
  graphs,
  getGeneralization,
};
