import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import qs from 'query-string';
import { Layer, MapboxLayer, MapboxStyleLayer } from 'mobility-toolbox-js/ol';
import BasicMap from 'react-spatial/components/BasicMap';
import { Map, Feature } from 'ol';
import { containsExtent } from 'ol/extent';
import { Vector as VectorLayer } from 'ol/layer';
import { MultiLineString, Point } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { unByKey } from 'ol/Observable';
import {
  defaults as defaultInteractions,
  Translate,
  Modify,
} from 'ol/interaction';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import { touchOnly } from 'ol/events/condition';
import MapFloorSwitcher from '../MapFloorSwitcher';
import RoutingMenu from '../RoutingMenu';
import FloorSwitcher from '../FloorSwitcher';
import LevelLayer from '../../layers/LevelLayer';
import { to4326 } from '../../utils';
import {
  lineStyleFunction,
  pointStyleFunction,
} from '../../config/styleConfig';
import {
  propTypeCoordinates,
  propTypeCurrentStops,
  propTypeCurrentStopsGeoJSON,
} from '../../store/prop-types';
import { FLOOR_LEVELS, DACH_EXTENT, EUROPE_EXTENT } from '../../constants';
import './MapComponent.scss';
import * as actions from '../../store/actions';

/**
 * The map props
 * @typedef MapComponentProps
 * @type {props}
 * @property {string} APIKey key obtained from geOps that enables you to used the previous API services.
 * @property {string} routingUrl The API routing url to be used for navigation.
 * @property {string} currentMot The current selected mot by user, example 'bus'.
 * @property {Object} currentStopsGeoJSON The current stops defined by user in geojson format inside a dictionary, key is the stop index(order) and the value is the geoJSON itself.
 * @property {function} onShowNotification A store action that can be dispatched, takes the notification message and type as arguments.
 * @property {function} onSetClickLocation A store action that can be dispatched, takes the clicked location on map array of [long,lat] and stores it in the store.
 * @category Props
 */

let abortController = new AbortController();
const zoom = 6;
let cbKey = null;

/**
 * The only true map that shows inside the application.
 * @category Map
 */
class MapComponent extends PureComponent {
  static getExtentCenter = extent => {
    const X = extent[0] + (extent[2] - extent[0]) / 2;
    const Y = extent[1] + (extent[3] - extent[1]) / 2;
    return [X, Y];
  };

  static indexInGeom = (lineGeom, point) => {
    const firstBreakIdx = lineGeom.indexOf(point[0]);
    const secondBreakIdx = lineGeom.indexOf(point[1]);

    return firstBreakIdx === secondBreakIdx - 1;
  };

