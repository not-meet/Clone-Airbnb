
mapboxgl.accessToken = map_Token;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12',
    center: cordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

console.log(cordinates)
const marker = new mapboxgl.Marker({ color: 'red', rotation: 45 })
        .setLngLat(cordinates)
        .addTo(map);