import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';

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
            currentMot: currentMots[0].name
        };
    }

    validateMots = mots => {
        let currentMots = [];
        mots.forEach(providedMot => {
            let requestedMot = VALID_MOTS.find(mot => mot.name === providedMot);
            if(requestedMot)
                currentMots.push(requestedMot);
        });
        if(currentMots.length === 0)
            currentMots.push(VALID_MOTS[0]);
        return(currentMots);
    };

    handleMotChange = (event, newMot) => {
        this.setState({currentMot: newMot});
        console.log(newMot);
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
                                return (<Tab key={"mot-"+currentMot.name} value={currentMot.name} icon={currentMot.icon} aria-label={currentMot.name}/>)
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
                                           color="secondary"/>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton className="addHop" color="primary" aria-label="upload picture"
                                            component="span">
                                    <AddCircleOutlineIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                            <Grid item xs={1}>
                                <RadioButtonCheckedIcon fontSize="small" color="secondary"/>
                            </Grid>
                            <Grid item xs={9}>
                                <TextField style={{width: '100%'}} label="Hop"
                                           color="secondary"/>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton className="addHop" color="secondary" aria-label="upload picture"
                                            component="span">
                                    <RemoveCircleOutlineIcon/>
                                </IconButton>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton className="addHop" color="primary" aria-label="upload picture"
                                            component="span">
                                    <AddCircleOutlineIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1} alignItems="flex-end" style={{width: '100%'}}>
                            <Grid item xs={1}>
                                <Room color="secondary"/>
                            </Grid>
                            <Grid item xs={10}>
                                <TextField style={{width: '100%'}} label="Destination"
                                           color="secondary"/>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton className="addHop" color="primary" aria-label="upload picture"
                                            component="span">
                                    <DirectionsIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Paper>
                <hr/>
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
};

export default RoutingMenu;

