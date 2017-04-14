import { API_KEY, initMapSettings, dashedLine } from './consts';
import { setUniqueId } from './helpers';

const GoogleMapsLoader = require('google-maps');


GoogleMapsLoader.KEY = API_KEY;
GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];

const elems = {
  button: document.getElementById('calculate'),
  straightLineRoute: document.getElementById('straight-line-route'),
  travelRoute: document.getElementById('travel-route'),
  map: document.getElementById('map'),
};

let markers = [];
const lines = [];

const drawLine = function drawLine(map, points) {
  const { Polyline } = this;
  const path = new Polyline({
    path: points,
    strokeOpacity: 0,
    icons: [dashedLine],
  });
  path.setMap(map);
  return path;
};

const calculateDistance = function calculateDistance() {
  const {
    LatLng,
    geometry,
  } = this;
  const markerFirstPos = markers[0].position;
  const markerSecondPos = markers[1].position;

  const latLngFirst = new LatLng(markerFirstPos.lat(), markerFirstPos.lng());
  const latLngSecond = new LatLng(markerSecondPos.lat(), markerSecondPos.lng());
  elems.straightLineRoute.innerHTML = geometry.spherical
                                        .computeDistanceBetween(latLngFirst, latLngSecond);

  const points = [
    latLngFirst,
    latLngSecond,
  ];

  return points;
};

const calculateAndDisplayRoute = function calculateAndDisplayRoute(
                                  map,
                                  directionsService,
                                  directionsDisplay,
                                  points) {
  directionsDisplay.setMap(map);
  directionsService.route({
    origin: points[0],
    destination: points[1],
    travelMode: 'DRIVING',
  }, (response, status) => {
    if (status === 'OK') {
      elems.travelRoute.innerHTML = response.routes[0].legs[0].distance.value;
      directionsDisplay.setDirections(response);
      lines.push(directionsDisplay);
    } else {
      console.log(`Directions request failed due to ${status}`);
    }
  });
};

const distanceHandler = function distanceHandler(map, directionsService, directionsDisplay) {
  const points = calculateDistance.call(this);
  calculateAndDisplayRoute(map, directionsService, directionsDisplay, points);
  const straightLine = drawLine.call(this, map, points);
  lines.push(straightLine);
};

const removeAllMarkers = () => {
  markers.forEach(item => item.setMap(null));
  markers.length = 0;
};

const removeAllLines = () => {
  lines.forEach(item => item.setMap(null));
  lines.length = 0;
};

const getInfo = function getInfo(content) {
  const { InfoWindow } = this;
  return new InfoWindow({
    content,
  });
};

const removeMarker = (marker) => {
  const include = markers
    .map(item => item.id)
    .includes(marker.id);
  if (include) {
    markers = markers.filter((item) => {
      if (item.id !== marker.id) {
        return item;
      }
      marker.setMap(null);
      return false;
    });
  }
};

const addMarker = function addMarker(map, geocoder, directionsDisplay, event) {
  const { Marker, LatLng, GeocoderStatus } = this;
  const { latLng } = event;
  const marker = new Marker({
    position: latLng,
    map,
    draggable: true,
  });

  const temporaryMarker = Object.assign(marker, { id: setUniqueId() });
  if (markers.length === 2) {
    removeAllMarkers();
    removeAllLines();
  }
  markers.push(temporaryMarker);
  marker.addListener('click', removeMarker.bind(this, temporaryMarker));
  const position = new LatLng(latLng.lat(), latLng.lng());
  geocoder.geocode({ latLng: position }, (results, status) => {
    if (status === GeocoderStatus.OK) {
      const { formatted_address } = results[0];
      const contentString = `<div id="content"><div id="siteNotice">${formatted_address}</div> </div>`;
      // zamien to na document create element etc
      const infoWindow = getInfo.call(this, contentString);
      infoWindow.open(map, marker);
    }
  });
};

function CalculateControl(controlDiv, map, maps, directionsService, directionsDisplay) {
  const controlUI = document.createElement('div');
  controlUI.className = 'control-ui';
  controlUI.title = 'Click to calculate distance';
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement('div');
  controlText.className = 'control-text';
  controlText.innerHTML = 'Calculate distance';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', distanceHandler.bind(maps, map, directionsService, directionsDisplay));
}

GoogleMapsLoader.load((google) => {
  const { maps } = google;
  const map = new maps.Map(elems.map, {
    ...initMapSettings,
  });
  const geocoder = new maps.Geocoder();
  const directionsService = new maps.DirectionsService();
  const directionsDisplay = new maps.DirectionsRenderer();

  const calculateControlDiv = document.createElement('div');
  const calculateControl = new CalculateControl(calculateControlDiv, map, maps, directionsService, directionsDisplay);
  calculateControlDiv.index = 1;
  map.controls[maps.ControlPosition.TOP_CENTER].push(calculateControlDiv);
  map.addListener('click', addMarker.bind(maps, map, geocoder, directionsDisplay));
});
