import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

import Adjust from '@material-ui/icons/Adjust';
import Room from '@material-ui/icons/Room';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import DirectionsIcon from '@material-ui/icons/Directions';

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
            canSearchForRoute: false
        };

        this.searchCancelToken = axios.CancelToken;
        this.searchCancel = null;
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
        console.log(newMot);
    };

    onFieldFocus = fieldIndex => {
        this.setState({focusedFieldIndex: fieldIndex});
    };

    onFieldBlur = () => {
        this.setState({focusedFieldIndex: null});
    };

    searchStops = (event, fieldIndex) => {
        // only search if text is available
        if (!event.target.value) {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[fieldIndex] = "";
            this.setState({
                currentSearchResults: [],
                currentStops: updateCurrentStops
            });
            return;
        } else {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[fieldIndex] = event.target.value;
            this.setState({
                currentStops: updateCurrentStops
            });
        }
        if (this.searchCancel)
            this.searchCancel();
        axios.get(this.props.stationSearchUrl, {
            params: {
                q: event.target.value,
                key: '5cc87b12d7c5370001c1d655d0a18192eba64838a5fa1ad7d482ab82'
            },
            cancelToken: new this.searchCancelToken((cancel) => {
                this.searchCancel = cancel;
            })
        })
            .then((response) => {
                const searchResults = [];
                response.data.features.forEach(singleResult => {
                    if (singleResult.properties.mot[this.state.currentMot])
                        searchResults.push(singleResult.properties.name);
                });
                this.setState({
                    currentSearchResults: searchResults
                });
            }, (error) => {
                console.log(error);
            });
    };

    processHighlightedResultSelect = event => {
        if (event.key === "Enter" && this.state.currentSearchResults[0]) {
            let updateCurrentStops = this.state.currentStops;
            updateCurrentStops[this.state.focusedFieldIndex] = this.state.currentSearchResults[0];
            this.setState({
                currentStops: updateCurrentStops,
                currentSearchResults: []
            });
        }
    };

    processRoute = () => {
    };

    render() {
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
                        <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                            <Grid item xs={1}>
                                <Adjust fontSize="small" color="secondary"/>
                            </Grid>
                            <Grid item xs={10}>
                                <TextField style={{width: '100%'}} label="Source"
                                           color="secondary" onChange={(e) => this.searchStops(e, 0)}
                                           value={this.state.currentStops[0]}
                                           onKeyDown={this.processHighlightedResultSelect}
                                           onFocus={() => this.onFieldFocus(0)}
                                           onBlur={this.onFieldBlur}/>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton className="addHop" color="primary" aria-label="upload picture"
                                            component="span">
                                    <AddCircleOutlineIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                        {/*<Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>*/}
                        {/*<Grid item xs={1}>*/}
                        {/*<RadioButtonCheckedIcon fontSize="small" color="secondary"/>*/}
                        {/*</Grid>*/}
                        {/*<Grid item xs={9}>*/}
                        {/*<TextField style={{width: '100%'}} label="Hop"*/}
                        {/*color="secondary"/>*/}
                        {/*</Grid>*/}
                        {/*<Grid item xs={1}>*/}
                        {/*<IconButton className="addHop" color="secondary" aria-label="upload picture"*/}
                        {/*component="span">*/}
                        {/*<RemoveCircleOutlineIcon/>*/}
                        {/*</IconButton>*/}
                        {/*</Grid>*/}
                        {/*<Grid item xs={1}>*/}
                        {/*<IconButton className="addHop" color="primary" aria-label="upload picture"*/}
                        {/*component="span">*/}
                        {/*<AddCircleOutlineIcon/>*/}
                        {/*</IconButton>*/}
                        {/*</Grid>*/}
                        {/*</Grid>*/}
                        <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                            <Grid item xs={1}>
                                <Room color="secondary"/>
                            </Grid>
                            <Grid item xs={10}>
                                <TextField style={{width: '100%'}} label="Destination"
                                           color="secondary" onChange={(e) => this.searchStops(e, 1)}
                                           value={this.state.currentStops[1]}
                                           onKeyDown={this.processHighlightedResultSelect}
                                           onFocus={() => this.onFieldFocus(1)}
                                           onBlur={this.onFieldBlur}/>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton disabled={!this.state.canSearchForRoute} className="addHop" color="primary"
                                            aria-label="upload picture"
                                            component="span">
                                    <DirectionsIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </TabPanel>
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
                                                <Typography key={"searchResult-" + searchResult} variant="subtitle1"
                                                            gutterBottom>
                                                    {searchResult}
                                                </Typography>
                                            );
                                        } else {
                                            // First Element
                                            return (
                                                <Typography key={"searchResult-" + searchResult} variant="h6"
                                                            gutterBottom>
                                                    {searchResult}
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

export default RoutingMenu;

