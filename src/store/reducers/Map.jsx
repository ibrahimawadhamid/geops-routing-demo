import * as actionTypes from '../actions/actionTypes';

const initialState = {
    hops: [],
    mot: "bus"
};

const findRoute = (state, action) => {
    const updatedState = {
        hops: action.hops,
        mot: action.mot,
    };
    return {
        ...state,
        ...updatedState
    };
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FIND_ROUTE:
            return findRoute(state, action);
        default:
            return state;
    }
};

export default reducer;