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

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MapMarkerIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import PropTypes from "prop-types";
import nextId from "react-id-generator";

import * as actions from "../../store/actions";
import "./RoutingMenu.css";
import VALID_MOTS from "../../constants";
import findMotIcon from "../../utils";

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

class RoutingMenu extends React.Component {
  constructor(props) {
    const { mots, onSetCurrentMot } = { props };
    super(props);
    const currentMots = this.validateMots(mots);
    this.state = {
      currentMots,
      currentMot: currentMots[0].name,
      currentSearchResults: [],
      focusedFieldIndex: null,
      currentStops: ["", ""],
      currentStopsGeoJSON: {},
      showLoadingBar: false
    };

    this.SearchCancelToken = axios.CancelToken;
    this.searchCancel = null;
    onSetCurrentMot(currentMots[0].name);
  }

  componentDidUpdate(prevProps) {
    const { clickLocation, onSetCurrentStopsGeoJSON } = this.props;
    const { currentStops, focusedFieldIndex, currentStopsGeoJSON } = this.state;
    if (clickLocation && clickLocation !== prevProps.clickLocation) {
      const updatedCurrentStops = currentStops;
      updatedCurrentStops[focusedFieldIndex] = clickLocation;
      const updatedCurrentStopsGeoJSON = { ...currentStopsGeoJSON };
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
      //
      updatedCurrentStopsGeoJSON[focusedFieldIndex] = tempGeoJSON;
      this.updateCurrentStops(updatedCurrentStops, updatedCurrentStopsGeoJSON);
      onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
    }
  }

  updateCurrentStops = (updatedCurrentStops, updatedCurrentStopsGeoJSON) => {
    this.setState({
      currentStops: updatedCurrentStops,
      currentStopsGeoJSON: updatedCurrentStopsGeoJSON
    });
  };

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

  handleMotChange = (event, newMot) => {
    const { onSetCurrentMot } = this.props;
    this.setState({ currentMot: newMot });
    onSetCurrentMot(newMot);
  };

  onFieldFocus = fieldIndex => {
    this.setState({ focusedFieldIndex: fieldIndex });
  };

  addNewSearchField = indexToInsertAt => {
    const { currentStops } = this.state;
    const updatedCurrentStops = currentStops;
    updatedCurrentStops.splice(indexToInsertAt, 0, "");
    this.setState({ currentStops: updatedCurrentStops });
  };

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

    if (this.searchCancel) this.searchCancel();
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

