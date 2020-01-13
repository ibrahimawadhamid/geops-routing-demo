import * as actionTypes from "./actionTypes";

export const setCurrentStopsGeoJSON = (currentStopsGeoJSON) => {
    return {
        type: actionTypes.SET_CURRENT_STOPS_GEOJSON,
        currentStopsGeoJSON: currentStopsGeoJSON,
    };
};

export const setCurrentMot = (currentMot) => {
    return {
        type: actionTypes.SET_CURRENT_MOT,
        currentMot: currentMot,
    };
};