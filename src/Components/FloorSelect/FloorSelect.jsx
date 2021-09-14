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
  singleStop: PropTypes.object,
};

const defaultProps = {
  singleStop: undefined,
};

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '12%',
    paddingLeft: '20px',
    paddingBottom: '4px',
  },
}));

let abortController = new AbortController();

/**
 * The component that displays the floor selector
 */
function FloorSelect({ index, singleStop }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const floor = useMemo(() => floorInfo[index], [index, floorInfo]);
  const [floors, setFloors] = useState(['-']);

  useEffect(() => {
    // Coordinate
    if (Array.isArray(singleStop)) {
      abortController.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      const reqUrl = `https://walking.geops.io/availableLevels?point=${to4326(
        singleStop,
      )
        .reverse()
        .join(',')}`;

      fetch(reqUrl, { signal })
        .then(response => response.json())
        .then(response => {
          if (response.error) {
            dispatch(
              showNotification("Couldn't find available levels", 'warning'),
            );
            return;
          }
          if (!response.properties.availableLevels) {
            dispatch(
              showNotification("Couldn't find available levels", 'warning'),
            );
          }
          setFloors(response.properties.availableLevels);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleStop]);

  return (
    <FormControl className={classes.wrapper}>
      <Select
        renderValue={val => (val === '' ? '-' : val)}
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
              {fl === '' ? '-' : fl}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

FloorSelect.propTypes = propTypes;
FloorSelect.defaultProps = defaultProps;

export default FloorSelect;
