import { Map } from 'ol';
import LayerService from 'react-spatial/LayerService';
import * as actionTypes from '../actions/actionTypes';
import { SEARCH_MODES } from '../../constants';

const initialState = {
  center: [949042.143189, 5899715.591163],
  activeFloor: 0,
  currentMot: 'rail',
  floorInfo: [null, null],
  currentStops: ['', ''],
  currentStopsGeoJSON: {},
  clickLocation: null,
  notificationMessage: '',
  notificationType: 'info',
  isFieldFocused: false,
  showLoadingBar: false,
  selectedRoutes: [],
  isRouteInfoOpen: false,
  dialogPosition: {
    x: 10,
    y: 280,
  },
  dialogSize: {
    height: 550,
    width: 500,
  },
  olMap: new Map({
    controls: [],
  }),
  resolveHops: false,
  searchMode: SEARCH_MODES[0],
  tracks: [null, null],
  layerService: new LayerService([]),
};

const setCenter = (state, action) => {
  const updatedState = {
    center: action.center,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setFloorInfo = (state, action) => {
  const updatedState = {
    floorInfo: action.floorInfo,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setCurrentStops = (state, action) => {
  const updatedState = {
    currentStops: action.currentStops,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setCurrentStopsGeoJSON = (state, action) => {
  const updatedState = {
    currentStopsGeoJSON: action.currentStopsGeoJSON,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setCurrentMot = (state, action) => {
  const updatedState = {
    currentMot: action.currentMot,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setClickLocation = (state, action) => {
  const updatedState = {
    clickLocation: action.clickLocation,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const showNotification = (state, action) => {
  const updatedState = {
    notificationMessage: action.notificationMessage,
    notificationType: action.notificationType,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setIsFieldFocused = (state, action) => {
  const updatedState = {
    isFieldFocused: action.isFieldFocused,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setShowLoadingBar = (state, action) => {
  const updatedState = {
    showLoadingBar: action.showLoadingBar,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setSelectedRoutes = (state, action) => {
  const updatedState = {
    selectedRoutes: action.selectedRoutes,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setIsRouteInfoOpen = (state, action) => {
  const updatedState = {
    isRouteInfoOpen: action.isRouteInfoOpen,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setDialogPosition = (state, action) => {
  const updatedState = {
    dialogPosition: action.dialogPosition,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setDialogSize = (state, action) => {
  return {
    ...state,
    dialogSize: {
      height: action.dialogSize.height,
      width: action.dialogSize.width,
    },
    dialogPosition: {
      x: action.dialogSize.x,
      y: action.dialogSize.y,
    },
  };
};

const setResolveHops = (state, action) => {
  const updatedState = {
    resolveHops: action.resolveHops,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setTracks = (state, action) => {
  const updatedState = {
    tracks: action.tracks,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const setSearchMode = (state, action) => {
  const updatedState = {
    searchMode: action.searchMode,
  };
  return {
    ...state,
    ...updatedState,
  };
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_CENTER:
      return setCenter(state, action);
    case actionTypes.SET_FLOOR_INFO:
      return setFloorInfo(state, action);
    case actionTypes.SET_CURRENT_STOPS:
      return setCurrentStops(state, action);
    case actionTypes.SET_CURRENT_STOPS_GEOJSON:
      return setCurrentStopsGeoJSON(state, action);
    case actionTypes.SET_CURRENT_MOT:
      return setCurrentMot(state, action);
    case actionTypes.SET_CLICK_LOCATION:
      return setClickLocation(state, action);
    case actionTypes.SHOW_NOTIFICATION:
      return showNotification(state, action);
    case actionTypes.SET_IS_FIELD_FOCUSED:
      return setIsFieldFocused(state, action);
    case actionTypes.SET_SHOW_LOADING_BAR:
      return setShowLoadingBar(state, action);
    case actionTypes.SET_SELECTED_ROUTES:
      return setSelectedRoutes(state, action);
    case actionTypes.SET_IS_ROUTE_INFO_OPEN:
      return setIsRouteInfoOpen(state, action);
    case actionTypes.SET_DIALOG_POSITION:
      return setDialogPosition(state, action);
    case actionTypes.SET_DIALOG_SIZE:
      return setDialogSize(state, action);
    case actionTypes.SET_SEARCH_MODE:
      return setSearchMode(state, action);
    case actionTypes.SET_RESOLVE_HOPS:
      return setResolveHops(state, action);
    case actionTypes.SET_TRACKS:
      return setTracks(state, action);
    default:
      return state;
  }
};

export default reducer;
