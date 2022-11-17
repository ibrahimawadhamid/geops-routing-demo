import { transform } from 'ol/proj';

export const to4326 = (coord, decimal = 5) => {
  return transform(coord, 'EPSG:3857', 'EPSG:4326').map((c) =>
    c.toFixed(decimal),
  );
};

export const to3857 = (coord) => {
  return transform(coord, 'EPSG:4326', 'EPSG:3857');
};
