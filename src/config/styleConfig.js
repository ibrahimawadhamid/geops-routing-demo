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
  ['black', 5, [10, 10]],
  ['red', 3, [10, 10]],
]);

const railLineHoveredStyle = lineStyler([
  ['black', 6, [10, 10]],
  ['red', 4, [10, 10]],
]);

const busLineStyle = lineStyler([
  ['black', 5],
  ['yellow', 3],
]);

const busLineHoveredStyle = lineStyler([
  ['black', 6],
  ['yellow', 4],
]);

const pedestrianLineStyle = lineStyler([['rgb(173, 216, 230)', 3]]);
const pedestrianLineHoveredStyle = lineStyler([['rgb(173, 216, 230)', 5]]);

const carLineStyle = lineStyler([['black', 5, [0.5, 10]]]);

const carLineHoveredStyle = lineStyler([['black', 6, [0.5, 10]]]);

const othersLineStyle = lineStyler([
  ['black', 5],
  ['blue', 3],
]);

const othersLineHoveredStyle = lineStyler([
  ['black', 6],
  ['blue', 4],
]);

const railPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'black', width: 2 }),
  }),
});

const pedestrianPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'rgb(173, 216, 230)' }),
  }),
});

const carPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'black' }),
  }),
});

const busPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'yellow' }),
    stroke: new Stroke({ color: 'black', width: 2 }),
  }),
});

const othersPointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({ color: 'blue' }),
    stroke: new Stroke({ color: 'black', width: 2 }),
  }),
});

const pointStyleFunction = mot => {
  if (mot === 'rail') {
    return railPointStyle;
  }
  if (mot === 'bus') {
    return busPointStyle;
  }
  if (mot === 'foot') {
    return pedestrianPointStyle;
  }
  if (mot === 'car') {
    return carPointStyle;
  }
  return othersPointStyle;
};

const lineStyleFunction = (mot, isHovered) => {
  if (mot === 'rail') {
    return isHovered ? railLineHoveredStyle : railLineStyle;
  }
  if (mot === 'bus') {
    return isHovered ? busLineHoveredStyle : busLineStyle;
  }
  if (mot === 'foot') {
    return isHovered ? pedestrianLineHoveredStyle : pedestrianLineStyle;
  }
  if (mot === 'car') {
    return isHovered ? carLineHoveredStyle : carLineStyle;
  }
  return isHovered ? othersLineHoveredStyle : othersLineStyle;
};

export { lineStyleFunction, pointStyleFunction };
