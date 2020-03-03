/* eslint-disable no-undef */
import { VALID_MOTS, OTHER_MOTS, WGS84_MOTS } from './constants';

describe('constants', () => {
  it("VALID_MOTS should include 'bus'", () => {
    const result = VALID_MOTS.includes('bus');
    expect(result).toBeTruthy();
  });

  it("OTHER_MOTS should include 'tram'", () => {
    const result = OTHER_MOTS.includes('tram');
    expect(result).toBeTruthy();
  });

  it("WGS84_MOTS should include 'foot'", () => {
    const result = WGS84_MOTS.includes('foot');
    expect(result).toBeTruthy();
  });
});
