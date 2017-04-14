import GoogleMapsLoader from 'google-maps';

import {
  API_KEY,
  initMapSettings,
  dashedLine,
  travelModes,
} from './consts';
import {
  createElement,
  convertMetersToKilometers,
  setUniqueId,
} from './helpers';
import {
  createTooltip,
} from './creators';

const elems = {
  map: document.getElementById('map'),
};
const lines = [];
let markers = [];

Object.assign(
  GoogleMapsLoader,
  {
    KEY: API_KEY,
    LIBRARIES: ['geometry', 'places'],
  },
);

const init = (google) => {
  const { maps } = google;
  const map = new maps.Map(elems.map, {
    ...initMapSettings,
  });
  const geocoder = new maps.Geocoder();
  const directionsService = new maps.DirectionsService();
  const directionsDisplay = new maps.DirectionsRenderer({ preserveViewport: true });
  const calculateControlDiv = createElement('div', { index: 1 });

  const calculateAndDisplayRoute = (points) => {
    const waypoints = points.map((item, index, array) => {
      if (index !== 0 || index !== array.length - 1) {
        return {
          location: item,
          stopover: true,
        };
      }
    });
    directionsDisplay.setMap(map);

    if (points.length > 1) {
      directionsService.route({
        origin: points[0],
        destination: points[points.length - 1],
        waypoints,
        travelMode: travelModes.driving,
      }, (response, status) => {
        if (status === 'OK') {
          const distance = response.routes[0].legs
            .reduce((acc, val) => acc + val.distance.value, 0);
          elems.travelRoute.innerHTML = convertMetersToKilometers(distance);
          directionsDisplay.setDirections(response);
          lines.push(directionsDisplay);
        } else {
          console.warn(`Directions request failed due to ${status}`);
        }
      });
    }
  };

  const drawLine = (points) => {
    const { Polyline } = maps;
    const path = new Polyline({
      path: points,
      strokeOpacity: 0,
      icons: [dashedLine],
    });

    path.setMap(map);

    return path;
  };

  const calculateDistance = () => {
    const {
      LatLng,
      geometry,
    } = maps;

    const points = markers
      .filter(item => item.selected)
      .map(item => (new LatLng(item.position.lat(), item.position.lng())));

    if (points.length > 1) {
      const roundedResult = Math.round(geometry.spherical
        .computeLength(points));

      elems.straightLineRoute.innerHTML = convertMetersToKilometers(roundedResult);
    }

    return points;
  };

  const removeAllLines = () => {
    lines.forEach(item => item.setMap(null));
    lines.length = 0;
    directionsDisplay.setDirections({ routes: [] });
  };

  const distanceHandler = () => {
    removeAllLines();
    const points = calculateDistance();

    calculateAndDisplayRoute(points);

    const straightLine = drawLine(points);

    lines.push(straightLine);
  };

  const calculateControl = () => {
    const controlUI = createElement(
      'div',
      {
        className: 'control-ui',
        title: 'Click to calculate distance',
      },
      calculateControlDiv,
    );

    createElement(
      'div',
      {
        className: 'control-text',
        innerHTML: 'Calculate distance',
      },
      controlUI,
    );

    const resultUI = createElement(
      'div',
      {
        className: 'result-ui',
      },
      calculateControlDiv,
    );

    const firstHeader = createElement(
      'span',
      {
        className: 'result-text',
        innerHTML: 'distance straight line: ',
      },
      resultUI,
    );

    const secondHeader = createElement(
      'span',
      {
        className: 'result-text',
        innerHTML: 'distance travel mode: ',
      },
      resultUI,
    );

    const firstResult = createElement(
      'span',
      {
        innerHTML: '0',
      },
      firstHeader,
    );

    const secondResult = createElement(
      'span',
      {
        innerHTML: '0',
      },
      secondHeader,
    );

    Object.assign(elems, {
      straightLineRoute: firstResult,
      travelRoute: secondResult,
    });

    controlUI.addEventListener(
      'click',
      distanceHandler,
    );
  };

  const getInfoWindow = (content) => {
    const { InfoWindow } = maps;

    return new InfoWindow({
      content,
    });
  };

  const getAddress = (position) => {
    const { GeocoderStatus } = maps;
    return new Promise((resolve, reject) => {
      geocoder.geocode({ latLng: position }, (results, status) => {
        if (status === GeocoderStatus.OK) {
          resolve(results[0].formatted_address);
        } else {
          reject(status);
        }
      });
    });
  };

  const markerSelectedHandler = (position, marker) => {
    marker.selected = !marker.selected; // eslint-disable-line no-param-reassign
    if (marker.selected) {
      getAddress(position).then((data) => {
        const contentString = createTooltip(data);
        marker.infoWindow = getInfoWindow(contentString); // eslint-disable-line no-param-reassign
        marker.infoWindow.open(map, marker);
      });
    } else {
      marker.infoWindow.close(map, marker);
    }
  };

  const removeMarker = (marker) => {
    markers = markers.filter((item) => {
      if (item.id !== marker.id) {
        return item;
      }

      marker.setMap(null);
      return false;
    });
  };

  const addMarker = (event) => {
    const {
      Marker,
      LatLng,
    } = maps;
    const { latLng } = event;
    const position = new LatLng(latLng.lat(), latLng.lng());
    const marker = new Marker({
      position: latLng,
      map,
    });
    const temporaryMarker = Object.assign(
      marker,
      {
        id: setUniqueId(),
        selected: false,
      },
    );

    markers.push(temporaryMarker);
    marker.addListener('rightclick', () => removeMarker(temporaryMarker));
    marker.addListener('click', () => markerSelectedHandler(position, temporaryMarker));
  };

  calculateControl();
  map.controls[maps.ControlPosition.TOP_CENTER].push(calculateControlDiv);

  map.addListener('click', addMarker);
};

GoogleMapsLoader.load(init);
