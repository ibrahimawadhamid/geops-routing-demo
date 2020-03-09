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
  ['darkred', 6, [10, 10]],
  ['red', 3, [10, 10]],
]);

const railLineHoveredStyle = lineStyler([
  ['darkred', 7, [10, 10]],
  ['red', 4, [10, 10]],
]);

const busLineStyle = lineStyler([
  ['rgb(153,153,0)', 6],
  ['yellow', 3],
]);

const busLineHoveredStyle = lineStyler([
  ['rgb(153,153,0)', 7],
  ['yellow', 4],
]);

const pedestrianLineStyle = lineStyler([
  ['rgb(96, 186, 219)', 6],
  ['rgb(173, 216, 230)', 3],
]);

const pedestrianLineHoveredStyle = lineStyler([
  ['rgb(96, 186, 219)', 7],
  ['rgb(173, 216, 230)', 4],
]);

const carLineStyle = lineStyler([['black', 5, [0.5, 10]]]);

const carLineHoveredStyle = lineStyler([['black', 6, [0.5, 10]]]);

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

const pedestrianPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({ color: 'rgb(173, 216, 230)' }),
    stroke: new Stroke({ color: 'rgb(96, 186, 219)', width: 2 }),
  }),
});

const carPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({ color: 'black' }),
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
