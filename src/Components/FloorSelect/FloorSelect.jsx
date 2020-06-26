import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { setFloorInfo } from '../../store/actions/Map';

const propTypes = {
  index: PropTypes.number.isRequired,
};

const useStyles = makeStyles(() => ({
  wrapper: {
    width: '20%',
    paddingLeft: '20px',
    paddingBottom: '4px',
  },
}));

const floors = ['-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', ''];
/**
 * The component that displays the floor selector
 */
function FloorSelect({ index }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const floor = useMemo(() => floorInfo[index], [index, floorInfo]);

  return (
    <FormControl className={classes.wrapper}>
      <Select
        renderValue={val => (val === '' ? 'No Floor' : val)}
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
              {fl === '' ? 'No Floor' : fl}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

FloorSelect.propTypes = propTypes;

export default FloorSelect;
