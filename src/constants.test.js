/* eslint-disable no-undef */
import constants from './constants';

describe('constants', () => {
  it("VALID_MOTS should include 'bus'", () => {
    const result = constants.VALID_MOTS.includes('bus');
    expect(result).toBeTruthy();
  });
});
