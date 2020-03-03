import * as actionTypes from '../actions/actionTypes';

const initialState = {
  currentMot: 'bus',
  currentStops: ['', ''],
  currentStopsGeoJSON: {},
  clickLocation: null,
  notificationMessage: '',
  notificationType: 'info',
  isFieldFocused: false,
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

const reducer = (state = initialState, action) => {
  switch (action.type) {
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
    default:
      return state;
  }
};

export default reducer;
