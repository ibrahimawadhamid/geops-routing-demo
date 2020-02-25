/* eslint-disable no-undef */
import VALID_MOTS from './constants';

describe('constants', () => {
  it("VALID_MOTS should include 'bus'", () => {
    const result = VALID_MOTS.includes('bus');
    expect(result).toBeTruthy();
  });
});
