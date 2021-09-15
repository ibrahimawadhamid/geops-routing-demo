import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import _ from 'lodash/core';

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

const FLOOR_REGEX = /\$-?(?:[0-9][0-9]?|100)$/;
const FLOOR_REGEX_CAPTURE = /\$(-?(?:[1-9][0-9]?|100))$/;

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

const swapFc = (input, indexA, indexB) => {
  const temp = input[indexA];

  // eslint-disable-next-line no-param-reassign
  input[indexA] = input[indexB];
  // eslint-disable-next-line no-param-reassign
  input[indexB] = temp;
};

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

  const currentMotsVal = validateMots(mots, DEFAULT_MOTS);
  const otherMotsVal = validateMots(mots, OTHER_MOTS);

  const floorInfo = useSelector(state => state.MapReducer.floorInfo);
  const center = useSelector(state => state.MapReducer.center);
  const tracks = useSelector(state => state.MapReducer.tracks);
  const clickLocation = useSelector(state => state.MapReducer.clickLocation);
  const currentStops = useSelector(state => state.MapReducer.currentStops);
  const showLoadingBar = useSelector(state => state.MapReducer.showLoadingBar);
  const isRouteInfoOpen = useSelector(
    state => state.MapReducer.isRouteInfoOpen,
  );
  const currentStopsGeoJSON = useSelector(
    state => state.MapReducer.currentStopsGeoJSON,
  );
  const currentMot = useSelector(state => state.MapReducer.currentMot);
  const searchMode = useSelector(state => state.MapReducer.searchMode);

  const elRefs = React.useRef([]);
  if (elRefs.current.length !== currentStops.length) {
    elRefs.current = Array(currentStops.length)
      .fill()
      .map((el, i) => elRefs.current[i] || React.createRef());
  }

  const [currentMots] = useState(currentMotsVal);
  const [otherMots] = useState(otherMotsVal);
  const [currentSearchResults, setCurrentSearchResults] = useState([]);
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [currentOtherMot, setCurrentOtherMot] = useState(undefined);

  useEffect(() => {
    if (isRouteInfoOpen) {
      dispatch(setSelectedRoutes([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStops]);

  /**
   * Update the current stops array (string array) and the GeoJSON array in the local state.
   * @param updatedCurrentStops The updated stops.
   * @param updatedCurrentStopsGeoJSON The updated GeoJSON.
   * @category RoutingMenu
   */
  const updateCurrentStops = (
    updatedCurrentStops,
    updatedCurrentStopsGeoJSON,
    updatedFocusedFieldIndex,
  ) => {
    dispatch(setCurrentStops(updatedCurrentStops));
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
    setFocusedFieldIndex(updatedFocusedFieldIndex);
  };

  const updateFieldOnMapClick = (
    updatedCurrentStops,
    updatedFocusedFieldIndex,
  ) => {
    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    const updatedFloorInfo = _.clone(floorInfo);
    updatedFloorInfo[focusedFieldIndex] = '0';
    // Create GeoJSON
    const tempGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            id: clickLocation.slice().reverse(),
            type: 'coordinates',
          },
          geometry: {
            type: 'Point',
            coordinates: clickLocation,
          },
        },
      ],
    };
    const updatedTracks = [...tracks];
    updatedTracks[updatedFocusedFieldIndex - 1] = '';
    updatedCurrentStopsGeoJSON[focusedFieldIndex] = tempGeoJSON;
    updateCurrentStops(
      updatedCurrentStops,
      updatedCurrentStopsGeoJSON,
      updatedFocusedFieldIndex,
    );
    dispatch(setFloorInfo(updatedFloorInfo));
    dispatch(setTracks(updatedTracks));
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
  };

  /**
   * If a location was received through the props (user click on map) act accordingly.
   * @category RoutingMenu
   */
  useEffect(() => {
    if (clickLocation) {
      // A click occurred on the map
      if (currentStops[focusedFieldIndex] === '') {
        // Performs when there's an empty field.
        const updatedCurrentStops = currentStops;
        updatedCurrentStops[focusedFieldIndex] = clickLocation;
        updateFieldOnMapClick(
          currentStops,
          focusedFieldIndex + 1 < currentStops.length
            ? focusedFieldIndex + 1
            : focusedFieldIndex,
        );
      } else {
        const updatedCurrentStops = currentStops;
        const updatedFocusedFieldIndex = focusedFieldIndex;
        updatedCurrentStops[focusedFieldIndex] = clickLocation;
        updateFieldOnMapClick(updatedCurrentStops, focusedFieldIndex);

        const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
        // Create GeoJSON
        const tempGeoJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: clickLocation.slice().reverse(),
                type: 'coordinates',
              },
              geometry: {
                type: 'Point',
                coordinates: clickLocation,
              },
            },
          ],
        };
        updatedCurrentStopsGeoJSON[focusedFieldIndex] = tempGeoJSON;
        updateCurrentStops(
          updatedCurrentStops,
          updatedCurrentStopsGeoJSON,
          updatedFocusedFieldIndex,
        );
        dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickLocation]);

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
    const updatedCurrentStops = _.clone(currentStops);
    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    updatedCurrentStops.splice(indexToInsertAt, 0, '');

    if (updatedCurrentStopsGeoJSON[indexToInsertAt]) {
      const keys = Object.keys(updatedCurrentStopsGeoJSON)
        .filter(k => k >= indexToInsertAt)
        .reverse();
      keys.forEach(k => {
        updatedCurrentStopsGeoJSON[`${parseInt(k, 10) + 1}`] =
          updatedCurrentStopsGeoJSON[k];
      });
    }

    const updatedTracks = [...tracks];
    updatedTracks.splice(indexToInsertAt, 0, '');

    dispatch(setTracks(updatedTracks));
    dispatch(setCurrentStops(updatedCurrentStops));
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
  };

  /**
   * Remove a search field (hop) from a defined index. Then dispatch an update to the stops,
   * so that the route can be updated if exists.
   * @param indexToRemoveFrom The index to remove the search field from.
   * @category RoutingMenu
   */
  const removeSearchFieldHandler = indexToRemoveFrom => {
    const updatedCurrentStops = _.clone(currentStops);
    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    updatedCurrentStops.splice(indexToRemoveFrom, 1);

    if (updatedCurrentStopsGeoJSON[indexToRemoveFrom]) {
      const keys = Object.keys(updatedCurrentStopsGeoJSON);
      keys.forEach(key => {
        const k = parseInt(key, 10);
        if (k === indexToRemoveFrom) {
          delete updatedCurrentStopsGeoJSON[indexToRemoveFrom];
        } else if (k > indexToRemoveFrom) {
          updatedCurrentStopsGeoJSON[k - 1] = updatedCurrentStopsGeoJSON[k];
        }
      });
      delete updatedCurrentStopsGeoJSON[keys.length - 1];
    }

    const updatedTracks = [...tracks];
    updatedTracks.splice(indexToRemoveFrom, 1);

    dispatch(setTracks(updatedTracks));
    dispatch(setCurrentStops(updatedCurrentStops));
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
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
      const updatedCurrentStops = currentStops;
      updatedCurrentStops[fieldIndex] = '';
      setCurrentSearchResults([]);
      dispatch(setCurrentStops(updatedCurrentStops));

      // Reset the track value.
      const updatedTracks = [...tracks];
      updatedTracks[fieldIndex] = '';
      dispatch(setTracks(updatedTracks));

      dispatch(setShowLoadingBar(false));
      return;
    }
    const updatedCurrentStops = _.clone(currentStops);
    updatedCurrentStops[fieldIndex] = event.target.value.trim();
    dispatch(setCurrentStops(updatedCurrentStops));

    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    // const updatedFloorInfo = _.clone(floorInfo);
    // console.log('before', updatedFloorInfo);
    updatedCurrentStops.forEach((stop, idx) => {
      if (typeof stop === 'string' && stop !== '' && stop.includes(',')) {
        // Convert the string to point and filter floor info
        const coords = stop.split(',');
        const newPoint = coords.includes(0) ? [] : to3857(coords);
        // : to3857(coords.map(coord => coord.split('$')[0]));
        updatedCurrentStopsGeoJSON[idx] = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: newPoint.slice().reverse(),
                type: 'coordinates',
              },
              geometry: {
                type: 'Point',
                coordinates: newPoint,
              },
            },
          ],
        };
      }
      /*
      const floorMatched = typeof stop === 'string' && stop.match(FLOOR_REGEX);
      if (floorMatched) {
        [updatedFloorInfo[idx]] = floorMatched;
      } else {
        updatedFloorInfo[idx] = null;
      }
      */
    });

    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
    // Need to be supported when add/remove stop later on.
    // console.log('search setFloorInfo', updatedFloorInfo);
    // dispatch(setFloorInfo(updatedFloorInfo));

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const reqUrl = `${stationSearchUrl}?q=${
      event.target.value
    }&key=${APIKey}${`&mots=${handleStopFinderMot(
      currentMot,
    )}`}&ref_location=${to4326(center)
      .reverse()
      .join(',')}&limit=10`;

    fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          dispatch(showNotification("Couldn't find stations", 'warning'));
          return;
        }
        if (response.features.length === 0) {
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
      const updatedCurrentStops = currentStops;
      updateCurrentStops[focusedFieldIndex] = firstSearchResult.properties.name;
      const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
      updatedCurrentStopsGeoJSON[focusedFieldIndex] = firstSearchResult;
      dispatch(setCurrentStops(updatedCurrentStops));
      setCurrentSearchResults([]);
      dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
    }
    if (event.key === 'Backspace') {
      // The user has erased some of the search query. Reset everything and start all over.
      let updateCurrentSearchResults = [];
      if (event.target.value) updateCurrentSearchResults = currentSearchResults;
      const updatedCurrentStopsGeoJSON = {};
      Object.keys(currentStopsGeoJSON).forEach(key => {
        if (key !== focusedFieldIndex.toString()) {
          updatedCurrentStopsGeoJSON[key] = currentStopsGeoJSON[key];
        }
      });
      setCurrentSearchResults(updateCurrentSearchResults);
      dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
    }
  };

  /**
   * The user uses the mouse/touch to select one of the search results.
   * @param searchResult The clicked search result.
   * @category RoutingMenu
   */
  const processClickedResultHandler = searchResult => {
    const updatedCurrentStops = currentStops;
    updatedCurrentStops[focusedFieldIndex] = searchResult.properties.name;
    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    updatedCurrentStopsGeoJSON[focusedFieldIndex] = searchResult;
    dispatch(setCurrentStops(updatedCurrentStops));

    const updatedTracks = [...tracks];
    updatedTracks[focusedFieldIndex] = '';
    dispatch(setTracks(updatedTracks));
    setCurrentSearchResults([]);

    Object.keys(updatedCurrentStopsGeoJSON).forEach(key => {
      if (key === focusedFieldIndex.toString()) {
        updatedCurrentStopsGeoJSON[key].geometry.coordinates = to3857(
          updatedCurrentStopsGeoJSON[key].geometry.coordinates,
        );
      }
    });
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
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

    const updatedCurrentStops = _.clone(currentStops);
    const [removed] = updatedCurrentStops.splice(result.source.index, 1);
    updatedCurrentStops.splice(result.destination.index, 0, removed);

    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);

    const newSource = { ...updatedCurrentStopsGeoJSON[result.source.index] };
    if (result.destination.index < result.source.index) {
      const keys = Object.keys(updatedCurrentStopsGeoJSON)
        .filter(k => {
          return (
            parseInt(k, 10) >= result.destination.index &&
            parseInt(k, 10) < result.source.index
          );
        })
        .reverse();
      keys.forEach(k => {
        updatedCurrentStopsGeoJSON[`${parseInt(k, 10) + 1}`] =
          updatedCurrentStopsGeoJSON[k];
      });
      updatedCurrentStopsGeoJSON[result.destination.index] = newSource;
    } else if (result.destination.index > result.source.index) {
      const keys = Object.keys(updatedCurrentStopsGeoJSON).filter(
        k =>
          parseInt(k, 10) >= result.source.index &&
          parseInt(k, 10) <= result.destination.index,
      );
      keys.forEach(k => {
        if (parseInt(k, 10) === result.destination.index) {
          updatedCurrentStopsGeoJSON[result.destination.index] = newSource;
        } else {
          updatedCurrentStopsGeoJSON[k] =
            updatedCurrentStopsGeoJSON[`${parseInt(k, 10) + 1}`];
        }
      });
    }

    const updatedTracks = [...tracks];
    swapFc(updatedTracks, result.source.index, result.destination.index);

    dispatch(setTracks(updatedTracks));
    dispatch(setCurrentStops(updatedCurrentStops));
    dispatch(setCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON));
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
              </Tooltip>
            </Grid>
            <Grid item xs={6}>
              <Tooltip title="Route information">
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

export { FLOOR_REGEX, FLOOR_REGEX_CAPTURE };
export default RoutingMenu;
