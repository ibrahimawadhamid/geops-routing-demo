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

export const setClickLocation = (clickLocation) => {
    return {
        type: actionTypes.SET_CLICK_LOCATION,
        clickLocation: clickLocation,
    };
};

export const showNotification = (notificationMessage, notificationType) => {
    return {
        type: actionTypes.SHOW_NOTIFICATION,
        notificationMessage: notificationMessage,
        notificationType: notificationType,
    };
};