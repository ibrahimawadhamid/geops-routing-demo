import { MapboxStyleLayer as MTMapboxStyleLayer } from 'mobility-toolbox-js/ol';

class MapboxStyleLayer extends MTMapboxStyleLayer {
  constructor(options = {}) {
    super({ ...options, isHoverActive: false, isClickActive: false });

    this.style = options.style;
    this.filters = options.filters;
    this.hidePopupFunc = options.hidePopup;
  }

  hidePopup(feat, layer, featureInfo) {
    return this.hidePopupFunc && this.hidePopupFunc(feat, layer, featureInfo);
  }

  /**
   * Apply visibility to style layers that fits the filter function.
   * @private
   */
  applyLayoutVisibility(evt) {
    const { visible } = this;
    const { mbMap } = this.mapboxLayer;

    if (!mbMap) {
      return;
    }

    const style = mbMap.getStyle();

    if (!style) {
      return;
    }

    if (this.style && visible) {
      this.mapboxLayer.setStyle(this.style);
    }

    super.applyLayoutVisibility(evt);
  }

  /**
   * Create exact copy of the MapboxLayer
   * @returns {MapboxLayer} MapboxLayer
   */
  clone(newOptions) {
    return new MapboxStyleLayer({ ...this.options, ...newOptions });
  }
}

export default MapboxStyleLayer;
