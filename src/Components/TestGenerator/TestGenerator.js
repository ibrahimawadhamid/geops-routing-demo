import React, { useMemo, useEffect } from 'react';
import {
  IconButton,
  Paper,
  Tooltip,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import { LineString, Point } from 'ol/geom';
import CloseIcon from '@material-ui/icons/Close';
import { useSelector, useDispatch } from 'react-redux';
import { Feature } from 'ol';
import { Style, Fill, Stroke, RegularShape } from 'ol/style';
import { to4326 } from '../../utils';
import {
  setShowTestGenerator,
  setExpectedViaPoints,
} from '../../store/actions/Map';
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
      width: 250,
    },
    codeBlock: {
      marginTop: 15,
      padding: '15px 10px',
      backgroundColor: '#eeeeee',
      fontSize: 14,
      fontFamily:
        'Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New',
    },
  };
});
/**
 * @author
 * @function TestGenerator
 * */

function TestGenerator() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { selectedRoutes, currentStopsGeoJSON, currentMot, floorInfo, tracks } =
    useSelector((state) => state.MapReducer);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    return () => dispatch(setExpectedViaPoints([]));
  }, [dispatch]);

  const viaString = useMemo(() => {
    return getViaStrings(
      currentStopsGeoJSON,
      currentMot,
      floorInfo,
      tracks,
    ).join('|\n');
  }, [currentStopsGeoJSON, currentMot, floorInfo, tracks]);

  const expectedViaPoints = useMemo(() => {
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
    dispatch(setExpectedViaPoints(features));
    return features;
  }, [selectedRoutes, dispatch]);

  const distance = useMemo(() => {
    return selectedRoutes.reduce((total, currentRoute) => {
      return total + currentRoute.get('line_length');
    }, 0);
  }, [selectedRoutes]);

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
            <span>{`${currentMot}-xx:`}</span>
            <br />
            <span>description: Fill out</span>
            <br />
            <span>{`mot: ${currentMot}`}</span>
            <br />
            <span>{`via: ${viaString}`}</span>
            <br />
            <span>
              expect_via:{' '}
              {expectedViaPoints
                .map((feat) => {
                  return to4326(feat.getGeometry().getCoordinates())
                    .slice()
                    .reverse();
                })
                .join('|\n')}
            </span>
            <br />
            <span>{`min_km: ${distance / 1.03}`}</span>
            <br />
            <span>{`max_km: ${distance * 1.03}`}</span>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default TestGenerator;
