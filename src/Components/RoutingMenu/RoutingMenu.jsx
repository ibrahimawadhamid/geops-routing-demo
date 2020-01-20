import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import axios from "axios";
import { connect } from "react-redux";

import Adjust from "@material-ui/icons/Adjust";
import Room from "@material-ui/icons/Room";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import nextId from "react-id-generator";

import * as actions from "../../store/actions";
import "./RoutingMenu.css";
import VALID_MOTS from "../../constants";
import findMotIcon from "../../utils";
import SearchResults from "../SearchResults";

const _ = require("lodash/core");

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
      {value === index && <Box p={3}>{children}</Box>}
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
 * @property {function} onShowNotification A store action that can be dispatched, takes the notification message and type as arguments.
 * @property {function} onSetCurrentStopsGeoJSON A store action that can be dispatched, sets the current stops in the store in the form of GeoJSON format.
 * @property {function} onSetCurrentMot TA store action that can be dispatched, sets the current selected mot by the user inside the store.
 * @category Props
 */

/**
 * The routing menu that controls station search
 * @category RoutingMenu
 */
class RoutingMenu extends React.Component {
  /**
   * Default constructor, gets called automatically upon initialization.
   * @param {...RoutingMenuProps} props Props received so that the component can function properly.
   * @category RoutingMenu
   */
  constructor(props) {
    const { mots, onSetCurrentMot } = props;
    super(props);
    const currentMots = this.validateMots(mots);
    this.state = {
      currentMots,
      currentMot: currentMots[0].name,
      currentSearchResults: [],
      focusedFieldIndex: 0,
      currentStops: ["", ""],
      currentStopsGeoJSON: {},
      showLoadingBar: false
    };

    this.SearchCancelToken = axios.CancelToken;
    this.searchCancel = null;
    onSetCurrentMot(currentMots[0].name);
  }