  /**
   * Default constructor, gets called automatically upon initialization.
   * @param {...MapComponentProps} props Props received so that the component can function properly.
   * @category Map
   */
  constructor(props) {
    super(props);
    const {
      APIKey,
      onSetClickLocation,
      olMap,
      activeFloor,
      layerService,
    } = this.props;
    this.map = olMap;
    this.hoveredRoute = null;
    this.initialRouteDrag = null;
    this.state = {
      hoveredStationName: null,
      isActiveRoute: false,
      hoveredPoint: null,
    };
    this.onHighlightPoint = this.onHighlightPoint.bind(this);

    this.projection = 'EPSG:3857';
    this.format = new GeoJSON();
    this.formatFromLonLat = new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    const dataLayer = new MapboxLayer({
      name: 'data',
      visible: true,
      url: `https://maps.geops.io/styles/base_bright_v2/style.json?key=${APIKey}`,
    });

    const baseLayerOthers = new MapboxStyleLayer({
      name: 'basemap.others',
      mapboxLayer: dataLayer,
      isBaseLayer: true,
      visible: false,
      styleLayersFilter: ({ metadata }) => {
        return (
          metadata &&
          metadata['routing.filter'] === 'perimeter_mask_routing_europe'
        );
      },
    });

    const baseLayerFoot = new MapboxStyleLayer({
      name: 'basemap.foot',
      mapboxLayer: dataLayer,
      isBaseLayer: true,
      visible: false,
      styleLayersFilter: ({ metadata }) => {
        return (
          metadata &&
          metadata['routing.filter'] === 'perimeter_mask_routing_dach'
        );
      },
    });

    layerService.addLayer(dataLayer);
    layerService.addLayer(baseLayerOthers);
    layerService.addLayer(baseLayerFoot);

    this.toggleBasemapMask(layerService.getLayer('data'));

    // Define LevelLayer
    const geschosseLayer = new Layer({
      name: 'ch.sbb.geschosse',
      visible: true,
    });

    geschosseLayer.children = FLOOR_LEVELS.map(level => {
      return new LevelLayer({
        name: `ch.sbb.geschosse${level}`,
        visible: level === activeFloor,
        mapboxLayer: dataLayer,
        styleLayersFilter: ({ metadata }) =>
          metadata &&
          (metadata['geops.filter'] === '2D' ||
            metadata['geops.filter'] === 'level') &&
          // Return the filter if it exists
          metadata['geops.filter'],
        level,
        properties: {
          radioGroup: 'ch.sbb.geschosse-layer',
        },
      });
    });
    layerService.addLayer(geschosseLayer);

    // Define route vectorLayer.
    this.routeVectorSource = new VectorSource({
      features: [],
    });
    layerService.addLayer(
      new Layer({
        key: 'routeLayer',
        name: 'routeLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.routeVectorSource,
          style: feature => {
            const { currentMot, activeFloor: activeFloorr } = this.props;
            return lineStyleFunction(
              currentMot,
              this.hoveredRoute === feature,
              feature.get('floor'),
              activeFloorr,
            );
          },
        }),
      }),
    );

    // Define highlight vectorLayer.
    this.highlightVectorSource = new VectorSource({});
    layerService.addLayer(
      new Layer({
        key: 'highlightLayer',
        name: 'highlightLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.highlightVectorSource,
        }),
      }),
    );

    // Define stop vectorLayer.
    this.markerVectorSource = new VectorSource({});
    layerService.addLayer(
      new Layer({
        key: 'markerLayer',
        name: 'markerLayer',
        olLayer: new VectorLayer({
          zIndex: 1,
          source: this.markerVectorSource,
        }),
      }),
    );

    this.markerVectorLayer = layerService.getLayer('markerLayer');
    this.routeVectorLayer = layerService.getLayer('routeLayer');
    this.layers = [...layerService.getLayers()];

    const translate = new Translate({
      layers: [this.markerVectorLayer.olLayer],
      hitTolerance: 3,
    });

    translate.on('translateend', evt => {
      const {
        tracks,
        onSetTracks,
        currentStops,
        currentStopsGeoJSON,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;

      const { name, id } = evt.features.getArray()[0].getProperties();
      let featureIndex;
      if (name) {
        // It's a station
        featureIndex = currentStops.indexOf(name);
      } else {
        // It's a coordinate
        featureIndex = currentStops.findIndex(element => {
          return element.toString() === id;
        });
      }

      if (featureIndex === -1) {
        return;
      }

      currentStops[featureIndex] = evt.coordinate;

      tracks[featureIndex] = '';
      // Dont' set floor here, let FloorSelect the responsability to change it if the current floors is not in the avalbleLevels
      // floorInfo[featureIndex] = '0';
      currentStopsGeoJSON[featureIndex] = {
        type: 'Feature',
        properties: {
          id: evt.coordinate.toString(),
          type: 'coordinates',
        },
        geometry: {
          type: 'Point',
          coordinates: evt.coordinate,
        },
      };
      onSetTracks([...tracks]);
      // onSetFloorInfo([...floorInfo]);
      onSetCurrentStops([...currentStops]);
      onSetCurrentStopsGeoJSON([...currentStopsGeoJSON]);
    });

    const modify = new Modify({
      source: this.routeVectorSource,
      pixelTolerance: 4,
      style: () => {
        const { currentMot } = this.props;
        return pointStyleFunction(currentMot);
      },
    });

    modify.on('modifystart', evt => {
      // save start point to find where to add the new HOP!
      this.initialRouteDrag = {
        features: evt.features.getArray(),
        coordinate: evt.mapBrowserEvent.coordinate,
      };
    });

    modify.on('modifyend', evt => {
      const { features } = this.initialRouteDrag;
      const {
        tracks,
        floorInfo,
        currentStops,
        currentStopsGeoJSON,
        onSetTracks,
        onSetFloorInfo,
        onSetCurrentStops,
        onSetCurrentStopsGeoJSON,
      } = this.props;
      let newHopIdx = -1;

      // A segment is a linestring between to hops (also called via points).
      // It's used to determine where to add the new hop.
      let segments = features;

      let currHop = null;
      let multiLineString = null;
      const { currentMot } = this.props;

      // In the case of the foot routing we can receive multiple line string between 2 hops (ex: one line string pro floor).
      // So we have to re create the segment between 2 hops to be able to find the segment where to add the new hop.
      if (currentMot === 'foot') {
        segments = [];
        for (let i = 0; i < features.length; i += 1) {
          const feature = features[i];
          let hop = null;
          if (feature.get('src')) {
            hop = `${feature.get('src').join()}-${feature.get('trg').join()}`;
          }
          const clone = feature.getGeometry().clone();
          if (currHop === hop || !hop) {
            multiLineString.appendLineString(clone);
          } else {
            currHop = hop;
            multiLineString = new MultiLineString(clone);
            segments.push(new Feature(multiLineString));
          }
        }
      }

      const flatCoords = segments
        .map(f => f.getGeometry())
        .map(geom => {
          return [...geom.getFirstCoordinate(), ...geom.getLastCoordinate()];
        });

      const multiLineSource = new VectorSource({
        features: segments,
      });
      const closestSegment = multiLineSource
        .getClosestFeatureToCoordinate(this.initialRouteDrag.coordinate)
        .getGeometry();

      const closestEdges = [
        ...closestSegment.getFirstCoordinate(),
        ...closestSegment.getLastCoordinate(),
      ];

      flatCoords.forEach((segment, idx) => {
        if (
          segment.length === closestEdges.length &&
          segment.every((value, index) => {
            return value === closestEdges[index];
          })
        ) {
          newHopIdx = idx + 1;
        }
      });

      if (newHopIdx >= 0) {
        tracks.splice(newHopIdx, 0, '');
        floorInfo.splice(newHopIdx, 0, '0');
        currentStops.splice(newHopIdx, 0, evt.mapBrowserEvent.coordinate);
        currentStopsGeoJSON.splice(newHopIdx, 0, {
          type: 'Feature',
          properties: {
            id: evt.mapBrowserEvent.coordinate.toString(),
            type: 'coordinates',
          },
          geometry: {
            type: 'Point',
            coordinates: evt.mapBrowserEvent.coordinate,
          },
        });

        onSetTracks([...tracks]);
        onSetFloorInfo([...floorInfo]);
        onSetCurrentStops([...currentStops]);
        onSetCurrentStopsGeoJSON([...currentStopsGeoJSON]);
      }
      this.initialRouteDrag = null;
    });

    const interactions = defaultInteractions().extend([modify, translate]);
    interactions.getArray().forEach(interaction => {
      this.map.addInteraction(interaction);
    });

    this.onZoomRouteClick = () => {
      let featExtent;
      if (this.routeVectorSource.getFeatures().length) {
        featExtent = this.routeVectorSource.getExtent();
      }

      if (featExtent.filter(f => Number.isFinite(f)).length === 4) {
        this.map.getView().fit(this.routeVectorSource.getExtent(), {
          size: this.map.getSize(),
          duration: 500,
          padding: [50, 50, 50, 50],
        });
      }
    };

    this.onPanViaClick = (item, idx) => {
      const { currentStopsGeoJSON } = this.props;
      if (currentStopsGeoJSON && currentStopsGeoJSON[idx]) {
        const featureCoord = currentStopsGeoJSON[idx].geometry.coordinates;

        this.map.getView().animate({
          center: featureCoord,
          duration: 500,
          padding: [100, 100, 100, 100],
        });
      }
    };

    this.map.on('singleclick', evt => {
      const { isFieldFocused, currentStops } = this.props;
      // if one field empty or if a field is focused
      if (currentStops.includes('') || isFieldFocused) {
        onSetClickLocation(evt.coordinate);
      }
    });
    this.initialize();
  }

  /**
   * Perform the necessary actions when receiving updated props.
   * If new stops are received, then remove any existing stops/routes and draw those stops/routes.
   * @category Map
   */
  componentDidUpdate(prevProps) {
    const {
      currentStopsGeoJSON,
      currentMot,
      floorInfo,
      searchMode,
      tracks,
      activeFloor,
      layerService,
      onSetMaxExtent,
      dispatchSetActiveFloor,
    } = this.props;
    const currentMotChanged = currentMot && currentMot !== prevProps.currentMot;
    const tracksChanged = tracks !== prevProps.tracks;
    const floorInfoChanged = floorInfo !== prevProps.floorInfo;
    const searchModeChanged = searchMode !== prevProps.searchMode;
    const currentStopsGeoJSONChanged =
      currentStopsGeoJSON &&
      currentStopsGeoJSON !== prevProps.currentStopsGeoJSON;
    const activeFloorChanged = activeFloor !== prevProps.activeFloor;

    if (
      floorInfoChanged ||
      currentMotChanged ||
      currentStopsGeoJSONChanged ||
      searchModeChanged ||
      tracksChanged ||
      activeFloorChanged
    ) {
      this.markerVectorSource.clear();
      currentStopsGeoJSON.forEach(val => {
        if (!val) {
          return;
        }
        this.markerVectorSource.addFeatures(this.format.readFeatures(val));
        if (currentMot === 'foot') {
          this.markerVectorSource.getFeatures().forEach((feature, idx) => {
            feature.setStyle(
              pointStyleFunction(currentMot, floorInfo[idx], activeFloor),
            );
          });
        } else {
          this.markerVectorSource
            .getFeatures()
            .forEach(f => f.setStyle(pointStyleFunction(currentMot)));
        }
      });
      // Remove the old route if exists
      this.routeVectorSource.clear();
      this.setIsActiveRoute(false);

      // Draw a new route if more than 1 stop is defined
      if (currentStopsGeoJSON.length > 1) {
        this.drawNewRoute();
      }

      if (currentMotChanged) {
        this.toggleBasemapMask(layerService.getLayer('data'));
        onSetMaxExtent(currentMot === 'foot' ? DACH_EXTENT : EUROPE_EXTENT);
      }

      if (
        currentMot &&
        currentMot !== prevProps.currentMot &&
        !layerService.getLayer(`ch.sbb.geschosse2D`).visible
      ) {
        dispatchSetActiveFloor('2D');
      }
    }

    if (activeFloorChanged) {
      layerService.getLayer(`ch.sbb.geschosse`).children.forEach(layer => {
        layer.setVisible(false);
      });
      const layer = layerService.getLayer(`ch.sbb.geschosse${activeFloor}`);
      if (layer) {
        layer.setVisible(true);
      }
    }
  }

  onMapMoved = evt => {
    const { center, onSetCenter } = this.props;
    const newCenter = evt.map.getView().getCenter();
    if (center[0] !== newCenter[0] || center[1] !== newCenter[1]) {
      onSetCenter(newCenter);
    }
  };

  /*
   *  Highlight a point on the route.
   */
  onHighlightPoint(coords) {
    const { currentMot } = this.props;

    this.highlightVectorSource.clear();
    const feat = new Feature({
      geometry: new Point(coords),
    });
    feat.setStyle(pointStyleFunction(currentMot));
    this.highlightVectorSource.addFeatures([feat]);
  }

  onFeaturesHover(features) {
    if (this.map.getTargetElement()) {
      this.map.getTargetElement().style.cursor = features.length
        ? 'pointer'
        : 'inherit';
    }
  }

  setIsActiveRoute(isActiveRoute) {
    this.setState({ isActiveRoute });
  }

  /**
   * After receiving the updated stops, send a call to the routingAPI to find a suitable route between
   * two points/stations, if a route is found, it's returned and drawn to the map.
   * @category Map
   */
  drawNewRoute = useElevation => {
    const hops = [];
    const {
      currentStopsGeoJSON,
      routingUrl,
      currentMot,
      APIKey,
      resolveHops,
      floorInfo,
      onShowNotification,
      onSetShowLoadingBar,
      onSetSelectedRoutes,
      searchMode,
      tracks,
      isRouteInfoOpen,
    } = this.props;

    onSetShowLoadingBar(true);

    // find the index and use this instead.
    currentStopsGeoJSON.forEach((val, idx) => {
      if (!val) {
        return;
      }
      if (!val.properties.uid) {
        // If the current item is a point selected on the map, not a station.
        hops.push(
          `${to4326(val.geometry.coordinates)
            .slice()
            .reverse()}${
            currentMot === 'foot' && floorInfo && floorInfo[idx] !== null
              ? `${floorInfo[idx] ? `$${floorInfo[idx]}` : ''}`
              : ''
          }`,
        );
      } else {
        hops.push(
          `!${val.properties.uid}${
            tracks[idx] !== null
              ? `${tracks[idx] ? `$${tracks[idx]}` : ''}`
              : ''
          }`,
        );
      }
    });

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const calculateElevation = !!(isRouteInfoOpen || useElevation);
    let reqUrl =
      `${routingUrl}` +
      `?via=${hops.join(
        '|',
      )}&mot=${currentMot}&resolve-hops=${resolveHops}&key=${APIKey}` +
      `&elevation=${calculateElevation ? 1 : 0}` +
      `&interpolate_elevation=${calculateElevation}` +
      `&length=true&coord-radius=100.0&coord-punish=1000.0` +
      `&barrierefrei=${searchMode === 'barrier-free' ? 'true' : 'false'}`;

    const { graph } = qs.parse(window.location.search);

    if (graph) {
      reqUrl += `&graph=${graph}`;
    }

    return fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        const { maxExtent } = this.props;
        onSetShowLoadingBar(false);
        if (response.error) {
          onShowNotification("Couldn't find route", 'error');
          onSetSelectedRoutes([]);
          return;
        }
        // A route was found, prepare to draw it.
        this.routeVectorSource.clear();
        const feats = this.formatFromLonLat.readFeatures(response);
        this.routeVectorSource.addFeatures(feats);

        if (!containsExtent(maxExtent, this.routeVectorSource.getExtent())) {
          // Throw error message, clear route and abort if the route is outside map max extent (e.g. when switching to foot routing)
          this.routeVectorSource.clear();
          onShowNotification('Defined route is outside map extent', 'error');
          return;
        }

        this.setIsActiveRoute(!!this.routeVectorSource.getFeatures().length);

        // Don't use this.routeVectorSource.getFeatures() here, we need to keep the order.
        onSetSelectedRoutes(feats);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.warn(`Abort ${reqUrl}`);
          return;
        }
        onSetShowLoadingBar(false);
        onSetSelectedRoutes([]);
        // It's important to rethrow all other errors so you don't silence them!
        // For example, any error thrown by setState(), will pass through here.
        throw err;
      });
  };

  toggleBasemapMask(mapboxLayer) {
    const { currentMot, layerService } = this.props;

    if (!mapboxLayer.loaded) {
      unByKey(cbKey);
      cbKey = mapboxLayer.once('load', () => {
        this.toggleBasemapMask(mapboxLayer);
      });
    } else {
      layerService.getLayer('basemap.others').setVisible(currentMot !== 'foot');
      layerService.getLayer('basemap.foot').setVisible(currentMot === 'foot');
    }
  }

  initialize() {
    this.map.on('pointermove', evt => {
      if (
        touchOnly(evt) ||
        this.map.getView().getAnimating() ||
        this.map.getView().getInteracting()
      ) {
        return;
      }
      let hoveredRoute = null;
      let name = null;

      const hoveredFeatures = this.map.getFeaturesAtPixel(evt.pixel, {
        hitTolerance: 2,
      });
      hoveredFeatures.forEach(feature => {
        // if the feature is a via point or a route point to modify.
        if (feature.getGeometry().getType() === 'Point') {
          name = feature.get('name');
          if (name) {
            const featCountryCode = feature.get('country_code');
            name = `${name}${featCountryCode ? ` - ${featCountryCode}` : ''}`;
          }
          this.setState({
            // Display the name of a station or the coordinate of the point
            hoveredStationName:
              name || `${to4326(feature.getGeometry().getCoordinates())}`,
          });
        }
        // if the feature is a route
        if (
          ['MultiLineString', 'LineString'].includes(
            feature.getGeometry().getType(),
          )
        ) {
          hoveredRoute = feature;

          this.setState({
            // Update the tooltip in route info dialog
            hoveredPoint: evt.coordinate,

            // Display the coordinate on the route or the name of a via point
            hoveredStationName: name || `${to4326(evt.coordinate)}`,
          });
        }
      });

      if (hoveredFeatures.length === 0) {
        this.setState({ hoveredStationName: null });
      }

      // If the hovered route has changed we update the hover effect
      if (this.hoveredRoute !== hoveredRoute) {
        this.hoveredRoute = hoveredRoute;

        // Update the style
        this.routeVectorLayer.olLayer.changed();

        if (!this.hoveredRoute) {
          this.setState({
            hoveredPoint: null,
            hoveredStationName: null,
          });
        }
      }
    });
  }

  /**
   * Render the map component to the dom
   * @category Map
   */
  render() {
    const {
      center,
      mots,
      currentMot,
      APIKey,
      selectedRoutes,
      stationSearchUrl,
    } = this.props;

    const { isActiveRoute, hoveredPoint, hoveredStationName } = this.state;

    return (
      <>
        <RoutingMenu
          mots={mots}
          stationSearchUrl={stationSearchUrl}
          isActiveRoute={isActiveRoute}
          onZoomRouteClick={this.onZoomRouteClick}
          onPanViaClick={this.onPanViaClick}
          onDrawNewRoute={this.drawNewRoute}
          APIKey={APIKey}
          routes={selectedRoutes}
          hoveredCoords={hoveredPoint}
          onHighlightPoint={this.onHighlightPoint}
          clearHighlightPoint={() => {
            this.highlightVectorSource.clear();
          }}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={!!hoveredStationName}
          message={hoveredStationName}
        />
        <BasicMap
          center={center}
          layers={this.layers}
          onMapMoved={evt => this.onMapMoved(evt)}
          onFeaturesHover={evt => this.onFeaturesHover(evt)}
          zoom={zoom}
          tabIndex={null}
          map={this.map}
          viewOptions={{
            projection: this.projection,
            extent: EUROPE_EXTENT,
          }}
        />
        {currentMot === 'foot' && this.map.getView().getZoom() >= 14 ? (
          <FloorSwitcher />
        ) : null}
        {currentMot === 'foot'
          ? (() => {
              const dialogs = [];
              let previousFloor = null;
              selectedRoutes.forEach((route, idx) => {
                const previousRoute = selectedRoutes[idx - 1];
                if (previousRoute) {
                  previousFloor = previousRoute.get('floor');
                }
                const floor = route.get('floor');
                if (previousFloor && floor !== previousFloor) {
                  dialogs.push(
                    <MapFloorSwitcher
                      key={route.ol_uid}
                      route={previousRoute}
                      nextRoute={route}
                    />,
                  );
                }
              });
              return dialogs;
            })()
          : null}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    center: state.MapReducer.center,
    activeFloor: state.MapReducer.activeFloor,
    floorInfo: state.MapReducer.floorInfo,
    selectedRoute: state.MapReducer.selectedRoute,
    selectedRoutes: state.MapReducer.selectedRoutes,
    isRouteInfoOpen: state.MapReducer.isRouteInfoOpen,
    currentMot: state.MapReducer.currentMot,
    currentStops: state.MapReducer.currentStops,
    currentStopsGeoJSON: state.MapReducer.currentStopsGeoJSON,
    isFieldFocused: state.MapReducer.isFieldFocused,
    resolveHops: state.MapReducer.resolveHops,
    olMap: state.MapReducer.olMap,
    searchMode: state.MapReducer.searchMode,
    tracks: state.MapReducer.tracks,
    layerService: state.MapReducer.layerService,
    maxExtent: state.MapReducer.maxExtent,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetCenter: center => dispatch(actions.setCenter(center)),
    onSetTracks: tracks => dispatch(actions.setTracks(tracks)),
    onSetFloorInfo: floorInfo => dispatch(actions.setFloorInfo(floorInfo)),
    onSetCurrentStops: currentStops =>
      dispatch(actions.setCurrentStops(currentStops)),
    onSetCurrentStopsGeoJSON: currentStopsGeoJSON =>
      dispatch(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)),
    onSetClickLocation: clickLocation =>
      dispatch(actions.setClickLocation(clickLocation)),
    onShowNotification: (notificationMessage, notificationType) =>
      dispatch(actions.showNotification(notificationMessage, notificationType)),
    onSetShowLoadingBar: showLoadingBar =>
      dispatch(actions.setShowLoadingBar(showLoadingBar)),
    onSetSelectedRoutes: selectedRoutes =>
      dispatch(actions.setSelectedRoutes(selectedRoutes)),
    onSetMaxExtent: extent => dispatch(actions.setMaxExtent(extent)),
    dispatchSetActiveFloor: activeFloor =>
      dispatch(actions.setActiveFloor(activeFloor)),
  };
};

