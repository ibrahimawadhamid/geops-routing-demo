import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { setTracks } from '../../store/actions/Map';

const propTypes = {
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
};

/**
 * The component that displays the track selector
 */
function TrackSelect({ index, disabled }) {
  const dispatch = useDispatch();
  const tracks = useSelector((state) => state.MapReducer.tracks);
  const currentMot = useSelector((state) => state.MapReducer.currentMot);
  const currentStopsGeoJSON = useSelector(
    (state) => state.MapReducer.currentStopsGeoJSON,
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
    <FormControl variant="standard" fullWidth>
      <InputLabel shrink id="rd-track-select-label">
        Track
      </InputLabel>
      <Select
        renderValue={(val) => (val === '' ? '-' : val)}
        labelId="rd-track-select-label"
        value={track || ''}
        displayEmpty
        disabled={disabled || !tracksValues.length}
        onChange={(evt) => {
          const newTracks = [...tracks];
          const { value } = evt.target;
          newTracks[index] = value;
          dispatch(setTracks(newTracks));
        }}
        style={{ textAlign: 'center' }}
      >
        {tracksValues.map((t) => {
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