  /**
   * If a location was received through the props (user click on map) act accordingly.
   * @category RoutingMenu
   */
  componentDidUpdate(prevProps) {
    const { clickLocation, onSetCurrentStopsGeoJSON } = this.props;
    const { currentStops, focusedFieldIndex, currentStopsGeoJSON } = this.state;
    if (clickLocation && clickLocation !== prevProps.clickLocation) {
      const updatedCurrentStops = currentStops;
      const updatedFocusedFieldIndex =
        focusedFieldIndex + 1 < currentStops.length
          ? focusedFieldIndex + 1
          : focusedFieldIndex;
      updatedCurrentStops[focusedFieldIndex] = clickLocation;
      const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
      // Create GeoJSON
      const tempGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: clickLocation.slice().reverse(),
              type: "coordinates"
            },
            geometry: {
              type: "Point",
              coordinates: clickLocation
            }
          }
        ]
      };
      updatedCurrentStopsGeoJSON[focusedFieldIndex] = tempGeoJSON;
      this.updateCurrentStops(
        updatedCurrentStops,
        updatedCurrentStopsGeoJSON,
        updatedFocusedFieldIndex
      );
      onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
    }
  }

  /**
   * Update the current stops array (string array) and the GeoJSON array in the local state.
   * @param updatedCurrentStops The updated stops.
   * @param updatedCurrentStopsGeoJSON The updated GeoJSON.
   * @category RoutingMenu
   */
  updateCurrentStops = (
    updatedCurrentStops,
    updatedCurrentStopsGeoJSON,
    updatedFocusedFieldIndex
  ) => {
    this.setState({
      currentStops: updatedCurrentStops,
      currentStopsGeoJSON: updatedCurrentStopsGeoJSON,
      focusedFieldIndex: updatedFocusedFieldIndex
    });
  };

  /**
   * Validate the mots provided from the props, then retrieve the icons for the valid ones.
   * @param mots The provided mots
   * @returns {Array} The valid mots with their icons
   * @category RoutingMenu
   */
  validateMots = mots => {
    const currentMots = [];
    mots.forEach(providedMot => {
      const requestedMot = VALID_MOTS.find(mot => mot === providedMot);
      if (requestedMot) {
        currentMots.push({
          name: requestedMot,
          icon: findMotIcon(requestedMot)
        });
      }
    });
    if (currentMots.length === 0) {
      currentMots.push({
        name: VALID_MOTS[0],
        icon: findMotIcon(VALID_MOTS[0])
      });
    }
    return currentMots;
  };

  /**
   * Process changing the current selected mot, save in local state and dispatch store action.
   * @param event The change event
   * @param newMot The new selected mot
   * @category RoutingMenu
   */
  handleMotChange = (event, newMot) => {
    const { onSetCurrentMot } = this.props;
    this.setState({ currentMot: newMot });
    onSetCurrentMot(newMot);
  };

  /**
   * Gets callled when a search field is in focus. Keep track of the last focused/selected field.
   * @param fieldIndex The search field index(order)
   * @category RoutingMenu
   */
  onFieldFocus = fieldIndex => {
    this.setState({ focusedFieldIndex: fieldIndex });
  };

  /**
   * Create a new search field (hop) between already existing search fields
   * @param indexToInsertAt The index to insert the new search field at.
   * @category RoutingMenu
   */
  addNewSearchField = indexToInsertAt => {
    const { currentStops } = this.state;
    const updatedCurrentStops = currentStops;
    updatedCurrentStops.splice(indexToInsertAt, 0, "");
    this.setState({ currentStops: updatedCurrentStops });
  };

  /**
   * Remove a search field (hop) from a defined index. Then dispatch an update to the stops,
   * so that the route can be updated if exists.
   * @param indexToRemoveFrom The index to remove the search field from.
   * @category RoutingMenu
   */
  removeSearchField = indexToRemoveFrom => {
    const { currentStops, currentStopsGeoJSON } = this.state;
    const { onSetCurrentStopsGeoJSON } = this.props;
    const updatedCurrentStops = currentStops;
    updatedCurrentStops.splice(indexToRemoveFrom, 1);
    const updatedCurrentStopsGeoJSON = {};
    Object.keys(currentStopsGeoJSON).forEach(key => {
      if (key !== indexToRemoveFrom.toString()) {
        updatedCurrentStopsGeoJSON[key] = currentStopsGeoJSON[key];
      }
    });
    this.setState({
      currentStops: updatedCurrentStops,
      currentStopsGeoJSON: updatedCurrentStopsGeoJSON
    });
    onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
  };

  /**
   * Perform searching for stations through the station API
   * @param event
   * @param fieldIndex The search field(hop) index(order)
   * @category RoutingMenu
   */
  searchStops = (event, fieldIndex) => {
    const { currentStops, currentMot } = this.state;
    const { stationSearchUrl, APIKey, onShowNotification } = this.props;
    // only search if text is available
    if (!event.target.value) {
      const updateCurrentStops = currentStops;
      updateCurrentStops[fieldIndex] = "";
      this.setState({
        currentSearchResults: [],
        currentStops: updateCurrentStops,
        showLoadingBar: false
      });
      return;
    }
    const updateCurrentStops = currentStops;
    updateCurrentStops[fieldIndex] = event.target.value;
    this.setState({
      currentStops: updateCurrentStops,
      showLoadingBar: true
    });

    if (this.searchCancel) {
      // If a previous search request has been issues and not completed yet, cancel it.
      this.searchCancel();
    }
    axios
      .get(stationSearchUrl, {
        params: {
          q: event.target.value,
          key: APIKey
        },
        cancelToken: new this.SearchCancelToken(cancel => {
          this.searchCancel = cancel;
        })
      })
      .then(
        response => {
          if (response.data.features.length === 0) {
            // No results for the given query
            onShowNotification("Couldn't find stations", "warning");
          }
          const searchResults = [];
          response.data.features.forEach(singleResult => {
            // Search results from the API
            if (singleResult.properties.mot[currentMot])
              searchResults.push(singleResult);
          });
          this.setState({
            currentSearchResults: searchResults,
            showLoadingBar: false
          });
        },
        error => {
          this.setState({
            showLoadingBar: false
          });
          if (!axios.isCancel(error) || error)
            onShowNotification("Error while searching for stations", "error");
        }
      );
  };

  /**
   * The user makes changes to the current search. Either select the first result,
   * or delete the text to make a new search.
   * @param event
   * @category RoutingMenu
   */
  processHighlightedResultSelect = event => {
    const { onSetCurrentStopsGeoJSON } = this.props;
    const {
      currentSearchResults,
      currentStops,
      focusedFieldIndex,
      currentStopsGeoJSON
    } = this.state;
    const [firstSearchResult] = currentSearchResults;
    if (event.key === "Enter" && firstSearchResult) {
      // The user has chosen the first result by pressing 'Enter' key on keyboard
      const updateCurrentStops = currentStops;
      updateCurrentStops[focusedFieldIndex] = firstSearchResult.properties.name;
      const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
      updatedCurrentStopsGeoJSON[focusedFieldIndex] = firstSearchResult;
      this.setState({
        currentStops: updateCurrentStops,
        currentSearchResults: [],
        currentStopsGeoJSON: updatedCurrentStopsGeoJSON
      });
      onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
    }
    if (event.key === "Backspace") {
      // The user has erased some of the search query. Reset everything and start all over.
      let updateCurrentSearchResults = [];
      if (event.target.value) updateCurrentSearchResults = currentSearchResults;
      const updatedCurrentStopsGeoJSON = {};
      Object.keys(currentStopsGeoJSON).forEach(key => {
        if (key !== focusedFieldIndex.toString()) {
          updatedCurrentStopsGeoJSON[key] = currentStopsGeoJSON[key];
        }
      });
      this.setState({
        currentStopsGeoJSON: updatedCurrentStopsGeoJSON,
        currentSearchResults: updateCurrentSearchResults
      });
      onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
    }
  };

  /**
   * The user uses the mouse/touch to select one of the search results.
   * @param searchResult The clicked search result.
   * @category RoutingMenu
   */
  processClickedResultHandler = searchResult => {
    const { currentStops, focusedFieldIndex, currentStopsGeoJSON } = this.state;
    const { onSetCurrentStopsGeoJSON } = this.props;
    const updateCurrentStops = currentStops;
    updateCurrentStops[focusedFieldIndex] = searchResult.properties.name;
    const updatedCurrentStopsGeoJSON = _.clone(currentStopsGeoJSON);
    updatedCurrentStopsGeoJSON[focusedFieldIndex] = searchResult;
    this.setState({
      currentStops: updateCurrentStops,
      currentSearchResults: [],
      currentStopsGeoJSON: updatedCurrentStopsGeoJSON
    });
    onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
  };

  /**
   * Render the component to the dom.
   * @category RoutingMenu
   */
  render() {
    const {
      currentStops,
      currentMots,
      currentMot,
      showLoadingBar,
      currentSearchResults
    } = this.state;
    return (
      <div className="RoutingMenu">
        <Paper square elevation={3}>
          <Tabs
            value={currentMot}
            onChange={this.handleMotChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            aria-label="mots icons"
          >
            {currentMots.map(singleMot => {
              return (
                <Tab
                  key={`mot-${singleMot.name}`}
                  value={singleMot.name}
                  icon={singleMot.icon}
                  aria-label={singleMot.name}
                />
              );
            })}
          </Tabs>
          <TabPanel>
            {currentStops.map((singleStop, index) => {
              let fieldLeftIcon = null;
              let searchFieldSize = 10;
              let searchFieldLabel = "";
              let fieldRightIcon = null;
              if (index === 0) {
                fieldLeftIcon = (
                  <RadioButtonCheckedIcon fontSize="small" color="primary" />
                );
                searchFieldLabel = "Start";
                fieldRightIcon = (
                  <Grid item xs={1}>
                    <Tooltip title="Add Hop">
                      <IconButton
                        onClick={() => this.addNewSearchField(index + 1)}
                        color="primary"
                        aria-label="Add Hop"
                        size="small"
                      >
                        <AddCircleOutlineIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </Grid>
                );
              } else if (index === currentStops.length - 1) {
                fieldLeftIcon = <Room color="primary" />;
                searchFieldLabel = "End";
              } else {
                fieldLeftIcon = <Adjust fontSize="small" color="primary" />;
                searchFieldSize = 9;
                searchFieldLabel = "Hop";
                fieldRightIcon = (
                  <>
                    <Grid item xs={1}>
                      <Tooltip title="Remove Hop">
                        <IconButton
                          onClick={() => this.removeSearchField(index)}
                          color="secondary"
                          aria-label="removeHop"
                          size="small"
                        >
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Add Hop">
                        <IconButton
                          onClick={() => this.addNewSearchField(index + 1)}
                          color="primary"
                          aria-label="addHop"
                          size="small"
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </>
                );
              }
              return (
                <Grid
                  key={`searchField-${index}`}
                  container
                  spacing={1}
                  alignItems="flex-end"
                  style={{ width: "100%" }}
                >
                  <Grid item xs={1}>
                    {fieldLeftIcon}
                  </Grid>
                  <Grid item xs={searchFieldSize}>
                    <TextField
                      style={{ width: "100%" }}
                      label={searchFieldLabel}
                      color="primary"
                      onChange={e => this.searchStops(e, index)}
                      value={singleStop}
                      onKeyDown={this.processHighlightedResultSelect}
                      onFocus={() => this.onFieldFocus(index)}
                    />
                  </Grid>
                  {fieldRightIcon}
                </Grid>
              );
            })}
          </TabPanel>
          {showLoadingBar ? <LinearProgress /> : null}
        </Paper>
        <SearchResults
          currentSearchResults={currentSearchResults}
          processClickedResultHandler={this.processClickedResultHandler}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    clickLocation: state.MapReducer.clickLocation
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetCurrentMot: currentMot => dispatch(actions.setCurrentMot(currentMot)),
    onSetCurrentStopsGeoJSON: currentStopsGeoJSON =>
      dispatch(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)),
    onSetClickLocation: clickLocation =>
      dispatch(actions.setClickLocation(clickLocation)),
    onShowNotification: (notificationMessage, notificationType) =>
      dispatch(actions.showNotification(notificationMessage, notificationType))
  };
};

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string,
  index: PropTypes.number
};

TabPanel.defaultProps = {
  value: null,
  index: null
};

RoutingMenu.propTypes = {
  onSetCurrentMot: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  clickLocation: PropTypes.arrayOf(PropTypes.number),
  mots: PropTypes.arrayOf(PropTypes.string).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired
};

RoutingMenu.defaultProps = {
  clickLocation: null
};

export default connect(mapStateToProps, mapDispatchToProps)(RoutingMenu);
