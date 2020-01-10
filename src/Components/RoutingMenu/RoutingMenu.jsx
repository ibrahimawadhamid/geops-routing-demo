import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import RowingIcon from '@material-ui/icons/Rowing';
import TramIcon from '@material-ui/icons/Tram';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsSubwayIcon from '@material-ui/icons/DirectionsSubway';
import CallMergeIcon from '@material-ui/icons/CallMerge';
import SubwayIcon from '@material-ui/icons/Subway';

import Adjust from '@material-ui/icons/Adjust';
import Room from '@material-ui/icons/Room';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import DirectionsIcon from '@material-ui/icons/Directions';

import "./RoutingMenu.css";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";

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

export default function RoutingMenu() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className="RoutingMenu">
            <Paper square elevation={3}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="icon tabs example"
                >
                    <Tab icon={<DirectionsBusIcon/>} aria-label="bus"/>
                    <Tab icon={<DirectionsBoatIcon/>} aria-label="ferry"/>
                    <Tab icon={<RowingIcon/>} aria-label="gondola"/>
                    <Tab icon={<TramIcon/>} aria-label="tram"/>
                    <Tab icon={<DirectionsRailwayIcon/>} aria-label="rail"/>
                    <Tab icon={<DirectionsSubwayIcon/>} aria-label="funicular"/>
                    <Tab icon={<CallMergeIcon/>} aria-label="cable_car"/>
                    <Tab icon={<SubwayIcon/>} aria-label="subway"/>
                </Tabs>
                <TabPanel>
                    <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                        <Grid item xs={1}>
                            <Adjust fontSize="small" color="secondary"/>
                        </Grid>
                        <Grid item xs={10}>
                            <TextField style={{width: '100%'}} id="standard-secondary" label="Source"
                                       color="secondary"/>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton className="addHop" color="primary" aria-label="upload picture" component="span">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                        <Grid item xs={1}>
                            <RadioButtonCheckedIcon fontSize="small" color="secondary"/>
                        </Grid>
                        <Grid item xs={9}>
                            <TextField style={{width: '100%'}} id="standard-secondary" label="Hop" color="secondary"/>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton className="addHop" color="secondary" aria-label="upload picture" component="span">
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton className="addHop" color="primary" aria-label="upload picture" component="span">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                        <Grid item xs={1}>
                            <Room color="secondary"/>
                        </Grid>
                        <Grid item xs={10}>
                            <TextField style={{width: '100%'}} id="standard-secondary" label="Destination"
                                       color="secondary"/>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton className="addHop" color="primary" aria-label="upload picture" component="span">
                                <DirectionsIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Paper>
            <hr />
            <Paper square elevation={1}>
                <TabPanel>
                    <Typography variant="h6" gutterBottom>
                        Olten
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Otlen Hammer
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Wangen bei Otlen
                    </Typography>
                </TabPanel>
            </Paper>
        </div>
    );
}

