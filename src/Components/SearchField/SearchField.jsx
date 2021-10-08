import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Adjust from '@material-ui/icons/Adjust';
import Room from '@material-ui/icons/Room';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import FloorSelect from '../FloorSelect';
import TrackSelect from '../TrackSelect';
import { propTypeCurrentStops } from '../../store/prop-types';
import { to4326 } from '../../utils';
import { setIsFieldFocused } from '../../store/actions/Map';

const useStyles = makeStyles(theme => ({
  gridContainer: {
    width: '100%',
    padding: '0px 0px 0px 20px',
    boxSizing: 'unset',
    [theme.breakpoints.down('xs')]: {
      padding: '0px 0px 0px 5px',
    },
  },
  button: {
    color: 'black',
    '& svg': {
      height: '20px',
      width: '20px',
    },
  },
  fieldWrapper: {
    maxWidth: '58%',
    marginLeft: '5px',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '50%',
    },
  },
  addButtonWrapper: {
    padding: '5px 0 5px 8px !important',
  },
  buttonIcon: {
    color: 'gray !important',
  },
  buttonWrapper: {
    maxWidth: '26px',
  },
}));

/**
 * The component that displays the search field(s)
 * @category RoutingMenu
 */
function SearchField(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const showLoadingBar = useSelector(state => state.MapReducer.showLoadingBar);
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
  let searchFieldSize = 10;
  let searchFieldLabel = '';
  let fieldRightIcon = null;
  let addButton = null;

  const formatSingleStop = val => (Array.isArray(val) ? to4326(val) : val);
  const isStationName = useMemo(
    () => typeof singleStop === 'string' && singleStop !== '',
    [singleStop],
  );

  const addNextHopDisabled =
    currentStops[index] === '' ||
    (currentStops.length > 2 && currentStops[index + 1] === '');
  if (index === 0) {
    // Start station field
    fieldLeftIcon = (
      <Tooltip title="Pan to the feature">
        <IconButton
          onClick={() => onPanViaClick(singleStop, index)}
          className={classes.button}
          aria-label="Pan to the feature"
          size="small"
        >
          <RadioButtonCheckedIcon fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>
    );
    searchFieldLabel = 'Start';
    addButton = (
      <Grid item className={`rd-route-buttons ${classes.addButtonWrapper}`}>
        <Tooltip title="Add Hop">
          <span>
            <Button
              variant="contained"
              onClick={() => addNewSearchFieldHandler(currentStops, index + 1)}
              className="rd-button-active"
              classes={{
                root: 'rd-button-root',
                disabled: 'rd-button-disabled',
              }}
              aria-label="Add Hop"
              startIcon={
                <AddCircleOutlineIcon
                  fontSize="small"
                  className={classes.buttonIcon}
                />
              }
            >
              <Typography variant="caption">Add stopover</Typography>
            </Button>
          </span>
        </Tooltip>
      </Grid>
    );
  } else if (index === currentStops.length - 1) {
    fieldLeftIcon = (
      <Tooltip title="Pan to the feature">
        <IconButton
          onClick={() => onPanViaClick(singleStop, index)}
          className={classes.button}
          aria-label="Pan to the feature"
          size="small"
        >
          <Room color="primary" />
        </IconButton>
      </Tooltip>
    );
    searchFieldLabel = 'End';
  } else {
    fieldLeftIcon = (
      <Tooltip title="Pan to the feature">
        <IconButton
          onClick={() => onPanViaClick(singleStop, index)}
          className={classes.button}
          aria-label="Pan to the feature"
          size="small"
        >
          <Adjust fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>
    );
    searchFieldSize = 9;
    searchFieldLabel = 'Hop';
    addButton = (
      <Grid item className={`rd-route-buttons ${classes.addButtonWrapper}`}>
        <Tooltip title="Add Hop">
          <span>
            <Button
              variant="contained"
              onClick={() => addNewSearchFieldHandler(currentStops, index + 1)}
              disabled={addNextHopDisabled || showLoadingBar}
              className="rd-button-active"
              classes={{
                root: 'rd-button-root',
                disabled: 'rd-button-disabled',
              }}
              aria-label="Add Hop"
              startIcon={
                <AddCircleOutlineIcon
                  fontSize="small"
                  className={classes.buttonIcon}
                />
              }
            >
              <Typography variant="caption">Add stopover</Typography>
            </Button>
          </span>
        </Tooltip>
      </Grid>
    );
    fieldRightIcon = (
      <Grid item xs={1} className={classes.buttonWrapper}>
        <Tooltip title="Remove Hop">
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
      </Grid>
    );
  }
  return (
    <Grid
      container
      spacing={1}
      className={classes.gridContainer}
      alignItems="flex-end"
    >
      <Grid item xs={1}>
        <Tooltip title="Move station">
          <IconButton
            className={classes.button}
            aria-label="dragHop"
            size="small"
            disabled
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item xs={1}>
        {fieldLeftIcon}
      </Grid>
      <Grid item xs={searchFieldSize} className={classes.fieldWrapper}>
        <TextField
          style={{
            width: '100%',
          }}
          inputRef={inputReference}
          label={searchFieldLabel}
          color="primary"
          onChange={e => searchStopsHandler(e, index)}
          value={formatSingleStop(singleStop)}
          onKeyDown={processHighlightedResultSelectHandler}
          onFocus={() => {
            dispatch(setIsFieldFocused(true));
            onFieldFocusHandler(index);
          }}
          onBlur={() =>
            setTimeout(() => {
              dispatch(setIsFieldFocused(false));
            }, 500)
          }
          onClick={event => {
            if (event.target.select) {
              event.target.select();
            }
          }}
        />
      </Grid>
      {currentMot === 'foot' ? (
        <FloorSelect index={index} singleStop={singleStop} />
      ) : null}
      {currentMot !== 'foot' ? (
        <TrackSelect index={index} disabled={!isStationName} />
      ) : null}
      {fieldRightIcon}
      {addButton && (
        <Grid container>
          <Grid item xs="2" />
          {addButton}
        </Grid>
      )}
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
