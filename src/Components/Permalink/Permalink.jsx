/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import RSPermalink from 'react-spatial/components/Permalink';
import { to4326, to3857 } from '../../utils';
import {
  setCurrentStops,
  setCurrentStopsGeoJSON,
  setCurrentMot,
  setCenter,
  setFloorInfo,
  setResolveHops,
  setGeneralizationEnabled,
  setGeneralizationGraph,
  setGeneralizationActive,
  setTracks,
  setMode,
} from '../../store/actions/Map';

const abortController = new AbortController();
const { signal } = abortController;

const validateUrlCoordinates = (coordArray) => {
  /* Check if the x and y values are xy-coordinates */
  if (
    isFinite(coordArray[1]) &&
    Math.abs(coordArray[1]) <= 90 &&
    isFinite(coordArray[0]) &&
    Math.abs(coordArray[0]) <= 180
  ) {
    return true;
  }
  return false;
};

const getGeoJson = (viaString, APIKey, stationSearchUrl) => {
  /* When the via is a pair of coordinates */
  if (viaString.split(',').length > 1) {
    let geoJson;
    const coordArray = viaString
      .split(',')
      .filter((val) => !isNaN(val))
      .map((string) => parseFloat(string));
    if (coordArray.length === 2 && validateUrlCoordinates(coordArray)) {
      /* Convert coordinates to 3857 */
      const coords3857 = to3857(coordArray);
      geoJson = {
        type: 'Feature',
        properties: {
          id: coords3857.toString(),
          type: 'coordinates',
        },
        geometry: {
          type: 'Point',
          coordinates: coords3857,
        },
      };
    }
    return Promise.resolve(geoJson);
  }
  let reqUrl;

  /* When the via is a UID */
  if (/^![a-zA-Z0-9]{16}$/.test(viaString)) {
    reqUrl = `${stationSearchUrl}lookup/${viaString.replace(
      '!',
      '',
    )}/?key=${APIKey}`;
  } else {
    /* search for the station. Remove ! in case it's an IBNR */
    reqUrl = `${stationSearchUrl}?q=${viaString.replace(
      '!',
      '',
    )}&key=${APIKey}`;
  }

  return fetch(reqUrl, { signal })
    .then((response) => response.json())
    .then((response) => {
      /* Convert coordinates to 3857 */
      const feature = response.features[0];
      feature.geometry.coordinates = to3857(feature.geometry.coordinates);
      return feature;
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch geoJson');
      return null;
    });
};

const compileViaString = (currentStopsGeoJson = [], tracks) => {
  if (!currentStopsGeoJson || currentStopsGeoJson.length < 2) {
    return null;
  }

  const uidStrings = currentStopsGeoJson
    .filter((val) => !!val)
    .map((val, idx) => {
      if (!val.properties.uid) {
        return `${to4326(val.geometry.coordinates)}`;
      }
      return `!${val.properties.uid}${tracks[idx] ? `$${tracks[idx]}` : ''}`;
    });
  return uidStrings.join('|');
};

