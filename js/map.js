mapboxgl.accessToken = 'pk.eyJ1IjoiZGt1aGNpZ3JvdXAiLCJhIjoiY2x0MDJlOXRvMHcxcjJpbm5udGN0eHIybyJ9.-jJPFQcQf6R_k7mEPiQsOg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
    zoom: 1,
    center: [30, 15]
});

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on('load', () => {
    map.setFog({}); // Set the default atmosphere style

    // Define points for the arrow
    const beijing = [116.4074, 39.9042]; // Longitude, Latitude
    const london = [-0.1276, 51.5072]; // Longitude, Latitude

    // Add a source and layer for the arrow
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [beijing, london]
            }
        }
    });

    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 6
        }
    });

    // To create an arrow effect, we add another layer for the arrowhead
    map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/arrowhead.png', function(error, image) {
        if (error) throw error;
        map.addImage('arrowhead', image);
        map.addLayer({
            'id': 'arrowhead',
            'type': 'symbol',
            'source': 'route',
            'layout': {
                'icon-image': 'arrowhead',
                'icon-size': 0.25,
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-ignore-placement': true,
                'icon-offset': ['literal', [0, -15]],
                'symbol-placement': 'line-center'
            }
        });
    });
});
