import React from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import Adjust from '@material-ui/icons/Adjust';
import Room from '@material-ui/icons/Room';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import { propTypeCurrentStops } from '../../store/prop-types';
import { to4326 } from '../../utils';
import { setIsFieldFocused } from '../../store/actions/Map';

const useStyles = makeStyles(() => ({
  gridContainer: {
    width: '100%',
    padding: '0px 0px 0px 20px',
    boxSizing: 'unset',
  },
  button: {
    color: 'black',
  },
  fieldWrapper: {
    maxWidth: '75%',
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
  const {
    index,
    addNewSearchFieldHandler,
    currentStops,
    removeSearchFieldHandler,
    searchStopsHandler,
    singleStop,
    processHighlightedResultSelectHandler,
    onFieldFocusHandler,
  } = props;
  let fieldLeftIcon = null;
  let searchFieldSize = 10;
  let searchFieldLabel = '';
  let fieldRightIcon = null;

  const formatSingleStop = val => (Array.isArray(val) ? to4326(val) : val);

  if (index === 0) {
    // Start station field
    fieldLeftIcon = <RadioButtonCheckedIcon fontSize="small" color="primary" />;
    searchFieldLabel = 'Start';
    fieldRightIcon = (
      <Grid item xs={1} className={classes.buttonWrapper}>
        <Tooltip title="Add Hop">
          <IconButton
            onClick={() => addNewSearchFieldHandler(index + 1)}
            className={classes.button}
            aria-label="Add Hop"
            size="small"
          >
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
    );
  } else if (index === currentStops.length - 1) {
    fieldLeftIcon = <Room color="primary" />;
    searchFieldLabel = 'End';
  } else {
    fieldLeftIcon = <Adjust fontSize="small" color="primary" />;
    searchFieldSize = 9;
    searchFieldLabel = 'Hop';
    fieldRightIcon = (
      <>
        <Grid item xs={1} className={classes.buttonWrapper}>
          <Tooltip title="Add Hop">
            <IconButton
              onClick={() => addNewSearchFieldHandler(index + 1)}
              className={classes.button}
              aria-label="addHop"
              size="small"
            >
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={1} className={classes.buttonWrapper}>
          <Tooltip title="Remove Hop">
            <IconButton
              onClick={() => removeSearchFieldHandler(index)}
              className={classes.button}
              aria-label="removeHop"
              size="small"
            >
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
      </>
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
        {fieldLeftIcon}
      </Grid>
      <Grid item xs={searchFieldSize} className={classes.fieldWrapper}>
        <TextField
          style={{
            width: '100%',
          }}
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
      {fieldRightIcon}
    </Grid>
  );
}

SearchField.propTypes = {
  index: PropTypes.number.isRequired,
  addNewSearchFieldHandler: PropTypes.func.isRequired,
  currentStops: propTypeCurrentStops,
  removeSearchFieldHandler: PropTypes.func.isRequired,
  searchStopsHandler: PropTypes.func.isRequired,
  singleStop: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  processHighlightedResultSelectHandler: PropTypes.func.isRequired,
  onFieldFocusHandler: PropTypes.func.isRequired,
};

SearchField.defaultProps = {
  currentStops: [],
  singleStop: '',
};

export default SearchField;
