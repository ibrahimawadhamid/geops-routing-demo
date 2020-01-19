import VALID_MOTS from "../src/constants";

test("VALID_MOTS includes 'bus'", () => {
    const result = VALID_MOTS.includes("bus");
    expect(result).toBeTruthy();
});