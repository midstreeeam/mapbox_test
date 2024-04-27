mapboxgl.accessToken = 'pk.eyJ1IjoiZGt1aGNpZ3JvdXAiLCJhIjoiY2x0MDJlOXRvMHcxcjJpbm5udGN0eHIybyJ9.-jJPFQcQf6R_k7mEPiQsOg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    projection: 'mercator', // Use the Mercator projection for a 2D map
    zoom: 1,
    center: [30, 15]
});

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on('load', () => {
    map.setFog({}); // Optional: Adjust or remove this line as it's primarily for globe visualization

    const routes = [
        [[116.4074, 39.9042], [-0.1276, 51.5072]], // Beijing to London
        [[116.4074, 39.9042], [2.3522, 48.8566]], // Beijing to Paris
        [[139.6917, 35.6895], [116.4074, 39.9042]] // Tokyo to Beijing
    ];
    drawArrows(routes); // Draw multiple arrows
});

function drawArrows(routes) {
    routes.forEach((route, index) => {
        const [start, end] = route;

        // Generate curved coordinates for the line
        const curveCoordinates = generateCurveCoordinates(start, end);

        const uniqueId = `route-${index}-${Date.now()}`;

        // Calculate the bearing from the midpoint to the endpoint to rotate the arrowhead correctly
        const midpointIndex = Math.floor(curveCoordinates.length / 2);
        const bearing = turf.bearing(turf.point(curveCoordinates[midpointIndex]), turf.point(end));

        // Add a source and layer for the curved arrow
        map.addSource(uniqueId, {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {
                    'bearing': bearing
                },
                'geometry': {
                    'type': 'LineString',
                    'coordinates': curveCoordinates
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

function generateCurveCoordinates(start, end) {
    const coordinates = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * (start[0] + 0.5 * (end[0] - start[0])) + t * t * end[0];
        const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * (start[1] + 2.5 * (end[1] - start[1])) + t * t * end[1];
        coordinates.push([x, y]);
    }
    return coordinates;
}
