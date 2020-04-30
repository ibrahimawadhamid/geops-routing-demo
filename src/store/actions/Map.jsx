import * as actionTypes from './actionTypes';

export const setCenter = center => {
  return {
    type: actionTypes.SET_CENTER,
    center,
  };
};

export const setFloorInfo = floorInfo => {
  return {
    type: actionTypes.SET_FLOOR_INFO,
    floorInfo,
  };
};

export const setCurrentStops = currentStops => {
  return {
    type: actionTypes.SET_CURRENT_STOPS,
    currentStops,
  };
};

export const setCurrentStopsGeoJSON = currentStopsGeoJSON => {
  return {
    type: actionTypes.SET_CURRENT_STOPS_GEOJSON,
    currentStopsGeoJSON,
  };
};

export const setCurrentMot = currentMot => {
  return {
    type: actionTypes.SET_CURRENT_MOT,
    currentMot,
  };
};

export const setClickLocation = clickLocation => {
  return {
    type: actionTypes.SET_CLICK_LOCATION,
    clickLocation,
  };
};

export const showNotification = (notificationMessage, notificationType) => {
  return {
    type: actionTypes.SHOW_NOTIFICATION,
    notificationMessage,
    notificationType,
  };
};

export const setIsFieldFocused = isFieldFocused => {
  return {
    type: actionTypes.SET_IS_FIELD_FOCUSED,
    isFieldFocused,
  };
};

export const setShowLoadingBar = showLoadingBar => {
  return {
    type: actionTypes.SET_SHOW_LOADING_BAR,
    showLoadingBar,
  };
};

export const setSelectedRoute = selectedRoute => {
  return {
    type: actionTypes.SET_SELECTED_ROUTE,
    selectedRoute,
  };
};

export const setIsRouteInfoOpen = isRouteInfoOpen => {
  return {
    type: actionTypes.SET_IS_ROUTE_INFO_OPEN,
    isRouteInfoOpen,
  };
};

export const setDialogPosition = dialogPosition => {
  return {
    type: actionTypes.SET_DIALOG_POSITION,
    dialogPosition,
  };
};
