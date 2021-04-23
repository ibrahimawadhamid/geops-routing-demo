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

const pointStyleFunction = floor => {
  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: floorsColor[floor] }),
    }),
  });
};

const lineStyleFunction = (floor, isHovered) => {
  const floorColor = floorsColor[floor];
  const stroke = floorColor && floorColor.length ? floorColor : 'blue';
  return lineStyler([[stroke, isHovered ? 5 : 7]]);
};

export { lineStyleFunction, pointStyleFunction };
