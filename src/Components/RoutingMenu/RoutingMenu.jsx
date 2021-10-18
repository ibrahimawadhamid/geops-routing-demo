import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { transformExtent } from 'ol/proj';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import InfoIcon from '@material-ui/icons/Info';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';

import {
  setTracks,
  setCurrentStops,
  setCurrentStopsGeoJSON,
  setCurrentMot,
  showNotification,
  setFloorInfo,
  setIsFieldFocused,
  setShowLoadingBar,
  setSelectedRoutes,
  setSearchMode,
  setIsRouteInfoOpen,
  setClickLocation,
} from '../../store/actions/Map';
import './RoutingMenu.scss';
import {
  VALID_MOTS,
  DEFAULT_MOTS,
  OTHER_MOTS,
  SEARCH_MODES,
} from '../../constants';
import { to4326, to3857, findMotIcon } from '../../utils';
import SearchResults from '../SearchResults';
import SearchField from '../SearchField';

const COORD_REGEX = /^\d+\.?\d*,\d+\.?\d*$/;

function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={nextId()}
      style={{ paddingBottom: '20px' }}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && children}
    </Typography>
  );
}

/**
 * The routing menu props
 * @typedef RoutingMenuProps
 * @type {props}
 * @property {string} stationSearchUrl The station search API used for searching.
 * @property {string} APIKey key obtained from geOps that enables you to used the previous API services.
 * @property {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @property {LongLat} clickLocation The location clicked by the user in the form of [long,lat].
 * @category Props
 */

const useStyles = makeStyles(() => ({
  tabs: {
    width: '75%',
  },
  tab: {
    minWidth: '33%',
    width: '33%',
  },
  dropDown: {
    width: '25%',
    backgroundColor: 'white',
  },
  select: {
    height: '100%',
    textAlign: 'center',
  },
  selectInput: {
    backgroundColor: 'white',
    '&:focus': {
      backgroundColor: 'white',
    },
  },
  checkbox: {
    margin: '0px 5px 0px 13px',
  },
}));

let abortController = new AbortController();

/**
 * Validate the mots provided from the props, then retrieve the icons for the valid ones.
 * @param mots The provided mots
 * @returns {Array} The valid mots with their icons
 * @category RoutingMenu
 */
const validateMots = (motsArray, validationMots) => {
  const currentMotsArray = [];

  motsArray
    .filter(mot => {
      return validationMots.includes(mot);
    })
    .forEach(providedMot => {
      const requestedMot = validationMots.find(mot => mot === providedMot);
      if (requestedMot) {
        currentMotsArray.push({
          name: requestedMot,
          icon: findMotIcon(requestedMot),
        });
      }
    });
  if (currentMotsArray.length === 0) {
    currentMotsArray.push({
      name: VALID_MOTS[0],
      icon: findMotIcon(VALID_MOTS[0]),
    });
  }
  return currentMotsArray;
};

// Currently no 'coach' mot available for stop finder.
const handleStopFinderMot = mot => {
  if (mot === 'coach') return 'bus';
  if (mot === 'foot' || mot === 'car') return '';
  return mot;
};

/**
 * The routing menu that controls station search
 * @category RoutingMenu
 */
