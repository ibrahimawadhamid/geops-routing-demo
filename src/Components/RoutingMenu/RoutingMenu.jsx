import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import _ from 'lodash/core';
import {
  setCurrentStops,
  setCurrentStopsGeoJSON,
  setCurrentMot,
  showNotification,
  setIsFieldFocused,
} from '../../store/actions/Map';
import './RoutingMenu.css';
import { VALID_MOTS, DEFAULT_MOTS, OTHER_MOTS } from '../../constants';
import { to3857, findMotIcon } from '../../utils';
import SearchResults from '../SearchResults';
import SearchField from '../SearchField';

function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={nextId()}
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
  },
  selectInput: {
    backgroundColor: 'white',
    '&:focus': {
      backgroundColor: 'white',
    },
  },
  checkbox: {
    padding: '20px 23px',
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

  const currentMotsVal = validateMots(mots, DEFAULT_MOTS);
  const otherMotsVal = validateMots(mots, OTHER_MOTS);

  const clickLocation = useSelector(state => state.MapReducer.clickLocation);
  const currentStops = useSelector(state => state.MapReducer.currentStops);
  const currentStopsGeoJSON = useSelector(
    state => state.MapReducer.currentStopsGeoJSON,
  );

  const [currentMots] = useState(currentMotsVal);
  const [currentMot, setCurrentMotState] = useState(currentMotsVal[0].name);
  const [otherMots] = useState(otherMotsVal);
  const [currentSearchResults, setCurrentSearchResults] = useState([]);
  const [searchMotOnly, setSearchMotOnly] = React.useState(true);
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [currentOtherMot, setCurrentOtherMot] = useState(undefined);

  useEffect(() => {
    dispatch(setCurrentMot(currentMots[0].name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleMotChange = (event, newMot) => {
    setCurrentOtherMot(null);
    setCurrentMotState(newMot);
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
  const addNewSearchFieldHandler = indexToInsertAt => {
    const updatedCurrentStops = _.clone(currentStops);
    updatedCurrentStops.splice(indexToInsertAt, 0, '');
    dispatch(setCurrentStops(updatedCurrentStops));
  };

  /**
   * Remove a search field (hop) from a defined index. Then dispatch an update to the stops,
   * so that the route can be updated if exists.
   * @param indexToRemoveFrom The index to remove the search field from.
   * @category RoutingMenu
   */
  const removeSearchFieldHandler = indexToRemoveFrom => {
    const updatedCurrentStops = currentStops;
    updatedCurrentStops.splice(indexToRemoveFrom, 1);
    const updatedCurrentStopsGeoJSON = {};
    Object.keys(currentStopsGeoJSON).forEach(key => {
      if (key !== indexToRemoveFrom.toString()) {
        updatedCurrentStopsGeoJSON[key] = currentStopsGeoJSON[key];
      }
    });
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
      setShowLoadingBar(false);
      return;
    }
    const updatedCurrentStops = _.clone(currentStops);
    updatedCurrentStops[fieldIndex] = event.target.value;
    dispatch(setCurrentStops(updatedCurrentStops));
    setShowLoadingBar(true);

    abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const reqUrl = `${stationSearchUrl}?q=${
      event.target.value
    }&key=${APIKey}&mots=${searchMotOnly ? currentMot : ''}`;

    fetch(reqUrl, { signal })
      .then(response => response.json())
      .then(response => {
        const searchResults = [];
        response.features.forEach(singleResult => {
          // Search results from the API
          if (singleResult.properties.mot[currentMot])
            searchResults.push(singleResult);
        });
        if (response.features.length === 0 || searchResults.length === 0) {
          // No results for the given query
          // onShowNotification("Couldn't find stations", 'warning');
          dispatch(showNotification("Couldn't find stations", 'warning'));
        }
        setCurrentSearchResults(searchResults);
        setShowLoadingBar(false);
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
      handleMotChange({}, value);
      setCurrentOtherMot(value);
    }
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
        <div className="rd-routing-menu-header">
          <Tabs
            value={DEFAULT_MOTS.includes(currentMot) ? currentMot : false}
            className={classes.tabs}
            onChange={(e, mot) => {
              handleMotChange(e, mot);
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
                />
              );
            })}
          </Tabs>
          <FormControl className={classes.dropDown}>
            <Select
              renderValue={val => (val !== '' ? val : 'Other MOTs')}
              className={classes.select}
              classes={{ root: classes.selectInput }}
              labelId="rd-other-mot-label"
              value={currentOtherMot || ''}
              displayEmpty
              onChange={changeCurrentOtherMot}
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
        </div>
        <TabPanel>
          {currentStops.map((singleStop, index) => {
            return (
              <SearchField
                // eslint-disable-next-line react/no-array-index-key
                key={`searchField-${index}`}
                index={index}
                addNewSearchFieldHandler={addNewSearchFieldHandler}
                currentStops={currentStops}
                removeSearchFieldHandler={removeSearchFieldHandler}
                searchStopsHandler={searchStopsHandler}
                singleStop={singleStop}
                processHighlightedResultSelectHandler={
                  processHighlightedResultSelectHandler
                }
                onFieldFocusHandler={onFieldFocusHandler}
                onZoomRouteClick={onZoomRouteClick}
                onPanViaClick={onPanViaClick}
                isActiveRoute={isActiveRoute}
              />
            );
          })}
          <div className="rd-mot-checkbox">
            <Checkbox
              className={classes.checkbox}
              checked={searchMotOnly}
              onChange={() => setSearchMotOnly(!searchMotOnly)}
              color="primary"
              inputProps={{ 'aria-label': 'use only mot' }}
            />
            <span>Search only selected mode of transport</span>
          </div>
        </TabPanel>
        {showLoadingBar ? <LinearProgress /> : null}
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
};

RoutingMenu.defaultProps = {
  onZoomRouteClick: undefined,
  onPanViaClick: undefined,
};

export default RoutingMenu;