MapComponent.defaultProps = {
  center: [47.99822, 7.84049],
};

MapComponent.propTypes = {
  center: propTypeCoordinates,
  activeFloor: PropTypes.string.isRequired,
  floorInfo: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedRoutes: PropTypes.arrayOf(PropTypes.instanceOf(Feature)).isRequired,
  isRouteInfoOpen: PropTypes.bool.isRequired,
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  onSetCenter: PropTypes.func.isRequired,
  onSetTracks: PropTypes.func.isRequired,
  onSetFloorInfo: PropTypes.func.isRequired,
  onSetClickLocation: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  onSetShowLoadingBar: PropTypes.func.isRequired,
  onSetSelectedRoutes: PropTypes.func.isRequired,
  onSetCurrentStops: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  onSetMaxExtent: PropTypes.func.isRequired,
  dispatchSetActiveFloor: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops.isRequired,
  currentStopsGeoJSON: propTypeCurrentStopsGeoJSON.isRequired,
  isFieldFocused: PropTypes.bool.isRequired,
  routingUrl: PropTypes.string.isRequired,
  currentMot: PropTypes.string.isRequired,
  resolveHops: PropTypes.bool.isRequired,
  tracks: PropTypes.arrayOf(PropTypes.string).isRequired,
  olMap: PropTypes.instanceOf(Map).isRequired,
  searchMode: PropTypes.string.isRequired,
  layerService: PropTypes.object.isRequired,
  maxExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapComponent);
