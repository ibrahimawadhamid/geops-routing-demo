import React from "react";
import findMotIcon from "../src/utils";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";

test("get bus icon", () => {
    const icon = findMotIcon("bus");
    expect(icon).toEqual(<DirectionsBusIcon />);
});