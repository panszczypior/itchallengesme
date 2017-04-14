const addMarker = (event) => {
  const { latLng } = event;
  const marker = new maps.Marker({
    position: latLng,
    map,
    draggable: true,
    // animation: google.maps.Animation.DROP,
    icon: 'src/svg.png',
  });
  const tempMarker = Object.assign(marker, { id: setUniqueId() });
  if (markers.length === 2) {
    removeAllMarkers();
  }
  markers.push(tempMarker)
  marker.addListener('click', removeMarker.bind(this, tempMarker));

  const test = new google.maps.LatLng(latLng.lat(), latLng.lng());
  geocoder.geocode({ latLng: test }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      const { formatted_address } = results[0];
      const contentString = `<div id="content"><div id="siteNotice">${formatted_address}</div> </div>`;
      const info = infoWindow(contentString);
      // marker.addListener('mouseover', () => {
        info.open(map, marker);
      // });
    }
  });
};
