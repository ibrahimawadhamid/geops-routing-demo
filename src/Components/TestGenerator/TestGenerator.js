import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Paper,
  Tooltip,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import { Translate } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { LineString, Point } from 'ol/geom';
import CloseIcon from '@material-ui/icons/Close';
import { useSelector, useDispatch } from 'react-redux';
import { Map, Feature } from 'ol';
import { Style, Fill, Stroke, RegularShape } from 'ol/style';
import { to4326 } from '../../utils';
import { setShowTestGenerator } from '../../store/actions/Map';
import getViaStrings from '../../utils/getViaStrings';

const stroke = new Stroke({ color: 'black', width: 4 });
const fill = new Fill({ color: 'red' });
const expectedViaPointStyle = new Style({
  image: new RegularShape({
    fill,
    stroke,
    points: 4,
    radius: 10,
    radius2: 0,
    angle: Math.PI / 4,
  }),
});

const debugSource = new VectorSource({});

const useStyles = makeStyles(() => {
  return {
    container: {
      position: 'absolute',
      left: 710,
      top: 10,
    },
    closeBtn: {
      position: 'absolute',
      right: 5,
      top: 5,
    },
    content: {
      padding: 20,
      minHeight: 195,
      minWidth: 250,
    },
    codeBlock: {
      marginTop: 15,
      padding: '15px 10px',
      backgroundColor: '#eeeeee',
      fontSize: 14,
      whiteSpace: 'pre',
      maxWidth: 400,
      overflowX: 'auto',
      fontFamily:
        'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New',
    },
  };
});

function TestGenerator({ map }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    selectedRoutes,
    currentStopsGeoJSON,
    currentMot,
    floorInfo,
    tracks,
    layerService,
  } = useSelector((state) => state.MapReducer);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const viaString = useMemo(() => {
    return getViaStrings(
      currentStopsGeoJSON,
      currentMot,
      floorInfo,
      tracks,
    ).join('|');
  }, [currentStopsGeoJSON, currentMot, floorInfo, tracks]);

  const expectedViaPoints = useMemo(() => {
    if (!selectedRoutes.length) return [];
    const concatCoords = selectedRoutes.reduce(
      (finalCoords, currentRoute, idx) => {
        const routeCoords = currentRoute.getGeometry().getCoordinates();
        return finalCoords.concat(
          idx === 0
            ? routeCoords
            : routeCoords.slice(1, routeCoords.length - 1),
        );
      },
      [],
    );
    const concatGeom = new LineString(concatCoords);
    const features = [0.1, 0.3, 0.5, 0.7, 0.9].reduce(
      (finalPoints, fraction) => {
        const coord = concatGeom.getCoordinateAt(fraction);
        const pointFeature = new Feature({
          geometry: new Point(coord),
        });
        return [...finalPoints, pointFeature];
      },
      [],
    );
    features.forEach((feat) => feat.setStyle(expectedViaPointStyle));
    return features;
  }, [selectedRoutes]);

  const distance = useMemo(() => {
    return selectedRoutes.reduce((total, currentRoute) => {
      return total + currentRoute.get('line_length');
    }, 0);
  }, [selectedRoutes]);

  useEffect(() => {
    const debugLayer = new VectorLayer({
      zIndex: 999,
      source: debugSource,
    });
    const translate = new Translate({
      layers: [debugLayer],
      hitTolerance: 6,
    });
    if (map) {
      map.addInteraction(translate);
    }
    map.addLayer(debugLayer);
    return () => {
      map.removeLayer(debugLayer);
      map.removeInteraction(translate);
    };
  }, [map, layerService]);

  useEffect(() => {
    debugSource.clear();
    debugSource.addFeatures(expectedViaPoints);
  }, [expectedViaPoints, map]);

  if (!isDesktop) return null;

  return (
    <div className={classes.container}>
      <Paper elevation={3} square>
        <Tooltip title="Close">
          <IconButton
            className={classes.closeBtn}
            size="small"
            onClick={() => dispatch(setShowTestGenerator(false))}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <div className={classes.content}>
          <div className={classes.codeBlock}>
            <div>
              <b>{`${currentMot}-xx:`}</b>
            </div>
            <div>
              {'  '}
              <b>description:</b>{' '}
              <span className={classes.indented}>Fill out</span>
            </div>
            <div>
              {'  '}
              <b>mot:</b> <span>{currentMot}</span>
            </div>
            <div>
              {'  '}
              <b>via:</b> <span>&apos;{viaString}&apos;</span>
            </div>
            <div>
              {'  '}
              <b>expect_via:</b>{' '}
              <span>
                {expectedViaPoints.map((feat) => {
                  const coord = to4326(
                    feat.getGeometry().getCoordinates(),
                  ).slice();
                  return (
                    <div>
                      {'    '}- {coord.join(',')}
                    </div>
                  );
                })}
              </span>
            </div>
            <div>
              {'  '}
              <b>min_km:</b> <span>{(distance / 1.03 / 1000).toFixed(3)}</span>
            </div>
            <div>
              {'  '}
              <b>max_km:</b>{' '}
              <span>{((distance * 1.03) / 1000).toFixed(3)}</span>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
}

TestGenerator.propTypes = {
  map: PropTypes.instanceOf(Map).isRequired,
};

export default TestGenerator;
