/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import RSPermalink from 'react-spatial/components/Permalink';
import qs from 'query-string';
import { to4326, to3857 } from '../../utils';
import {
  setCurrentStops,
  setCurrentStopsGeoJSON,
  setCurrentMot,
  setCenter,
  setFloorInfo,
  setResolveHops,
  setTracks,
} from '../../store/actions/Map';

const abortController = new AbortController();
const { signal } = abortController;

const validateUrlCoordinates = coordArray => {
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
      .filter(val => !isNaN(val))
      .map(string => parseFloat(string));
    if (coordArray.length === 2 && validateUrlCoordinates(coordArray)) {
      /* Convert coordinates to 3857 */
      const coords3857 = to3857(coordArray);
      geoJson = {
        type: 'Feature',
        properties: {
          id: coords3857,
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
    .then(response => response.json())
    .then(response => {
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

  const uidStrings = currentStopsGeoJson.map((val, idx) => {
    if (!val.properties.uid) {
      return `${to4326(val.geometry.coordinates)}`;
    }
    return `!${val.properties.uid}${tracks[idx] ? `$${tracks[idx]}` : ''}`;
  });
  return uidStrings.join('|');
};

function Permalink({ mots, APIKey, stationSearchUrl }) {
  const dispatch = useDispatch();
  const urlSearch = qs.parse(window.location.search);
  const center = useSelector(state => state.MapReducer.center);
  const tracks = useSelector(state => state.MapReducer.tracks);
  const appState = useSelector(state => state.MapReducer);
  const currentMot = useSelector(state => state.MapReducer.currentMot);
  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const currentStops = useSelector(state => state.MapReducer.currentStops);
  const currentStopsGeoJSON = useSelector(
    state => state.MapReducer.currentStopsGeoJSON,
  );
  const resolveHops = useSelector(state => state.MapReducer.resolveHops);
  const map = appState.olMap;
  const [params, setParams] = useState({});

  /* Configure app on load using url params */
  useEffect(() => {
    const newParams = {};
    if (urlSearch) {
      if (urlSearch.z && !isNaN(parseFloat(urlSearch.z))) {
        // Set zoom if defined
        map.getView().setZoom(urlSearch.z);
      }
      if (
        urlSearch.x &&
        !isNaN(parseFloat(urlSearch.x)) &&
        urlSearch.y &&
        !isNaN(parseFloat(urlSearch.y))
      ) {
        // Set center if defined
        dispatch(setCenter([parseFloat(urlSearch.x), parseFloat(urlSearch.y)]));
      }

      if (urlSearch.mot) {
        // Set current mot if defined
        const newMot = mots.find(mot => mot === urlSearch.mot) || mots[0];
        newParams.mot = newMot;
        dispatch(setCurrentMot(newMot));
      }

      if (urlSearch.floorInfo) {
        dispatch(setFloorInfo(urlSearch.floorInfo.split(',')));
      }

      if (urlSearch.via) {
        // Set via stations if defined
        newParams.via = urlSearch.via;
        const viaArray = urlSearch.via.split('|');
        const geoJsonArray = viaArray.map(viaString =>
          getGeoJson(viaString.split('$')[0], APIKey, stationSearchUrl),
        );
        dispatch(
          setTracks(
            viaArray.map(stop => {
              const track = stop.split('$')[1];
              return track || '';
            }),
          ),
        );

        Promise.all(geoJsonArray).then(values => {
          dispatch(
            setCurrentStops(
              values.map(stop => {
                if (!stop) {
                  return '';
                }
                if (!stop.properties.name) {
                  console.log(stop);
                  return stop.geometry.coordinates;
                }
                return stop.properties.name;
              }),
            ),
          );
          const newCurrentStopsGeoJSON = [...values.filter(stop => !!stop)];
          dispatch(setCurrentStopsGeoJSON(newCurrentStopsGeoJSON));
        });
      }

      if (urlSearch['resolve-hops']) {
        dispatch(setResolveHops(urlSearch['resolve-hops'] === 'true'));
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
      .map(f => {
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
    setParams(newParams);
  }, [
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
