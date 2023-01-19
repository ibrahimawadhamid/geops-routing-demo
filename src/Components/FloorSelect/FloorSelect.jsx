import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { to4326 } from '../../utils';
import { WALKING_BASE_URL } from '../../constants';
import { setFloorInfo, showNotification } from '../../store/actions/Map';

const propTypes = {
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  singleStop: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // array for an array  of coordinate, string for a station name
};

const defaultProps = {
  singleStop: null,
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '12%',
    padding: '0 10px 4px 10px',
    [theme.breakpoints.down('xs')]: {
      padding: '0 5px 4px 5px',
    },
    '& label': {
      left: '10px',
      [theme.breakpoints.down('xs')]: {
        left: '5px',
      },
    },
  },
}));

/**
 * The component that displays the floor selector
 */
function FloorSelect({ index, disabled, singleStop }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const floorInfo = useSelector((state) => state.MapReducer.floorInfo);
  const floor = useMemo(() => floorInfo[index], [index, floorInfo]);
  const [floors, setFloors] = useState([floor || '0']);

  useEffect(() => {
    const abortController = new AbortController();
    // Coordinate
    if (Array.isArray(singleStop)) {
      const { signal } = abortController;

      const reqUrl = `${WALKING_BASE_URL}availableLevels?point=${to4326(
        singleStop,
      )
        .reverse()
        .join(',')}&distance=0.03`;

      fetch(reqUrl, { signal })
        .then((response) => response.json())
        .then((response) => {
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
        .catch((err) => {
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

  // Don't display the select box if the floor is not in the list
  if (floor && floors && !floors.includes(floor)) {
    return null;
  }

  return (
    <FormControl className={classes.wrapper}>
      <InputLabel shrink id="rd-floor-select-label">
        Floor
      </InputLabel>
      <Select
        renderValue={(val) => (!val || val === '' ? '0' : val)}
        labelId="rd-floor-select-label"
        value={floor}
        displayEmpty
        disabled={disabled || !floors.length}
        onChange={(evt) => {
          const newFloorInfo = [...floorInfo];
          const { value } = evt.target;
          newFloorInfo[index] = value;
          dispatch(setFloorInfo(newFloorInfo));
        }}
      >
        {floors.reverse().map((fl) => {
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