function Permalink({ mots, APIKey, stationSearchUrl }) {
  const dispatch = useDispatch();
  const urlSearch = new URLSearchParams(window.location.search);
  const center = useSelector((state) => state.MapReducer.center);
  const tracks = useSelector((state) => state.MapReducer.tracks);
  const appState = useSelector((state) => state.MapReducer);
  const currentMot = useSelector((state) => state.MapReducer.currentMot);
  const floorInfo = useSelector((state) => state.MapReducer.floorInfo);
  const currentStops = useSelector((state) => state.MapReducer.currentStops);
  const currentStopsGeoJSON = useSelector(
    (state) => state.MapReducer.currentStopsGeoJSON,
  );
  const resolveHops = useSelector((state) => state.MapReducer.resolveHops);
  const generalizationEnabled = useSelector(
    (state) => state.MapReducer.generalizationEnabled,
  );
  const generalizationActive = useSelector(
    (state) => state.MapReducer.generalizationActive,
  );
  const map = appState.olMap;
  const [params, setParams] = useState({});

  /* Configure app on load using url params */
  useEffect(() => {
    const newParams = {};
    if (urlSearch) {
      const zParam = urlSearch.get('z');
      const xParam = urlSearch.get('x');
      const yParam = urlSearch.get('y');
      const motParam = urlSearch.get('mot');
      const floorInfoParam = urlSearch.get('floorInfo');
      const viaParam = urlSearch.get('via');
      const resolveHopsParam = urlSearch.get('resolve-hops');
      const generalizationParam = urlSearch.get('generalization');
      const generalizationActiveParam = urlSearch.get('generalizationActive');
      const graphParam = urlSearch.get('graph');
      const mode = urlSearch.get('mode');

      if (zParam && !isNaN(parseFloat(zParam))) {
        // Set zoom if defined
        map.getView().setZoom(zParam);
      }

      if (
        xParam &&
        !isNaN(parseFloat(xParam)) &&
        yParam &&
        !isNaN(parseFloat(yParam))
      ) {
        // Set center if defined
        dispatch(setCenter([parseFloat(xParam), parseFloat(yParam)]));
      }

      if (motParam) {
        // Set current mot if defined
        const newMot = mots.find((mot) => mot === motParam) || mots[0];
        newParams.mot = newMot;
        dispatch(setCurrentMot(newMot));
      }

      if (floorInfoParam) {
        dispatch(setFloorInfo(floorInfoParam.split(',')));
      }

      if (viaParam) {
        // Set via stations if defined
        newParams.via = viaParam;
        const viaArray = viaParam.split('|');
        const geoJsonArray = viaArray.map((viaString) =>
          getGeoJson(viaString.split('$')[0], APIKey, stationSearchUrl),
        );
        dispatch(
          setTracks(
            viaArray.map((stop) => {
              const track = stop.split('$')[1];
              return track || '';
            }),
          ),
        );

        Promise.all(geoJsonArray).then((values) => {
          dispatch(
            setCurrentStops(
              values.map((stop) => {
                if (!stop) {
                  return '';
                }
                if (!stop.properties.name) {
                  return stop.geometry.coordinates;
                }
                return stop.properties.name;
              }),
            ),
          );
          const newCurrentStopsGeoJSON = [...values.filter((stop) => !!stop)];
          dispatch(setCurrentStopsGeoJSON(newCurrentStopsGeoJSON));
        });
      }

      if (resolveHopsParam) {
        dispatch(setResolveHops(resolveHopsParam === 'true'));
      }

      if (generalizationParam && !graphParam) {
        dispatch(setGeneralizationEnabled(generalizationParam === 'true'));
        dispatch(
          setGeneralizationActive(
            generalizationParam !== 'false' &&
              generalizationActiveParam !== 'false',
          ),
        );
      }

      if (graphParam) {
        dispatch(setGeneralizationGraph(graphParam));
      }

      if (mode === 'dev') {
        dispatch(setMode('dev'));
      }
    }
    setParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Update url params on app update */
  useEffect(() => {
    const newParams = {};
    newParams.z = map.getView().getZoom();
    [newParams.x] = center;
    [, newParams.y] = center;
    newParams.floorInfo = floorInfo
      .map((f) => {
        if (f) {
          return f.toString().replace('$', '');
        }
        return '';
      })
      .join(',');

    newParams.mot = currentMot;
    newParams['resolve-hops'] = resolveHops;
    if (currentStopsGeoJSON.length !== 0) {
      newParams.via = compileViaString(currentStopsGeoJSON, tracks);
    }

    if (generalizationEnabled) {
      newParams.generalizationActive = generalizationActive;
    } else {
      newParams.generalizationActive = undefined;
    }

    setParams(newParams);
  }, [
    generalizationActive,
    generalizationEnabled,
    currentMot,
    floorInfo,
    currentStops,
    currentStopsGeoJSON,
    center,
    resolveHops,
    map,
    tracks,
  ]);

  return <RSPermalink map={map} params={params} />;
}

Permalink.propTypes = {
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
};

export default Permalink;
