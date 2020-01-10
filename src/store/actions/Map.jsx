import * as actionTypes from "./actionTypes";

export const findRoute = (hops, mot) => {
    return {
        type: actionTypes.FIND_ROUTE,
        hops: hops,
        mot: mot,
    };
};