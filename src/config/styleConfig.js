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
/*
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
*/
const pointStyleFunction = () => {
  return new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: 'blue' }),
      stroke: new Stroke({ color: 'darkblue', width: 2 }),
    }),
  });
};

const floorsColor = {
  '-2': ['pink', 'hotpink'],
  '-1': ['darkgrey', 'grey'],
  '0': ['red', 'darkred'],
  '1': ['yellow', 'rgb(153,153,0)'],
  '2': ['green', 'darkgreen'],
  '3': ['orange', 'darkorange'],
  '4': ['blueviolet', 'purple'],
};

const lineStyleFunction = (floor, isHovered) => {
  const floorColor = floorsColor[floor];
  const stroke = floorColor && floorColor.length ? floorColor[0] : 'blue';
  return lineStyler([[stroke, isHovered ? 5 : 7]]);
};

export { lineStyleFunction, pointStyleFunction };
