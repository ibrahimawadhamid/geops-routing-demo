import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import RSPermalink from 'react-spatial/components/Permalink';
import qs from 'query-string';
import {
  setCurrentStops,
  setCurrentStopsGeoJSON,
  setCurrentMot,
} from '../../store/actions/Map';

const getGeoJsonFromUid = uid => {
  return {
    type: 'Feature',
    properties: {
      uid,
      name: 'Bern',
      country_code: 'CH',
      rank: 0.343647865289214,
      translated_names: [],
      mot: {
        bus: true,
        ferry: false,
        gondola: false,
        tram: false,
        rail: true,
        funicular: false,
        cable_car: false,
        subway: false,
      },
      ident_source: 'sbb',
      id: '8507000',
      code: 'BN',
      ifopt: null,
    },
    geometry: {
      type: 'Point',
      coordinates: [828120.1635449642, 5933726.148056162],
    },
  };
};

function Permalink({ mots }) {
  const dispatch = useDispatch();
  const urlSearch = qs.parse(window.location.search);
  const initialState = useSelector(state => state.MapReducer);
  const map = initialState.olMap;
  const [params, setParams] = useState({});

  // console.log(initialState);

  useEffect(() => {
    const newParams = {};
    if (urlSearch) {
      if (urlSearch.mot) {
        const newMot = mots.find(mot => mot === urlSearch.mot) || mots[0];
        newParams.mot = newMot;
        dispatch(setCurrentMot(newMot));
      }
      if (urlSearch.via) {
        newParams.via = urlSearch.via;
        const viaArray = urlSearch.via.replace(/!/g, '').split('|');
        const geoJsonArray = viaArray.map(uid => getGeoJsonFromUid(uid));
        dispatch(
          setCurrentStops(geoJsonArray.map(stop => stop.properties.name)),
        );
        const geoJsonObject = {};
        // eslint-disable-next-line no-return-assign
        geoJsonArray.forEach((stop, idx) => (geoJsonObject[`${idx}`] = stop));
        dispatch(setCurrentStopsGeoJSON(geoJsonObject));
      }
    }
    setParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RSPermalink map={map} params={params} />;
}

Permalink.propTypes = {
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Permalink;
