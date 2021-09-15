/* eslint-disable no-restricted-globals */
import { Style, Circle, Stroke, Fill } from 'ol/style';

// Convert '0.0' to '0'
const cleanFloor = floor => {
  return !isNaN(floor) ? parseInt(floor, 10).toString() : floor;
};

const lineStyler = lineStyle => {
  return lineStyle.map(
    style =>
      new Style({
        stroke: new Stroke({
          color: style[0],
          width: style[1],
          lineDash: style[2],
        }),
      }),
  );
};

const railLineStyle = lineStyler([
  ['darkred', 6],
  ['red', 3],
]);

const railLineHoveredStyle = lineStyler([
  ['darkred', 7],
  ['red', 4],
]);

const busLineStyle = lineStyler([
  ['rgb(153,153,0)', 6],
  ['yellow', 3],
]);

const busLineHoveredStyle = lineStyler([
  ['rgb(153,153,0)', 7],
  ['yellow', 4],
]);

const othersLineStyle = lineStyler([
  ['darkblue', 6],
  ['blue', 3],
]);

const othersLineHoveredStyle = lineStyler([
  ['darkblue', 7],
  ['blue', 4],
]);

const railPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'darkred', width: 2 }),
  }),
});

const floorsColor = {
  '-4': '#CAF0F8',
  '-3': '#ADE8F4',
  '-2': '#90E0EF',
  '-1': '#48CAE4',
  '0': '#00B4D8',
  '1': '#0096C7',
  '2': '#0077B6',
  '3': '#023E8A',
  '4': '#03045E',
};

const floorsColorGrey = {
  '-4': '#E6E6E6',
  '-3': '#D8D8D8',
  '-2': '#CACACA',
  '-1': '#A7A7A7',
  '0': '#848484',
  '1': '#747474',
  '2': '#646464',
  '3': '#434343',
  '4': '#222222',
};

const pedestrianGeopsPointStyle = (floor, activeFloor) => {
  const f = cleanFloor(floor);
  const floorColor = f === activeFloor ? floorsColor[f] : floorsColorGrey[f];

  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: floorColor }),
    }),
  });
};

const busPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'yellow' }),
    stroke: new Stroke({ color: 'rgb(153,153,0)', width: 2 }),
  }),
});

const othersPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'blue' }),
    stroke: new Stroke({ color: 'darkblue', width: 2 }),
  }),
});

const pointStyleFunction = (mot, floor, activeFloor) => {
  if (mot === 'rail') {
    return railPointStyle;
  }
  if (mot === 'bus') {
    return busPointStyle;
  }
  if (mot === 'foot') {
    return pedestrianGeopsPointStyle(floor, activeFloor);
  }
  return othersPointStyle;
};

const lineStyleFunction = (mot, isHovered, floor, activeFloor) => {
  if (mot === 'rail') {
    return isHovered ? railLineHoveredStyle : railLineStyle;
  }
  if (mot === 'bus') {
    return isHovered ? busLineHoveredStyle : busLineStyle;
  }
  if (mot === 'foot') {
    const f = cleanFloor(floor);
    const floorColor = f === activeFloor ? floorsColor[f] : floorsColorGrey[f];
    const stroke = floorColor && floorColor.length ? floorColor : 'blue';
    return lineStyler([[stroke, isHovered ? 5 : 7, [1, 10]]]);
  }
  return isHovered ? othersLineHoveredStyle : othersLineStyle;
};

export { lineStyleFunction, pointStyleFunction };
