import { Style, Circle, Stroke, Fill } from 'ol/style';

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
  '-4.0': '#CAF0F8',
  '-4': '#CAF0F8',
  '-3.0': '#ADE8F4',
  '-3': '#ADE8F4',
  '-2.0': '#90E0EF',
  '-2': '#90E0EF',
  '-1.0': '#48CAE4',
  '-1': '#48CAE4',
  '0.0': '#00B4D8',
  '0': '#00B4D8',
  '1.0': '#0096C7',
  '1': '#0096C7',
  '2.0': '#0077B6',
  '2': '#0077B6',
  '3.0': '#023E8A',
  '3': '#023E8A',
  '4.0': '#03045E',
  '4': '#03045E',

};

const pedestrianGeopsPointStyle = floor => {
  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: floorsColor[floor] }),
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

const pointStyleFunction = (mot, floor) => {
  if (mot === 'rail') {
    return railPointStyle;
  }
  if (mot === 'bus') {
    return busPointStyle;
  }
  if (mot === 'foot') {
    return pedestrianGeopsPointStyle(floor);
  }
  return othersPointStyle;
};

const lineStyleFunction = (mot, isHovered, floor) => {
  if (mot === 'rail') {
    return isHovered ? railLineHoveredStyle : railLineStyle;
  }
  if (mot === 'bus') {
    return isHovered ? busLineHoveredStyle : busLineStyle;
  }
  if (mot === 'foot') {
    const floorColor = floorsColor[floor];
    const stroke = floorColor && floorColor.length ? floorColor : 'blue';
    return lineStyler([[stroke, isHovered ? 5 : 7, [1, 10]]]);
  }
  return isHovered ? othersLineHoveredStyle : othersLineStyle;
};

export { lineStyleFunction, pointStyleFunction };