  processHighlightedResultSelect = event => {
    const { onSetCurrentStopsGeoJSON } = this.props;
    const {
      currentSearchResults,
      currentStops,
      focusedFieldIndex,
      currentStopsGeoJSON
    } = this.state;
    const { firstSearchResult } = currentSearchResults;
    if (event.key === "Enter" && firstSearchResult) {
      const updateCurrentStops = currentStops;
      updateCurrentStops[focusedFieldIndex] = firstSearchResult.properties.name;
      const updateCurrentStopsGeoJSON = { ...currentStopsGeoJSON };
      updateCurrentStopsGeoJSON[focusedFieldIndex] = firstSearchResult;
      this.setState({
        currentStops: updateCurrentStops,
        currentSearchResults: [],
        currentStopsGeoJSON: updateCurrentStopsGeoJSON
      });
      onSetCurrentStopsGeoJSON(updateCurrentStopsGeoJSON);
    }
    if (event.key === "Backspace") {
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

  processClickedResult = searchResult => {
    const { currentStops, focusedFieldIndex, currentStopsGeoJSON } = this.state;
    const { onSetCurrentStopsGeoJSON } = this.props;
    const updateCurrentStops = currentStops;
    updateCurrentStops[focusedFieldIndex] = searchResult.properties.name;
    const updatedCurrentStopsGeoJSON = { currentStopsGeoJSON };
    updatedCurrentStopsGeoJSON[focusedFieldIndex] = searchResult;
    this.setState({
      currentStops: updateCurrentStops,
      currentSearchResults: [],
      currentStopsGeoJSON: updatedCurrentStopsGeoJSON
    });
    onSetCurrentStopsGeoJSON(updatedCurrentStopsGeoJSON);
  };

  processRoute = () => {
    const { onFindRoute } = this.props;
    const { currentStopsGeoJSON, currentMot } = this.state;
    onFindRoute(currentStopsGeoJSON, currentMot);
  };

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
            aria-label="icon tabs example"
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
                  <RadioButtonCheckedIcon fontSize="small" color="secondary" />
                );
                searchFieldLabel = "Select start station, or click on the map";
                fieldRightIcon = (
                  <Grid item xs={1}>
                    <Tooltip title="Add Hop">
                      <IconButton
                        onClick={() => this.addNewSearchField(index + 1)}
                        className="addHop"
                        color="primary"
                        aria-label="Add Hop"
                        component="span"
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                );
              } else if (index === currentStops.length - 1) {
                fieldLeftIcon = <Room color="secondary" />;
                searchFieldLabel = "Select end station, or click on the map";
              } else {
                fieldLeftIcon = <Adjust fontSize="small" color="secondary" />;
                searchFieldSize = 9;
                searchFieldLabel = "Select station, or click on the map";
                fieldRightIcon = (
                  <>
                    <Grid item xs={1}>
                      <Tooltip title="Remove Hop">
                        <IconButton
                          onClick={() => this.removeSearchField(index)}
                          className="addHop"
                          color="secondary"
                          aria-label="removeHop"
                          component="span"
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Add Hop">
                        <IconButton
                          onClick={() => this.addNewSearchField(index + 1)}
                          className="addHop"
                          color="primary"
                          aria-label="addHop"
                          component="span"
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </>
                );
              }
              return (
                <Grid
                  key={nextId()}
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
                      color="secondary"
                      onChange={e => this.searchStops(e, index)}
                      value={singleStop}
                      onKeyDown={this.processHighlightedResultSelect}
                      onFocus={() => this.onFieldFocus(index)}
                      onBlur={this.onFieldBlur}
                    />
                  </Grid>
                  {fieldRightIcon}
                </Grid>
              );
            })}
          </TabPanel>
          {showLoadingBar ? <LinearProgress /> : null}
        </Paper>
        {currentSearchResults.length !== 0 ? (
          <div>
            <hr />
            <Paper square elevation={1}>
              <TabPanel>
                <List component="nav" aria-label="search results">
                  {currentSearchResults.map((searchResult, index) => {
                    if (index !== 0) {
                      return (
                        <ListItem
                          button
                          key={nextId()}
                          onClick={() => {
                            this.processClickedResult(searchResult);
                          }}
                        >
                          <ListItemIcon>
                            <MapMarkerIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={searchResult.properties.name}
                            secondary={`${searchResult.properties.code} - ${searchResult.properties.country_code}`}
                          />
                        </ListItem>
                      );
                    }
                    // First item
                    return (
                      <ListItem
                        onClick={() => this.processClickedResult(searchResult)}
                        button
                        selected
                        key={`searchResult-${searchResult.properties.name}`}
                      >
                        <ListItemIcon>
                          <MapMarkerIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={searchResult.properties.name}
                          secondary={`${searchResult.properties.code} - ${searchResult.properties.country_code}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </TabPanel>
            </Paper>
          </div>
        ) : null}
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
  value: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

RoutingMenu.propTypes = {
  onFindRoute: PropTypes.func.isRequired,
  onSetCurrentMot: PropTypes.func.isRequired,
  onSetCurrentStopsGeoJSON: PropTypes.func.isRequired,
  onShowNotification: PropTypes.func.isRequired,
  clickLocation: PropTypes.arrayOf(PropTypes.number).isRequired,
  APIKey: PropTypes.string.isRequired,
  stationSearchUrl: PropTypes.string.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(RoutingMenu);
