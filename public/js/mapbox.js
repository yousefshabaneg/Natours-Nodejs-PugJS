/* eslint-disable*/

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZWdrdGlrMyIsImEiOiJjbGQ1ajBvN2wwbXhjM25rYjRua3d0YTl1In0.tEDBjvTTaxTXdKbUUubO3g';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/egktik3/cld5kp2lo001r01kayx5hw9fw', // style URL
    scrollZoom: false
    // center: locations[0].coordinates, // starting position [lng, lat]
    // zoom: 10, // starting zoom
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Create a marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
