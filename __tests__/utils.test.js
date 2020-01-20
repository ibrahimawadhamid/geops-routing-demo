import React from "react";
import findMotIcon from "../src/utils";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";

describe("utils", () => {
    it("should return bus icon", () => {
        const icon = findMotIcon("bus");
        expect(icon).toEqual(<DirectionsBusIcon />);
    });
});