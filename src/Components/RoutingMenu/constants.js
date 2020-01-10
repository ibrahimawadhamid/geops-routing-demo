import React from 'react';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import RowingIcon from '@material-ui/icons/Rowing';
import TramIcon from '@material-ui/icons/Tram';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsSubwayIcon from '@material-ui/icons/DirectionsSubway';
import CallMergeIcon from '@material-ui/icons/CallMerge';
import SubwayIcon from '@material-ui/icons/Subway';

export const VALID_MOTS = [
    {
        name: "bus",
        icon: <DirectionsBusIcon/>
    },
    {
        name: "ferry",
        icon: <DirectionsBoatIcon/>
    },
    {
        name: "gondola",
        icon: <RowingIcon/>
    },
    {
        name: "tram",
        icon: <TramIcon/>
    },
    {
        name: "rail",
        icon: <DirectionsRailwayIcon/>
    },
    {
        name: "funicular",
        icon: <DirectionsSubwayIcon/>
    },
    {
        name: "cable_car",
        icon: <CallMergeIcon/>
    },
    {
        name: "subway",
        icon: <SubwayIcon/>
    }];