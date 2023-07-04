import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Adjust from '@mui/icons-material/Adjust';
import Room from '@mui/icons-material/Room';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import FloorSelect from '../FloorSelect';
import TrackSelect from '../TrackSelect';
import { propTypeCurrentStops } from '../../store/prop-types';
import { to4326 } from '../../utils';
import { setIsFieldFocused, setIsRouteInfoOpen } from '../../store/actions/Map';

const useStyles = makeStyles(() => ({
  button: {
    color: 'black',
    '& svg': {
      height: '20px',
      width: '20px',
    },
  },
  buttonIcon: {
    color: 'gray !important',
  },
}));

/**
 * The component that displays the search field(s)
 * @category RoutingMenu
 */
function SearchField(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const showLoadingBar = useSelector(
    (state) => state.MapReducer.showLoadingBar,
  );
  const {
    index,
    addNewSearchFieldHandler,
    currentStops,
    currentMot,
    removeSearchFieldHandler,
    searchStopsHandler,
    singleStop,
    processHighlightedResultSelectHandler,
    onFieldFocusHandler,
    onPanViaClick,
    inputReference,
  } = props;
  let fieldLeftIcon = null;
  let searchFieldLabel = '';

  const formatSingleStop = (val) => (Array.isArray(val) ? to4326(val) : val);
  const isStationName = useMemo(
    () => typeof singleStop === 'string' && singleStop !== '',
    [singleStop],
  );

  const addNextHopDisabled =
    currentStops[index] === '' ||
    (currentStops.length > 2 && currentStops[index + 1] === '');
  if (index === 0) {
    // Start station field
    fieldLeftIcon = <RadioButtonCheckedIcon fontSize="small" color="primary" />;
    searchFieldLabel = 'Start';
  } else if (index === currentStops.length - 1) {
    fieldLeftIcon = <Room color="primary" />;
    searchFieldLabel = 'End';
  } else {
    fieldLeftIcon = <Adjust fontSize="small" color="primary" />;
    searchFieldLabel = 'Hop';
  }
  return (
    <Grid
      container
      spacing={1}
      alignItems="flex-end"
      style={{ padding: '10px 0px 10px 0px', flexWrap: 'nowrap' }}
    >
      <Grid
        item
        xs={1}
        textAlign="right"
        style={{ minWidth: 35, maxWidth: 44 }}
      >
        <Tooltip title="Change order of the via points">
          <span>
            <IconButton
              className={classes.button}
              aria-label="dragHop"
              size="small"
              disabled
            >
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Grid>
      <Grid
        item
        xs={1}
        textAlign="left"
        padding={0}
        style={{ minWidth: 35, maxWidth: 44 }}
      >
        <Tooltip title="Pan to the feature">
          <span>
            <IconButton
              onClick={() => onPanViaClick(singleStop, index)}
              className={classes.button}
              size="small"
            >
              {fieldLeftIcon}
            </IconButton>
          </span>
        </Tooltip>
      </Grid>
      <Grid item xs={7} style={{ minWidth: 100, maxWidth: 400 }}>
        <TextField
          fullWidth
          inputRef={inputReference}
          label={searchFieldLabel}
          color="primary"
          variant="standard"
          onChange={(e) => searchStopsHandler(e, index)}
          value={formatSingleStop(singleStop)}
          onKeyDown={processHighlightedResultSelectHandler}
          onFocus={() => {
            // We close the route infos dialog otherwise we loose the focus
            dispatch(setIsRouteInfoOpen(false));
            dispatch(setIsFieldFocused(true));
            onFieldFocusHandler(index);
          }}
          onBlur={() =>
            setTimeout(() => {
              dispatch(setIsFieldFocused(false));
            }, 500)
          }
          onClick={(event) => {
            if (event.target.select) {
              event.target.select();
            }
          }}
        />
      </Grid>
      <Grid item xs={1} style={{ minWidth: 46, maxWidth: 120 }}>
        {currentMot === 'foot' ? (
          <FloorSelect
            index={index}
            disabled={isStationName}
            singleStop={singleStop}
          />
        ) : (
          <TrackSelect index={index} disabled={!isStationName} />
        )}
      </Grid>
      <Grid
        item
        xs={1}
        textAlign="center"
        style={{ minWidth: 26, maxWidth: 26 }}
      >
        {index !== currentStops.length - 1 && (
          <Tooltip title="Add Via Point">
            <span>
              <IconButton
                onClick={() =>
                  addNewSearchFieldHandler(currentStops, index + 1)
                }
                className={classes.button}
                aria-label="Add Via Point"
                size="small"
                disabled={addNextHopDisabled || showLoadingBar}
              >
                <AddCircleOutlineIcon
                  fontSize="small"
                  className={classes.buttonIcon}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Grid>
      <Grid
        item
        xs={1}
        textAlign="center"
        style={{ minWidth: 26, maxWidth: 26 }}
      >
        {index !== 0 && index !== currentStops.length - 1 && (
          <Tooltip title="Remove Via Point">
            <span>
              <IconButton
                onClick={() => removeSearchFieldHandler(index)}
                className={classes.button}
                aria-label="removeHop"
                size="small"
                disabled={showLoadingBar}
              >
                <RemoveCircleOutlineIcon
                  fontSize="small"
                  className={classes.buttonIcon}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
}

SearchField.propTypes = {
  index: PropTypes.number.isRequired,
  addNewSearchFieldHandler: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops,
  currentMot: PropTypes.string.isRequired,
  removeSearchFieldHandler: PropTypes.func.isRequired,
  searchStopsHandler: PropTypes.func.isRequired,
  singleStop: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  processHighlightedResultSelectHandler: PropTypes.func.isRequired,
  onFieldFocusHandler: PropTypes.func.isRequired,
  onPanViaClick: PropTypes.func.isRequired,
  inputReference: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

SearchField.defaultProps = {
  currentStops: [],
  singleStop: '',
};

export default SearchField;
