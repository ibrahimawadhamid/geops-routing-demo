/* eslint-disable no-undef */
import { VALID_MOTS, OTHER_MOTS } from './constants';

describe('constants', () => {
  it("VALID_MOTS should include 'bus'", () => {
    const result = VALID_MOTS.includes('bus');
    expect(result).toBeTruthy();
  });

  it("OTHER_MOTS should include 'tram'", () => {
    const result = OTHER_MOTS.includes('tram');
    expect(result).toBeTruthy();
  });
});
