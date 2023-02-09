import * as actionTypes from './actionTypes';

export const setZoom = (zoom) => {
  return {
    type: actionTypes.SET_ZOOM,
    zoom,
  };
};

export const setCenter = (center) => {
  return {
    type: actionTypes.SET_CENTER,
    center,
  };
};

export const setActiveFloor = (activeFloor) => {
  return {
    type: actionTypes.SET_ACTIVE_FLOOR,
    activeFloor,
  };
};

export const setFloorInfo = (floorInfo) => {
  return {
    type: actionTypes.SET_FLOOR_INFO,
    floorInfo,
  };
};

export const setCurrentStops = (currentStops) => {
  return {
    type: actionTypes.SET_CURRENT_STOPS,
    currentStops,
  };
};

export const setCurrentStopsGeoJSON = (currentStopsGeoJSON) => {
  return {
    type: actionTypes.SET_CURRENT_STOPS_GEOJSON,
    currentStopsGeoJSON,
  };
};

export const setCurrentMot = (currentMot) => {
  return {
    type: actionTypes.SET_CURRENT_MOT,
    currentMot,
  };
};

export const setClickLocation = (clickLocation) => {
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

export const setIsFieldFocused = (isFieldFocused) => {
  return {
    type: actionTypes.SET_IS_FIELD_FOCUSED,
    isFieldFocused,
  };
};

export const setShowLoadingBar = (showLoadingBar) => {
  return {
    type: actionTypes.SET_SHOW_LOADING_BAR,
    showLoadingBar,
  };
};

export const setSelectedRoutes = (selectedRoutes) => {
  return {
    type: actionTypes.SET_SELECTED_ROUTES,
    selectedRoutes,
  };
};

export const setIsRouteInfoOpen = (isRouteInfoOpen) => {
  return {
    type: actionTypes.SET_IS_ROUTE_INFO_OPEN,
    isRouteInfoOpen,
  };
};

export const setDialogPosition = (dialogPosition) => {
  return {
    type: actionTypes.SET_DIALOG_POSITION,
    dialogPosition,
  };
};

export const setDialogSize = (dialogSize) => {
  return {
    type: actionTypes.SET_DIALOG_SIZE,
    dialogSize,
  };
};

export const setResolveHops = (resolveHops) => {
  return {
    type: actionTypes.SET_RESOLVE_HOPS,
    resolveHops,
  };
};

export const setTracks = (tracks) => {
  return {
    type: actionTypes.SET_TRACKS,
    tracks,
  };
};

export const setSearchMode = (searchMode) => {
  return {
    type: actionTypes.SET_SEARCH_MODE,
    searchMode,
  };
};

export const setMaxExtent = (maxExtent) => {
  return {
    type: actionTypes.SET_MAX_EXTENT,
    maxExtent,
  };
};

export const setGeneralizationEnabled = (generalizationEnabled) => {
  return {
    type: actionTypes.SET_GENERALIZATION_ENABLED,
    generalizationEnabled,
  };
};

export const setGeneralizationGraph = (generalizationGraph) => {
  return {
    type: actionTypes.SET_GENERALIZATION_GRAPH,
    generalizationGraph,
  };
};

export const setGeneralizationActive = (generalizationActive) => {
  return {
    type: actionTypes.SET_GENERALIZATION_ACTIVE,
    generalizationActive,
  };
};

export const setMode = (mode) => {
  return {
    type: actionTypes.SET_MODE,
    mode,
  };
};

export const setYamlSnippetDialogOpen = (yamlSnippetDialogOpen) => {
  return {
    type: actionTypes.SET_DEBUG_DIALOG_OPEN,
    yamlSnippetDialogOpen,
  };
};
