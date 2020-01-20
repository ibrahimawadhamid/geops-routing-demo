import React from "react";
import findMotIcon from "../src/utils";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";
import DirectionsBoatIcon from "@material-ui/icons/DirectionsBoat";
import RowingIcon from "@material-ui/icons/Rowing";
import TramIcon from "@material-ui/icons/Tram";
import DirectionsRailwayIcon from "@material-ui/icons/DirectionsRailway";
import DirectionsSubwayIcon from "@material-ui/icons/DirectionsSubway";
import CallMergeIcon from "@material-ui/icons/CallMerge";
import SubwayIcon from "@material-ui/icons/Subway";

describe("utils", () => {
    it("should return the correct icon", () => {
        let icon = findMotIcon("bus");
        expect(icon).toEqual(<DirectionsBusIcon />);
        icon = findMotIcon("ferry");
        expect(icon).toEqual(<DirectionsBoatIcon />);
        icon = findMotIcon("gondola");
        expect(icon).toEqual(<RowingIcon />);
        icon = findMotIcon("tram");
        expect(icon).toEqual(<TramIcon />);
        icon = findMotIcon("rail");
        expect(icon).toEqual(<DirectionsRailwayIcon />);
        icon = findMotIcon("funicular");
        expect(icon).toEqual(<DirectionsSubwayIcon />);
        icon = findMotIcon("cable_car");
        expect(icon).toEqual(<CallMergeIcon />);
        icon = findMotIcon("subway");
        expect(icon).toEqual(<SubwayIcon />);
        icon = findMotIcon("dummy_test");
        expect(icon).toEqual(<DirectionsBusIcon />);
    });
});