import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Popup from 'react-spatial/components/Popup';
import { containsCoordinate } from 'ol/extent';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import './MapFloorSwitcher.scss';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Typography from '@material-ui/core/Typography';
import { unByKey } from 'ol/Observable';
import { setActiveFloor } from '../../store/actions/Map';

const propTypes = {
  route: PropTypes.instanceOf(Feature).isRequired,
  nextRoute: PropTypes.instanceOf(Feature).isRequired,
};

const useStyles = makeStyles(() => ({
  iconButton: {
    padding: 0,
  },
}));

const shouldDisplayButton = (map, coord) => {
  return (
    map.getView().getZoom() >= 16 &&
    containsCoordinate(map.getView().calculateExtent(), coord)
  );
};

function MapFloorSwitcher({ route, nextRoute }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const map = useSelector((state) => state.MapReducer.olMap);
  const activeFloor = useSelector((state) => state.MapReducer.activeFloor);
  const coord = route.getGeometry().getLastCoordinate();
  const [isInExtent, setInExtent] = useState(shouldDisplayButton(map, coord));

  const feature = new Feature(new Point(coord));

  useEffect(() => {
    const key = map.on('moveend', () => {
      setInExtent(shouldDisplayButton(map, coord));
    });
    return () => {
      unByKey(key);
    };
  }, [coord, map]);

  if (!nextRoute || !isInExtent) {
    return null;
  }

  const { floor } = route.getProperties();
  const { floor: nextFloor } = nextRoute.getProperties();

  // Make sure we compare integer.
  let intFloor = parseInt(floor, 10);
  let intNextFloor = parseInt(nextFloor, 10);
  const intActiveFloor = parseInt(activeFloor, 10);

  if (activeFloor !== '2D') {
    if (intFloor !== intActiveFloor && intNextFloor !== intActiveFloor) {
      return null;
    }

    if (intNextFloor === intActiveFloor) {
      intNextFloor = intFloor;
      intFloor = activeFloor;
    }
  }

  const up = intFloor < intNextFloor;

  const directionIcon = up ? (
    <KeyboardArrowUpIcon />
  ) : (
    <KeyboardArrowDownIcon />
  );

  return (
    <Popup map={map} feature={feature} className="map-floor-switcher">
      <div>
        <Typography variant="body2">{intNextFloor}</Typography>
      </div>
      <div>
        <IconButton
          className={classes.iconButton}
          onClick={() => {
            dispatch(setActiveFloor(`${intNextFloor}`));
          }}
        >
          {directionIcon}
        </IconButton>
      </div>
    </Popup>
  );
}

MapFloorSwitcher.propTypes = propTypes;

export default React.memo(MapFloorSwitcher);
