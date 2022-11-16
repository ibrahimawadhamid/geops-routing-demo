/* eslint-disable no-restricted-globals */
import { Style, Circle, Stroke, Fill, Text } from 'ol/style';

// Convert '0.0' to '0'
const cleanFloor = (floor) =>
  !isNaN(floor) ? parseFloat(floor, 10).toString() : floor;

const lineStyler = (lineStyle) =>
  lineStyle.map(
    (style) =>
      new Style({
        stroke: new Stroke({
          color: style[0],
          width: style[1],
          lineDash: style[2],
        }),
      }),
  );

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

export const floorsColor = {
  '-4': '#CAF0F8',
  '-3': '#ADE8F4',
  '-2': '#90E0EF',
  '-1': '#48CAE4',
  0: '#00B4D8',
  1: '#0096C7',
  2: '#0077B6',
  3: '#023E8A',
  4: '#03045E',
};

const floorsColorGrey = {
  '-4': '#E6E6E6',
  '-3': '#D8D8D8',
  '-2': '#CACACA',
  '-1': '#A7A7A7',
  0: '#848484',
  1: '#747474',
  2: '#646464',
  3: '#434343',
  4: '#222222',
};

const getPedestrianStyleColor = (floor, activeFloor) => {
  const f = cleanFloor(floor);
  let floorColor = f === activeFloor ? floorsColor[f] : floorsColorGrey[f];
  if (activeFloor === '2D') {
    floorColor = floorsColor['0'];
  }
  return floorColor || 'black';
};

const pedestrianGeopsPointStyle = (floor, activeFloor) =>
  new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: getPedestrianStyleColor(floor, activeFloor),
      }),
    }),
  });

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

const lineStyleFunction = (mot, isHovered, floor, activeFloor, text) => {
  let style;
  if (mot === 'rail') {
    style = isHovered ? railLineHoveredStyle : railLineStyle;
  } else if (mot === 'bus') {
    style = isHovered ? busLineHoveredStyle : busLineStyle;
  } else if (mot === 'foot') {
    const floorColor = getPedestrianStyleColor(floor, activeFloor);
    style = lineStyler([[floorColor, 7, [1, 10]]]);
  } else {
    style = isHovered ? othersLineHoveredStyle : othersLineStyle;
  }
  if (text) {
    style[0].setText(
      new Text({
        text,
        scale: 2,
        fill: new Fill({
          color: 'white',
        }),
        stroke: new Stroke({
          color: [0, 0, 0],
          width: 2,
        }),
      }),
    );
  }
  return style;
};

export { lineStyleFunction, pointStyleFunction };