function RoutingMenu({
  mots,
  stationSearchUrl,
  APIKey,
  isActiveRoute,
  onZoomRouteClick,
  onPanViaClick,
  onDrawNewRoute,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const currentMotsVal = validateMots(mots, DEFAULT_MOTS);
  const otherMotsVal = validateMots(mots, OTHER_MOTS);

  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const center = useSelector(state => state.MapReducer.center);
  const tracks = useSelector(state => state.MapReducer.tracks);
  const clickLocation = useSelector(state => state.MapReducer.clickLocation);
  const currentStops = useSelector(state => state.MapReducer.currentStops);
  const showLoadingBar = useSelector(state => state.MapReducer.showLoadingBar);
  const maxExtent = useSelector(state => state.MapReducer.maxExtent);
  const isRouteInfoOpen = useSelector(
    state => state.MapReducer.isRouteInfoOpen,
  );
  const currentStopsGeoJSON = useSelector(
    state => state.MapReducer.currentStopsGeoJSON,
  );
  const currentMot = useSelector(state => state.MapReducer.currentMot);
  const searchMode = useSelector(state => state.MapReducer.searchMode);

  const [currentMots] = useState(currentMotsVal);
  const [otherMots] = useState(otherMotsVal);
  const [currentSearchResults, setCurrentSearchResults] = useState([]);
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [currentOtherMot, setCurrentOtherMot] = useState(undefined);

  const elRefs = React.useRef([]);
  if (elRefs.current.length !== currentStops.length) {
    elRefs.current = Array(currentStops.length)
      .fill()
      .map((el, i) => elRefs.current[i] || React.createRef());
  }

  useEffect(() => {
    if (isRouteInfoOpen) {
      dispatch(setSelectedRoutes([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStops]);

  /**
   * If a location was received through the props (user click on map) act accordingly.
   * @category RoutingMenu
   */
  useEffect(() => {
    if (clickLocation) {
      currentStops[focusedFieldIndex] = clickLocation;
      if (currentStops.length !== currentStopsGeoJSON.length) {
        currentStopsGeoJSON.splice(focusedFieldIndex, 0, null);
      }

      if (currentStops.length !== floorInfo.length) {
        floorInfo.splice(focusedFieldIndex, 0, '0');
      }

      if (currentStops.length !== tracks.length) {
        tracks.splice(focusedFieldIndex, 0, '');
      }

      tracks[focusedFieldIndex] = '';

      // Let floorSelect component decides if the floor exist on the new point or not
      // floorInfo[focusedFieldIndex] = '0';

      // Create GeoJSON
      currentStopsGeoJSON[focusedFieldIndex] = {
        type: 'Feature',
        properties: {
          id: clickLocation.toString(),
          type: 'coordinates',
        },
        geometry: {
          type: 'Point',
          coordinates: clickLocation,
        },
      };

      // Move the focus to the next field
      const nextFocusFieldIdx =
        focusedFieldIndex + 1 < currentStops.length
          ? focusedFieldIndex + 1
          : focusedFieldIndex;

      // Make sure we only goes here once when the clickLocation has been modified.
      dispatch(setClickLocation(null));
      dispatch(setTracks([...tracks]));
      // dispatch(setFloorInfo([...floorInfo]));
      dispatch(setCurrentStops([...currentStops]));
      dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
      setFocusedFieldIndex(nextFocusFieldIdx);
    }
  }, [
    clickLocation,
    currentStops,
    currentStopsGeoJSON,
    dispatch,
    floorInfo,
    focusedFieldIndex,
    tracks,
  ]);

  /**
   * Process changing the current selected mot, save in local state and dispatch store action.
   * @param event The change event
   * @param newMot The new selected mot
   * @category RoutingMenu
   */
  const handleMotChange = (event, newMot, tracksVal) => {
    const newTracks = [...tracksVal].map(() => '');
    setCurrentOtherMot(null);
    dispatch(setTracks(newTracks));
    dispatch(setCurrentMot(newMot));
  };

  /**
   * Gets callled when a search field is in focus. Keep track of the last focused/selected field.
   * @param fieldIndex The search field index(order)
   * @category RoutingMenu
   */
  const onFieldFocusHandler = fieldIndex => {
    setFocusedFieldIndex(fieldIndex);
    dispatch(setIsFieldFocused(true));
  };

  /**
   * Create a new search field (hop) between already existing search fields
   * @param indexToInsertAt The index to insert the new search field at.
   * @category RoutingMenu
   */
  const addNewSearchFieldHandler = (currStops, indexToInsertAt) => {
    tracks.splice(indexToInsertAt, 0, '');
    floorInfo.splice(indexToInsertAt, 0, '0');
    currentStops.splice(indexToInsertAt, 0, '');
    currentStopsGeoJSON.splice(indexToInsertAt, 0, null);

    dispatch(setTracks([...tracks]));
    dispatch(setFloorInfo([...floorInfo]));
    dispatch(setCurrentStops([...currentStops]));
    dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
  };

  /**
   * Remove a search field (hop) from a defined index. Then dispatch an update to the stops,
   * so that the route can be updated if exists.
   * @param indexToRemoveFrom The index to remove the search field from.
   * @category RoutingMenu
   */
  const removeSearchFieldHandler = indexToRemoveFrom => {
    tracks.splice(indexToRemoveFrom, 1);
    floorInfo.splice(indexToRemoveFrom, 1);
    currentStops.splice(indexToRemoveFrom, 1);
    currentStopsGeoJSON.splice(indexToRemoveFrom, 1);

    dispatch(setTracks([...tracks]));
    dispatch(setFloorInfo([...floorInfo]));
    dispatch(setCurrentStops([...currentStops]));
    dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
  };

  /**
   * Perform searching for stations through the station API
   * @param event
   * @param fieldIndex The search field(hop) index(order)
   * @category RoutingMenu
   */
  const searchStopsHandler = (event, fieldIndex) => {
    // only search if text is available
    if (!event.target.value) {
      // Reset the track value.
      tracks[fieldIndex] = '';
      floorInfo[fieldIndex] = '0';
      currentStops[fieldIndex] = '';
      currentStopsGeoJSON[fieldIndex] = null;

      setCurrentSearchResults([]);
      dispatch(setTracks([...tracks]));
      dispatch(setFloorInfo([...floorInfo]));
      dispatch(setCurrentStops([...currentStops]));
      dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
      dispatch(setShowLoadingBar(false));
      return;
    }

    const stop = event.target.value;

    const isCoord =
      typeof stop === 'string' && stop !== '' && COORD_REGEX.test(stop);

    // if the string is a coordinate
    if (isCoord) {
      // Convert the string to a coordinate
      const coords = to3857(stop.split(','));
      currentStops[fieldIndex] = coords;
      currentStopsGeoJSON[fieldIndex] = {
        type: 'Feature',
        properties: {
          id: coords.toString(),
          type: 'coordinates',
        },
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
      };
    } else {
      currentStops[fieldIndex] = event.target.value;
      currentStopsGeoJSON[fieldIndex] = null;
    }

    tracks[fieldIndex] = '';
    floorInfo[fieldIndex] = '0';

    dispatch(setTracks([...tracks]));
    dispatch(setFloorInfo([...floorInfo]));
    dispatch(setCurrentStops([...currentStops]));
    dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));

    abortController.abort();

    if (isCoord) {
      setCurrentSearchResults([]);
      return;
    }

    abortController = new AbortController();
    const { signal } = abortController;
    const q = event.target.value;

    const reqUrl = `${stationSearchUrl}?q=${q}&key=${APIKey}${`&mots=${handleStopFinderMot(
      currentMot,
    )}`}&ref_location=${to4326(center)
      .reverse()
      .join(',')}&limit=10&bbox=${transformExtent(
      maxExtent,
      'EPSG:3857',
      'EPSG:4326',
    ).toString()}`;

    fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          dispatch(showNotification("Couldn't find stations", 'warning'));
          return;
        }

        // Show only the notification when it make sense, the server returns results only when there is at least 2 letters.
        if (q && q.length >= 2 && response.features.length === 0) {
          dispatch(showNotification("Couldn't find stations", 'warning'));
        }

        setCurrentSearchResults(response.features);
        dispatch(setShowLoadingBar(false));
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
  };

  /**
   * The user makes changes to the current search. Either select the first result,
   * or delete the text to make a new search.
   * @param event
   * @category RoutingMenu
   */
  const processHighlightedResultSelectHandler = event => {
    const [firstSearchResult] = currentSearchResults;
    if (event.key === 'Enter' && firstSearchResult) {
      // The user has chosen the first result by pressing 'Enter' key on keyboard
      currentStops[focusedFieldIndex] = firstSearchResult.properties.name;
      currentStopsGeoJSON[focusedFieldIndex] = firstSearchResult;
      dispatch(setCurrentStops([...currentStops]));
      dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
      setCurrentSearchResults([]);
    }
  };

  /**
   * The user uses the mouse/touch to select one of the search results.
   * @param searchResult The clicked search result.
   * @category RoutingMenu
   */
  const processClickedResultHandler = searchResult => {
    currentStops[focusedFieldIndex] = searchResult.properties.name;

    // Add an element to the array if necessary
    if (currentStops.length !== currentStopsGeoJSON.length) {
      currentStopsGeoJSON.splice(focusedFieldIndex, 0, null);
    }

    if (currentStops.length !== floorInfo.length) {
      floorInfo.splice(focusedFieldIndex, 0, '0');
    }

    if (currentStops.length !== tracks.length) {
      tracks.splice(focusedFieldIndex, 0, '');
    }

    tracks[focusedFieldIndex] = '';
    floorInfo[focusedFieldIndex] = '0';
    currentStopsGeoJSON[focusedFieldIndex] = searchResult;
    currentStopsGeoJSON[focusedFieldIndex].geometry.coordinates = to3857(
      searchResult.geometry.coordinates,
    );

    setCurrentSearchResults([]);
    dispatch(setTracks([...tracks]));
    dispatch(setFloorInfo([...floorInfo]));
    dispatch(setCurrentStops([...currentStops]));
    dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
  };

  const changeCurrentOtherMot = evt => {
    if (!evt) {
      setCurrentOtherMot(null);
    } else {
      const { value } = evt.target;
      handleMotChange({}, value, tracks);
      setCurrentOtherMot(value);
    }
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging ? '#ededed' : 'white',
    ...draggableStyle,
  });

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    let [removed] = currentStops.splice(result.source.index, 1);
    currentStops.splice(result.destination.index, 0, removed);

    [removed] = currentStopsGeoJSON.splice(result.source.index, 1);
    currentStopsGeoJSON.splice(result.destination.index, 0, removed);

    [removed] = tracks.splice(result.source.index, 1);
    tracks.splice(result.destination.index, 0, removed);

    [removed] = floorInfo.splice(result.source.index, 1);
    floorInfo.splice(result.destination.index, 0, removed);

    dispatch(setTracks([...tracks]));
    dispatch(setFloorInfo([...floorInfo]));
    dispatch(setCurrentStops([...currentStops]));
    dispatch(setCurrentStopsGeoJSON([...currentStopsGeoJSON]));
  };

  /**
   * Render the component to the dom.
   * @category RoutingMenu
   */

  if (!onZoomRouteClick || !onPanViaClick) {
    return null;
  }

  return (
    <div className="rd-routing-menu">
      <Paper square elevation={3}>
        <div style={{ height: 5 }}>
          {showLoadingBar ? <LinearProgress /> : null}
        </div>
        <div className="rd-routing-menu-header">
          <Tabs
            value={DEFAULT_MOTS.includes(currentMot) ? currentMot : false}
            className={classes.tabs}
            onChange={(e, mot) => {
              handleMotChange(e, mot, tracks);
            }}
            indicatorColor="primary"
            textColor="primary"
            aria-label="mots icons"
          >
            {currentMots.map(singleMot => {
              return (
                <Tab
                  className={classes.tab}
                  key={`mot-${singleMot.name}`}
                  value={singleMot.name}
                  icon={singleMot.icon}
                  aria-label={singleMot.name}
                  disabled={showLoadingBar}
                />
              );
            })}
          </Tabs>
          {otherMots.length ? (
            <FormControl className={classes.dropDown}>
              <Select
                renderValue={val => (val !== '' ? val : 'Other MOTs')}
                className={classes.select}
                classes={{ root: classes.selectInput }}
                labelId="rd-other-mot-label"
                value={currentOtherMot || ''}
                disableUnderline={!currentOtherMot}
                displayEmpty
                onChange={changeCurrentOtherMot}
                disabled={showLoadingBar}
              >
                {otherMots.map(mot => {
                  return (
                    <MenuItem value={mot.name} key={`other-mot-${mot.name}`}>
                      {mot.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : null}
          {currentMot === 'foot' ? (
            <FormControl className={classes.dropDown}>
              <Select
                renderValue={val => val}
                className={classes.select}
                classes={{ root: classes.selectInput }}
                labelId="rd-other-mot-label"
                value={searchMode}
                disableUnderline
                onChange={evt => dispatch(setSearchMode(evt.target.value))}
              >
                {SEARCH_MODES.map(option => {
                  return (
                    <MenuItem value={option} key={option}>
                      {option}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : null}
        </div>
        <TabPanel>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <div
                  className="stopsContainer"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: 'white',
                  }}
                >
                  {currentStops.map((item, index) => (
                    <Draggable
                      // eslint-disable-next-line react/no-array-index-key
                      key={`searchField-${index}`}
                      draggableId={`searchField-${index}`}
                      index={index}
                    >
                      {(prov, snpsht) => (
                        <div
                          ref={prov.innerRef}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...prov.draggableProps}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...prov.dragHandleProps}
                          style={getItemStyle(
                            snpsht.isDragging,
                            prov.draggableProps.style,
                          )}
                        >
                          <SearchField
                            // eslint-disable-next-line react/no-array-index-key
                            key={`searchField-${index}`}
                            index={index}
                            inputReference={elRefs.current[index]}
                            addNewSearchFieldHandler={addNewSearchFieldHandler}
                            currentStops={currentStops}
                            currentMot={currentMot}
                            removeSearchFieldHandler={removeSearchFieldHandler}
                            searchStopsHandler={searchStopsHandler}
                            singleStop={item}
                            processHighlightedResultSelectHandler={
                              processHighlightedResultSelectHandler
                            }
                            onFieldFocusHandler={onFieldFocusHandler}
                            onPanViaClick={onPanViaClick}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="rd-route-buttons">
            <Grid item xs={6}>
              <Tooltip title="Zoom to the route">
                <span>
                  <Button
                    onClick={() => onZoomRouteClick()}
                    aria-label="Zoom to the route"
                    disabled={!isActiveRoute}
                    component={isActiveRoute ? undefined : 'span'}
                    variant="contained"
                    color="default"
                    classes={{
                      root: 'rd-button-root',
                      disabled: 'rd-button-disabled',
                    }}
                    startIcon={<ZoomInIcon fontSize="small" />}
                  >
                    <Typography>Zoom to the route</Typography>
                  </Button>
                </span>
              </Tooltip>
            </Grid>
            <Grid item xs={6}>
              <Tooltip title="Route information">
                <span>
                  <Button
                    onClick={() => {
                      onDrawNewRoute(true).then(() => {
                        dispatch(setIsRouteInfoOpen(!isRouteInfoOpen));
                      });
                    }}
                    aria-label="Route information"
                    disabled={!isActiveRoute}
                    component={isActiveRoute ? undefined : 'span'}
                    variant="contained"
                    color="default"
                    className={isRouteInfoOpen ? 'rd-button-active' : ''}
                    classes={{
                      root: 'rd-button-root',
                      disabled: 'rd-button-disabled',
                    }}
                    startIcon={<InfoIcon fontSize="small" />}
                  >
                    <Typography>Route information</Typography>
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          </div>
        </TabPanel>
      </Paper>
      <SearchResults
        currentSearchResults={currentSearchResults}
        processClickedResultHandler={processClickedResultHandler}
      />
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string,
  index: PropTypes.number,
};

TabPanel.defaultProps = {
  value: null,
  index: null,
};

RoutingMenu.propTypes = {
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired,
  isActiveRoute: PropTypes.bool.isRequired,
  onZoomRouteClick: PropTypes.func,
  onPanViaClick: PropTypes.func,
  onDrawNewRoute: PropTypes.func.isRequired,
};

RoutingMenu.defaultProps = {
  onZoomRouteClick: undefined,
  onPanViaClick: undefined,
};

export default RoutingMenu;
