const API_KEY = 'AIzaSyCEdNOJVM6_Nn71kykx8N_eUdM3kQ0Fbko';
const cracovPosition = {
  lat: 50.0647,
  lng: 19.9450,
};

const initMapSettings = {
  center: cracovPosition,
  scrollwheel: true,
  zoom: 15,
};

const dashedLine = {
  icon: {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 4,
  },
  offset: '0',
  repeat: '20px',
};

const travelModes = {
  driving: 'DRIVING',
};

const consts = {
  API_KEY,
  dashedLine,
  initMapSettings,
  travelModes,
};

export {
  consts as default,
  API_KEY,
  dashedLine,
  initMapSettings,
  travelModes,
};
