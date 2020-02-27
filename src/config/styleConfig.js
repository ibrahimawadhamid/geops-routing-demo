import { Style, Circle, Stroke, Fill } from 'ol/style';

const railLineStyle = [
  new Style({
    stroke: new Stroke({
      color: 'black',
      lineDash: [10, 10],
      width: 5,
    }),
  }),
  new Style({
    stroke: new Stroke({
      color: 'red',
      lineDash: [10, 10],
      width: 3,
    }),
  }),
];

const busLineStyle = [
  new Style({
    stroke: new Stroke({
      color: 'black',
      width: 5,
    }),
  }),
  new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 3,
    }),
  }),
];

const pedestrianLineStyle = [
  new Style({
    stroke: new Stroke({
      color: 'rgb(173, 216, 230)',
      width: 3,
    }),
  }),
];

const carLineStyle = [
  new Style({
    stroke: new Stroke({
      color: 'black',
      lineDash: [0.5, 10],
      width: 5,
    }),
  }),
];

const othersLineStyle = [
  new Style({
    stroke: new Stroke({
      color: 'black',
      width: 5,
    }),
  }),
  new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
  }),
];

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
  if (mot === 'car' || mot === 'truck') {
    return undefined;
  }
  return othersPointStyle;
};

const lineStyleFunction = mot => {
  if (mot === 'rail') {
    return railLineStyle;
  }
  if (mot === 'bus') {
    return busLineStyle;
  }
  if (mot === 'foot') {
    return pedestrianLineStyle;
  }
  if (mot === 'car' || mot === 'truck') {
    return carLineStyle;
  }
  return othersLineStyle;
};

export { lineStyleFunction, pointStyleFunction };
