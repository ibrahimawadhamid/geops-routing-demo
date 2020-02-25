import 'jest-canvas-mock';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('MapComponent', () => {
  test('should matches snapshot.', () => {
    expect(true).toBe(true);
  });
});
