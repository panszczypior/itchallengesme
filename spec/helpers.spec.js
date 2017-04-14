import { setPropsToObj, setUniqueId } from '../src/helpers';

describe('helpers functions', () => {
  it('matches objects with the expect key/value pairs', () => {
    const props = {
      id: 2,
      age: 35,
    };

    const emptyObj = {};
    setPropsToObj(emptyObj, props);
    expect(emptyObj).toEqual(jasmine.objectContaining({
      id: 2,
      age: 35,
    }));
    expect(emptyObj).not.toEqual(jasmine.objectContaining({
      id: 5,
    }));
  });

  it('return unique id', () => {
    expect(setUniqueId()).toEqual(1);
    expect(setUniqueId()).not.toEqual(0);
  });
});
