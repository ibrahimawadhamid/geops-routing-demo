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

const pedestrianLineStyle = lineStyler([
  ['rgb(96, 186, 219)', 6],
  ['rgb(173, 216, 230)', 3],
]);

const pedestrianLineHoveredStyle = lineStyler([
  ['rgb(96, 186, 219)', 7],
  ['rgb(173, 216, 230)', 4],
]);

const carLineStyle = lineStyler([
  ['grey', 6],
  ['darkgrey', 3],
]);

const carLineHoveredStyle = lineStyler([
  ['grey', 7],
  ['darkgrey', 4],
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

const pedestrianPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({ color: 'rgb(173, 216, 230)' }),
    stroke: new Stroke({ color: 'rgb(96, 186, 219)', width: 2 }),
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

const carPointStyle = new Style({
  image: new Circle({
    radius: 3,
    fill: new Fill({ color: 'darkgrey' }),
    stroke: new Stroke({ color: 'grey', width: 2 }),
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

const pointStyleFunction = (mot, floor) => {
  if (mot === 'rail') {
    return railPointStyle;
  }
  if (mot === 'bus') {
    return busPointStyle;
  }
  if (mot === 'foot') {
    return pedestrianPointStyle;
  }
  if (mot === 'footGeops') {
    return pedestrianGeopsPointStyle(floor);
  }
  if (mot === 'car') {
    return carPointStyle;
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
    return isHovered ? pedestrianLineHoveredStyle : pedestrianLineStyle;
  }
  if (mot === 'footGeops') {
    const floorColor = floorsColor[floor];
    const stroke = floorColor && floorColor.length ? floorColor : 'blue';
    return lineStyler([[stroke, isHovered ? 5 : 7]]);
  }
  if (mot === 'car') {
    return isHovered ? carLineHoveredStyle : carLineStyle;
  }
  return isHovered ? othersLineHoveredStyle : othersLineStyle;
};

export { lineStyleFunction, pointStyleFunction };
