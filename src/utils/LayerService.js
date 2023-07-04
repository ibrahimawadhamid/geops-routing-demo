/**
 * A layer service class to handle layer adding, removing and visiblity.
 */
export default class LayerService {
  constructor(layers) {
    this.layers = layers || [];
  }

  getLayers() {
    return this.layers;
  }

  setLayers(layers) {
    this.layers = layers;
  }

  getLayersAsFlatArray(optLayers) {
    let layers = [];
    (optLayers || this.getLayers() || []).forEach((l) => {
      layers.push(l);
      const { children } = l;
      layers = layers.concat(this.getLayersAsFlatArray(children || []));
    });
    return layers;
  }

  getLayer(name) {
    return this.getLayersAsFlatArray().find((l) => {
      return l.name === name;
    });
  }

  addLayer(layer) {
    this.layers.push(layer);
  }
}
