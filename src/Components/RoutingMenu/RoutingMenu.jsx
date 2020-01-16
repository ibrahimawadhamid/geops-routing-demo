import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from 'axios';
import {connect} from 'react-redux';

import Adjust from '@material-ui/icons/Adjust';
import Room from '@material-ui/icons/Room';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import DirectionsIcon from '@material-ui/icons/Directions';

import * as actions from "../../store/actions";
import "./RoutingMenu.css";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import {VALID_MOTS} from "./constants";


function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    );
}

class RoutingMenu extends React.Component {
    constructor(props) {
        super(props);
        const currentMots = this.validateMots(props.mots);
        this.state = {
            currentMots: currentMots,
            currentMot: currentMots[0].name,
            currentSearchResults: [],
            focusedFieldIndex: null,
            currentStops: ["", ""],
            currentStopsGeoJSON: {},
            showLoadingBar: false,
        };

        this.searchCancelToken = axios.CancelToken;
        this.searchCancel = null;
        this.props.onSetCurrentMot(currentMots[0].name);
    }

    componentDidUpdate(prevProps) {
        if (this.props.clickLocation && this.props.clickLocation !== prevProps.clickLocation) {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[this.state.focusedFieldIndex] = this.props.clickLocation;
            let updateCurrentStopsGeoJSON = {...this.state.currentStopsGeoJSON};
            // Create GeoJSON
            let tempGeoJSON = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "id": this.props.clickLocation.slice().reverse(),
                            "type": "coordinates"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": this.props.clickLocation
                        }
                    }
                ]
            }
            //
            updateCurrentStopsGeoJSON[this.state.focusedFieldIndex] = tempGeoJSON;
            this.setState({
                currentStops: updateCurrentStops,
                currentStopsGeoJSON: updateCurrentStopsGeoJSON
            });
            this.props.onSetCurrentStopsGeoJSON(updateCurrentStopsGeoJSON);
        }
    }

    validateMots = mots => {
        let currentMots = [];
        mots.forEach(providedMot => {
            let requestedMot = VALID_MOTS.find(mot => mot.name === providedMot);
            if (requestedMot)
                currentMots.push(requestedMot);
        });
        if (currentMots.length === 0)
            currentMots.push(VALID_MOTS[0]);
        return (currentMots);
    };

    handleMotChange = (event, newMot) => {
        this.setState({currentMot: newMot});
        this.props.onSetCurrentMot(newMot);
    };

    onFieldFocus = fieldIndex => {
        this.setState({focusedFieldIndex: fieldIndex});
    };

    onFieldBlur = () => {
        this.setState({focusedFieldIndex: null});
    };

    addNewSearchField = (indexToInsertAt) => {
        let updatedCurrentStops = this.state.currentStops;
        updatedCurrentStops.splice(indexToInsertAt, 0, "");
        this.setState({currentStops: updatedCurrentStops});
    }
    removeSearchField = (indexToRemoveFrom) => {
        let updatedCurrentStops = this.state.currentStops;
        updatedCurrentStops.splice(indexToRemoveFrom, 1);
        let updateCurrentStopsGeoJSON = {};
        for (let key in this.state.currentStopsGeoJSON) {
            if(key !== indexToRemoveFrom.toString()) {
                updateCurrentStopsGeoJSON[key] = this.state.currentStopsGeoJSON[key];
            }
        }
        this.setState({
            currentStops: updatedCurrentStops,
            currentStopsGeoJSON: updateCurrentStopsGeoJSON
        });
        this.props.onSetCurrentStopsGeoJSON(updateCurrentStopsGeoJSON);
    }

    searchStops = (event, fieldIndex) => {
        // only search if text is available
        if (!event.target.value) {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[fieldIndex] = "";
            this.setState({
                currentSearchResults: [],
                currentStops: updateCurrentStops,
                showLoadingBar: false
            });
            return;
        } else {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[fieldIndex] = event.target.value;
            this.setState({
                currentStops: updateCurrentStops,
                showLoadingBar: true
            });
        }
        if (this.searchCancel)
            this.searchCancel();
        axios.get(this.props.stationSearchUrl, {
            params: {
                q: event.target.value,
                key: this.props.APIKey
            },
            cancelToken: new this.searchCancelToken((cancel) => {
                this.searchCancel = cancel;
            })
        })
            .then((response) => {
                const searchResults = [];
                response.data.features.forEach(singleResult => {
                    if (singleResult.properties.mot[this.state.currentMot])
                        searchResults.push(singleResult);
                });
                this.setState({
                    currentSearchResults: searchResults,
                    showLoadingBar: false
                });
            }, (error) => {
                console.log(error);
                this.setState({
                    showLoadingBar: false
                });
            });
    };

    processHighlightedResultSelect = event => {
        if (event.key === "Enter" && this.state.currentSearchResults[0]) {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[this.state.focusedFieldIndex] = this.state.currentSearchResults[0].properties.name;
            let updateCurrentStopsGeoJSON = {...this.state.currentStopsGeoJSON};
            updateCurrentStopsGeoJSON[this.state.focusedFieldIndex] = this.state.currentSearchResults[0];
            this.setState({
                currentStops: updateCurrentStops,
                currentSearchResults: [],
                currentStopsGeoJSON: updateCurrentStopsGeoJSON
            });
            this.props.onSetCurrentStopsGeoJSON(updateCurrentStopsGeoJSON);
        }
        if(event.key === "Backspace") {
            let updateCurrentSearchResults = [];
            if(event.target.value)
                updateCurrentSearchResults = this.state.currentSearchResults;
            let updateCurrentStopsGeoJSON = {};
            for (let key in this.state.currentStopsGeoJSON) {
                if(key !== this.state.focusedFieldIndex.toString()) {
                    updateCurrentStopsGeoJSON[key] = this.state.currentStopsGeoJSON[key];
                }
            }
            this.setState({
                currentStopsGeoJSON: updateCurrentStopsGeoJSON,
                currentSearchResults: updateCurrentSearchResults
            });
            this.props.onSetCurrentStopsGeoJSON(updateCurrentStopsGeoJSON);
        }
    };

    processRoute = () => {
        this.props.onFindRoute(this.state.currentStopsGeoJSON, this.state.currentMot);
    };

    render() {
        const actualStops = this.state.currentStops.filter(function (singleStop) {
            return singleStop !== "";
        });
        const canSearchForRoute = actualStops.length > 1 ? true : false;
        return (
            <div className="RoutingMenu">
                <Paper square elevation={3}>
                    <Tabs
                        value={this.state.currentMot}
                        onChange={this.handleMotChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="icon tabs example"
                    >
                        {
                            this.state.currentMots.map(currentMot => {
                                return (
                                    <Tab key={"mot-" + currentMot.name} value={currentMot.name} icon={currentMot.icon}
                                         aria-label={currentMot.name}/>);
                            })
                        }
                    </Tabs>
                    <TabPanel>
                        {
                            this.state.currentStops.map((singleStop, index) => {
                                let fieldLeftIcon = null;
                                let searchFieldSize = 10;
                                let searchFieldLabel = "";
                                let fieldRightIcon = null;
                                if(index === 0) {
                                    fieldLeftIcon = <RadioButtonCheckedIcon fontSize="small" color="secondary"/>;
                                    searchFieldLabel = "Select start station, or click on the map";
                                    fieldRightIcon = (
                                        <Grid item xs={1}>
                                            <IconButton onClick={() => this.addNewSearchField(index+1)} className="addHop" color="primary" aria-label="Add Hop"
                                                        component="span">
                                                <AddCircleOutlineIcon/>
                                            </IconButton></Grid>);
                                } else if (index === this.state.currentStops.length - 1) {
                                    fieldLeftIcon = <Room color="secondary"/>;
                                    searchFieldLabel = "Select end station, or click on the map";
                                    fieldRightIcon = (
                                        <Grid item xs={1}>
                                            <IconButton disabled={!canSearchForRoute} className="addHop" color="primary"
                                                        aria-label="Find Route" onClick={this.processRoute}
                                                        component="span">
                                                <DirectionsIcon/>
                                            </IconButton></Grid>);
                                } else {
                                    fieldLeftIcon = <Adjust fontSize="small" color="secondary"/>;
                                    searchFieldSize = 9;
                                    searchFieldLabel = "Select station, or click on the map";
                                    fieldRightIcon = (
                                        <React.Fragment><Grid item xs={1}>
                                            <IconButton onClick={() => this.removeSearchField(index)}
                                                        className="addHop" color="secondary" aria-label="upload picture"
                                                        component="span">
                                                <RemoveCircleOutlineIcon/>
                                            </IconButton>
                                        </Grid>
                                            <Grid item xs={1}>
                                                <IconButton onClick={() => this.addNewSearchField(index+1)}
                                                    className="addHop" color="primary"
                                                            aria-label="upload picture"
                                                            component="span">
                                                    <AddCircleOutlineIcon/>
                                                </IconButton></Grid></React.Fragment>);
                                }
                                return(
                                    <Grid key={"searchField-"+index} container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                                        <Grid item xs={1}>
                                            {fieldLeftIcon}
                                        </Grid>
                                        <Grid item xs={searchFieldSize}>
                                            <TextField style={{width: '100%'}} label={searchFieldLabel}
                                                       color="secondary" onChange={(e) => this.searchStops(e, index)}
                                                       value={singleStop}
                                                       onKeyDown={this.processHighlightedResultSelect}
                                                       onFocus={() => this.onFieldFocus(index)}
                                                       onBlur={this.onFieldBlur}
                                            />
                                        </Grid>
                                            {fieldRightIcon}
                                    </Grid>
                                )
                            })
                        }
                    </TabPanel>
                    {this.state.showLoadingBar ? <LinearProgress/> : null}
                </Paper>
                {
                    this.state.currentSearchResults.length !== 0 ?
                        <div>
                            <hr/>
                            <Paper square elevation={1}>
                                <TabPanel>
                                    {this.state.currentSearchResults.map((searchResult, index) => {
                                        if (index !== 0) {
                                            return (
                                                <Typography key={"searchResult-" + searchResult.properties.name} variant="subtitle1"
                                                            gutterBottom>
                                                    {searchResult.properties.name}
                                                </Typography>
                                            );
                                        } else {
                                            // First Element
                                            return (
                                                <Typography key={"searchResult-" + searchResult.properties.name} variant="h6"
                                                            gutterBottom>
                                                    {searchResult.properties.name}
                                                </Typography>
                                            );
                                        }
                                    })}
                                </TabPanel>
                            </Paper>
                        </div> : null
                }
            </div>
        );
    }
};

const mapStateToProps = state => {
    return {
        clickLocation: state.MapReducer.clickLocation,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSetCurrentMot: (currentMot) => dispatch(actions.setCurrentMot(currentMot)),
        onSetCurrentStopsGeoJSON: (currentStopsGeoJSON) => dispatch(actions.setCurrentStopsGeoJSON(currentStopsGeoJSON)),
        onSetClickLocation: (clickLocation) => dispatch(actions.setClickLocation(clickLocation)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RoutingMenu);