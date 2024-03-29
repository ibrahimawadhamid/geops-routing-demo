import { Layer } from 'mobility-toolbox-js/ol';

/**
 * Layer for visualizing information about stations (default) or airports.
 * The popup contains links to station plans, station coordinates
 * and links to timetable, services, shopping, handicap information.
 *
 * <img src="img/layers/NetzkartePointLayer/layer.png" alt="Layer preview" title="Layer preview">
 *
 * Extends {@link https://mobility-toolbox-js.netlify.app/api/class/src/ol/layers/Layer%20js~Layer%20html}
 * @class
 * @param {Object} [options] Layer options.
 * @inheritdoc
 */
class MapboxStyleLayer extends Layer {
  constructor(options = {}) {
    super(options);
    this.style = options.style;
    this.mapboxLayer = options.mapboxLayer;
    this.styleLayersFilter = options.styleLayersFilter;
    this.featureInfoFilter = options.featureInfoFilter || (obj => obj);
    this.queryRenderedLayersFilter = options.queryRenderedLayersFilter;
    this.highlightedFeatures = [];
    this.selectedFeatures = [];
    this.styleLayers =
      (options.styleLayer ? [options.styleLayer] : options.styleLayers) || [];
    this.addStyleLayers = this.addStyleLayers.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.filters = options.filters;

    this.hidePopupFunc = options.hidePopup;
    if (!this.styleLayersFilter && this.styleLayers) {
      const ids = this.styleLayers.map(s => s.id);
      this.styleLayersFilter = styleLayer => {
        return ids.includes(styleLayer.id);
      };
    }
  }

  init(map) {
    super.init(map);

    if (!this.map) {
      return;
    }

    // Apply the initial visibiltity.
    const { mbMap } = this.mapboxLayer;
    if (!mbMap) {
      // If the mbMap is not yet created because the  map has no target yet, we
      // relaunch the initialisation when it's the case.
      this.olListenersKeys.push(
        this.map.on('change:target', () => {
          this.init(map);
        }),
      );

      return;
    }

    // mbMap.loaded() and mbMap.isStyleLoaded() are reliable only on the first call of init.
    // On the next call (when a topic change for example), these functions returns false because
    // the style is being modified.
    // That's why we rely on a property instead for the next calls.
    if (this.mapboxLayer.loaded || mbMap.isStyleLoaded() || mbMap.loaded()) {
      this.onLoad();
    } else {
      mbMap.once('load', this.onLoad);
    }

    // Apply the visibiltity when layer's visibility change.
    this.olListenersKeys.push(
      this.on('change:visible', () => {
        // Once the map is loaded we can apply vsiiblity without waiting
        // the style. Mapbox take care of the application of style changes.
        // pass isInit param for LevelLayer.
        this.applyLayoutVisibility(false);
      }),
    );

    // Re-apply the styleLayers if a style is loaded change.
    this.olListenersKeys.push(
      this.mapboxLayer.on('load', () => {
        this.onLoad();
      }),
    );
  }

  terminate(map) {
    const { mbMap } = this.mapboxLayer;
    if (!mbMap) {
      return;
    }

    mbMap.off('load', this.onLoad);
    this.removeStyleLayers();
    super.terminate(map);
  }

  hidePopup(feat, layer, featureInfo) {
    return this.hidePopupFunc && this.hidePopupFunc(feat, layer, featureInfo);
  }

  addStyleLayers() {
    const { mbMap } = this.mapboxLayer;

    if (!mbMap) {
      return;
    }

    this.styleLayers.forEach(styleLayer => {
      const { id, source } = styleLayer;
      if (mbMap.getSource(source) && !mbMap.getLayer(id)) {
        mbMap.addLayer(styleLayer);
      }
    });

    // pass isInit param for LevelLayer.
    this.applyLayoutVisibility(true);
  }

  removeStyleLayers() {
    const { mbMap } = this.mapboxLayer;

    if (!mbMap) {
      return;
    }

    this.styleLayers.forEach(styleLayer => {
      if (mbMap.getLayer(styleLayer.id)) {
        mbMap.removeLayer(styleLayer.id);
      }
    });
  }

  onLoad() {
    this.addStyleLayers();

    if (this.addDynamicFilters) {
      this.addDynamicFilters();
    }
  }

  /**
   * Request feature information for a given coordinate.
   * @param {ol.Coordinate} coordinate Coordinate to request the information at.
   * @returns {Promise<Object>} Promise with features, layer and coordinate
   *  or null if no feature was hit.
   */
  getFeatureInfoAtCoordinate(coordinate) {
    const { mbMap } = this.mapboxLayer;
    // Ignore the getFeatureInfo until the mapbox map is loaded
    if (!mbMap || !mbMap.isStyleLoaded()) {
      return Promise.resolve({ coordinate, features: [], layer: this });
    }
    // We query features only on style layers used by this layer.
    let layers = this.styleLayers || [];

    if (this.styleLayersFilter) {
      layers = mbMap.getStyle().layers.filter(this.styleLayersFilter);
    }

    if (this.queryRenderedLayersFilter) {
      layers = mbMap.getStyle().layers.filter(this.queryRenderedLayersFilter);
    }

    return this.mapboxLayer
      .getFeatureInfoAtCoordinate(coordinate, {
        layers: layers.map(layer => layer && layer.id),
        validate: false,
      })
      .then(featureInfo => {
        const features = featureInfo.features.filter(feature => {
          return this.featureInfoFilter(
            feature,
            this.map.getView().getResolution(),
          );
        });
        this.highlight(features);
        return { ...featureInfo, features, layer: this };
      });
  }

  /**
   * Apply visibility to style layers that fits the filter function.
   * @private
   */
  applyLayoutVisibility() {
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

    if (this.styleLayersFilter) {
      const visibilityValue = visible ? 'visible' : 'none';
      for (let i = 0; i < style.layers.length; i += 1) {
        const styleLayer = style.layers[i];
        if (this.styleLayersFilter(styleLayer)) {
          if (mbMap.getLayer(styleLayer.id)) {
            mbMap.setLayoutProperty(
              styleLayer.id,
              'visibility',
              visibilityValue,
            );
          }
        }
      }
    }
  }

  getFeatures2(resolve) {
    resolve(this.getFeatures());
  }

  setHoverState(features = [], state) {
    features.forEach(feature => {
      const { source, sourceLayer } = feature.get('mapboxFeature') || {};
      if ((!source && !sourceLayer) || !feature.getId()) {
        if (!feature.getId()) {
          // eslint-disable-next-line no-console
          console.warn(
            "No feature's id found. To use the feature state functionnality, tiles must be generated with --generate-ids. See https://github.com/mapbox/tippecanoe#adding-calculated-attributes.",
            feature.getId(),
            feature.getProperties(),
          );
        }
        return;
      }

      this.mapboxLayer.mbMap.setFeatureState(
        {
          id: feature.getId(),
          source,
          sourceLayer,
        },
        { hover: state },
      );
    });
  }

  select(features = []) {
    this.setHoverState(this.selectedFeatures, false);
    this.selectedFeatures = features;
    this.setHoverState(this.selectedFeatures, true);
  }

  highlight(features = []) {
    // Filter out selected features
    const filtered = this.highlightedFeatures.filter(feature => {
      return !this.selectedFeatures
        .map(feat => feat.getId())
        .includes(feature.getId());
    });

    // Remove previous highlight
    this.setHoverState(filtered, false);
    this.highlightedFeatures = features;

    // Add highlight
    this.setHoverState(this.highlightedFeatures, true);
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
