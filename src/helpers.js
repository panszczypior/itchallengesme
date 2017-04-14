let currentId = 0;
const setUniqueId = () => (currentId += 1);

const setPropsToObj = (obj, props) => {
  Object.keys(props).forEach((key) => {
    obj[key] = props[key]; // eslint-disable-line no-param-reassign
  });
};

const createElement = (type, params = {}, parentToAppend) => {
  const elem = document.createElement(type);

  Object.keys(params).forEach((key) => {
    if (typeof elem[key] === 'object') {
      setPropsToObj(elem[key], params[key]);
    } else {
      elem[key] = params[key];
    }
  });

  if (parentToAppend) {
    parentToAppend.appendChild(elem);
  }

  return elem;
};

const convertMetersToKilometers = (data) => {
  if (data < 1000) {
    return `${data} m`;
  }

  return `${(data / 1000).toFixed(1)} km`;
};

const helpers = {
  convertMetersToKilometers,
  createElement,
  setPropsToObj,
  setUniqueId,
};

export {
  helpers as default,
  convertMetersToKilometers,
  createElement,
  setPropsToObj,
  setUniqueId,
};
