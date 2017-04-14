let currentId = 0;
const setUniqueId = () => (currentId += 1);

const helpers = {
  setUniqueId,
};

export {
  helpers as default,
  setUniqueId,
};
