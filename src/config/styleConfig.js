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
  '-2.0': 'pink',
  '-2': 'pink',
  '-1.0': 'darkgrey',
  '-1': 'darkgrey',
  '0.0': 'blue',
  '0': 'blue',
  '1.0': 'yellow',
  '1': 'yellow',
  '2.0': 'green',
  '2': 'green',
  '3.0': 'orange',
  '3': 'orange',
  '4.0': 'blueviolet',
  '4': 'blueviolet',
  '0.5': 'lightblue',
  '-0.5': 'lightgreen',
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
