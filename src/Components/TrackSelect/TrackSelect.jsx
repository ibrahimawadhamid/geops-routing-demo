import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { setTracks } from '../../store/actions/Map';

const propTypes = {
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
};

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '12%',
    padding: '0 10px 4px 10px',
    [theme.breakpoints.down('xs')]: {
      padding: '0 5px 4px 5px',
    },
  },
}));

const selectStyles = makeStyles(() => ({
  select: {
    paddingRight: '17px !important',
  },
  icon: {
    width: '0.8em',
    height: '0.8em',
  },
}));

/**
 * The component that displays the track selector
 */
function TrackSelect({ index, disabled }) {
  const classes = useStyles();
  const selectClasses = selectStyles();
  const dispatch = useDispatch();
  const tracks = useSelector(state => state.MapReducer.tracks);
  const currentMot = useSelector(state => state.MapReducer.currentMot);
  const currentStopsGeoJSON = useSelector(
    state => state.MapReducer.currentStopsGeoJSON,
  );
  const track = useMemo(() => tracks[index], [index, tracks]);

  const tracksValues = useMemo(() => {
    return currentStopsGeoJSON[index] &&
      currentStopsGeoJSON[index].properties &&
      currentStopsGeoJSON[index].properties.platforms &&
      currentStopsGeoJSON[index].properties.platforms[currentMot]
      ? [
          '',
          ...currentStopsGeoJSON[index].properties.platforms[currentMot].sort(
            (a, b) => {
              return parseInt(a, 10) - parseInt(b, 10);
            },
          ),
        ]
      : [];
  }, [index, currentMot, currentStopsGeoJSON]);

  return (
    <FormControl className={classes.wrapper}>
      <InputLabel shrink id="rd-track-select-label">
        Track
      </InputLabel>
      <Select
        classes={selectClasses}
        renderValue={val => (val === '' ? '-' : val)}
        labelId="rd-track-select-label"
        value={track || ''}
        displayEmpty
        disabled={disabled || !tracksValues.length}
        onChange={evt => {
          const newTracks = [...tracks];
          const { value } = evt.target;
          newTracks[index] = value;
          dispatch(setTracks(newTracks));
        }}
      >
        {tracksValues.map(t => {
          return (
            <MenuItem value={t} key={`track-${t}`}>
              {t === '' ? '-' : t}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

TrackSelect.propTypes = propTypes;

export default TrackSelect;
