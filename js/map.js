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

    const routes = [
        [[116.4074, 39.9042], [-0.1276, 51.5072]], // Beijing to London
        [[116.4074, 39.9042], [-74.0060, 40.7128]]   // Beijing to NewYork
    ];
    drawArrows(routes); // Draw multiple arrows
});

function drawArrows(routes) {
    routes.forEach((route, index) => {
        let [start, end] = route;

        // Adjust the end longitude to ensure the arrow takes the shortest path
        const longitudeDifference = end[0] - start[0];
        if (longitudeDifference > 180) {
            end = [end[0] - 360, end[1]];
        } else if (longitudeDifference < -180) {
            end = [end[0] + 360, end[1]];
        }

        const uniqueId = `route-${index}-${Date.now()}`;

        // Calculate the bearing from start to end point to rotate the arrowhead correctly
        const bearing = turf.bearing(turf.point(start), turf.point(end));

        // Add a source and layer for the arrow
        map.addSource(uniqueId, {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {
                    'bearing': bearing
                },
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [start, end]
                }
            }
        });

        map.addLayer({
            'id': uniqueId,
            'type': 'line',
            'source': uniqueId,
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#888',
                'line-width': 6
            }
        });

        // Add another layer for the arrowhead using a built-in or custom icon
        const arrowheadId = `arrowhead-${uniqueId}`;
        map.addLayer({
            'id': arrowheadId,
            'type': 'symbol',
            'source': uniqueId,
            'layout': {
                'icon-image': 'arrow', // Replace 'arrow' with your custom icon ID if using a custom icon
                'icon-size': 0.5,
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-ignore-placement': true,
                'icon-allow-overlap': true,
                'icon-offset': [0, -5],
                'symbol-placement': 'line-center'
            }
        });
    });
}
