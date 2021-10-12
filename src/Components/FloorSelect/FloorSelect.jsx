import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { to4326 } from '../../utils';
import { setFloorInfo, showNotification } from '../../store/actions/Map';

const propTypes = {
  index: PropTypes.number.isRequired,
  singleStop: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // array for an array  of coordinate, string for a station name
};

const defaultProps = {
  singleStop: null,
};

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '12%',
    paddingLeft: '20px',
    paddingBottom: '4px',
  },
}));

/**
 * The component that displays the floor selector
 */
function FloorSelect({ index, singleStop }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const floor = useMemo(() => floorInfo[index], [index, floorInfo]);
  const [floors, setFloors] = useState([floor || '0']);

  console.log(floors, floor);

  useEffect(() => {
    const abortController = new AbortController();
    // Coordinate
    if (Array.isArray(singleStop)) {
      const { signal } = abortController;

      const reqUrl = `https://walking.geops.io/availableLevels?point=${to4326(
        singleStop,
      )
        .reverse()
        .join(',')}&distance=0.006`;

      fetch(reqUrl, { signal })
        .then(response => response.json())
        .then(response => {
          if (response.error) {
            dispatch(
              showNotification("Couldn't find available levels", 'warning'),
            );
            return;
          }
          let { availableLevels } = response.properties;
          if (!availableLevels) {
            dispatch(
              showNotification("Couldn't find available levels", 'warning'),
            );
            return;
          }
          // Use String levels
          if (!availableLevels.length) {
            // if the array is empty we replace it by ['0'] to avoid warnings.
            availableLevels = ['0'];
          }

          const newFloors = availableLevels.join().split(',');

          // If the old floor doesn't exist at the new coordinate try to pick one.
          if (floor && !newFloors.includes(floor)) {
            if (floor !== '0' && newFloors.includes('0')) {
              floorInfo[index] = '0';
            } else {
              // If the level 0 doesn't exist pick the one in the middle
              floorInfo[index] = newFloors[Math.floor(newFloors.length / 2)];
            }
            dispatch(setFloorInfo([...floorInfo]));
          }

          setFloors(newFloors);
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            // eslint-disable-next-line no-console
            console.warn(`Abort ${reqUrl}`);
            return;
          }
          // It's important to rethrow all other errors so you don't silence them!
          // For example, any error thrown by setState(), will pass through here.
          throw err;
        });
    }
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleStop]);

  useEffect(() => {
    // Select the good floor if there is only one possibility
    if (floorInfo && floors && floors.length) {
    }
  }, [floorInfo, floors]);

  return (
    <FormControl className={classes.wrapper}>
      <Select
        renderValue={val => (!val || val === '' ? '0' : val)}
        labelId="rd-floor-select-label"
        value={floor}
        displayEmpty
        onChange={evt => {
          const newFloorInfo = [...floorInfo];
          const { value } = evt.target;
          newFloorInfo[index] = value;
          dispatch(setFloorInfo(newFloorInfo));
        }}
      >
        {floors.map(fl => {
          return (
            <MenuItem value={fl} key={`floor-${fl}`}>
              {fl === '' ? '0' : fl}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

FloorSelect.propTypes = propTypes;
FloorSelect.defaultProps = defaultProps;

export default React.memo(FloorSelect);
