import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import RowingIcon from '@material-ui/icons/Rowing';
import TramIcon from '@material-ui/icons/Tram';
import DirectionsRailwayIcon from '@material-ui/icons/DirectionsRailway';
import DirectionsSubwayIcon from '@material-ui/icons/DirectionsSubway';
import CallMergeIcon from '@material-ui/icons/CallMerge';
import SubwayIcon from '@material-ui/icons/Subway';


let findMotIcon = (name) => {
    switch (name) {
        case "bus":
            return <DirectionsBusIcon/>;
        case "ferry":
            return <DirectionsBoatIcon/>;
        case "gondola":
            return <RowingIcon/>;
        case "tram":
            return <TramIcon/>;
        case "rail":
            return <DirectionsRailwayIcon/>;
        case "funicular":
            return <DirectionsSubwayIcon/>;
        case "cable_car":
            return <CallMergeIcon/>;
        case "subway":
            return <SubwayIcon/>;
    }
};

export {findMotIcon}