import { getGeneralization } from './generalization';

describe('getGeneralization', () => {
  test('should return null for wrong mot', () => {
    expect(getGeneralization('foo', 6)).toBeNull();
  });
  test('should return null for wrong zoom', () => {
    expect(getGeneralization('rail', '1234')).toBeNull();
  });
  ['bus', 'tram', 'subway'].forEach((mot) => {
    test(`should return the correct graphs for ${mot}`, () => {
      expect(getGeneralization(mot, 15)).toBeNull();
      expect(getGeneralization(mot, 10)).toEqual('gen100');
    });
  });
  ['ferry', 'gondola', 'funicular'].forEach((mot) => {
    test(`should return the correct graphs for ${mot}`, () => {
      expect(getGeneralization(mot, 15.5)).toBeNull();
      expect(getGeneralization(mot, 14)).toEqual('gen150');
      expect(getGeneralization(mot, 11)).toEqual('gen100');
    });
  });
  test('should return the correct graphs for rail', () => {
    expect(getGeneralization('rail', 15.5)).toBeNull();
    expect(getGeneralization('rail', 13)).toEqual('gen100');
    expect(getGeneralization('rail', 10)).toEqual('gen30');
    expect(getGeneralization('rail', 8.5)).toEqual('gen10');
    expect(getGeneralization('rail', 5)).toEqual('gen5');
  });
});
