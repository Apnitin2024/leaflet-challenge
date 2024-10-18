// Function to determine the marker color based on earthquake depth
function getColor(depth) {
    // Return color based on depth ranges
    return depth >= 90 ? "red" :
           depth >= 70 ? "orange" :
           depth >= 50 ? "yellow" :
           depth >= 30 ? "yellowgreen" :
           depth >= 10 ? "lightgreen" : "green";  // Lowest depth: green
};

// Function to add a legend to the map
function addLegend(map) {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
        let div = L.DomUtil.create('div', 'info legend');
        let ranges = [-10, 10, 30, 50, 70, 90];

        // Create colored squares and labels for each range
        ranges.forEach((range, i) => {
            div.innerHTML += `<i style="background:${getColor(range + 1)}"></i> ${range}–${ranges[i + 1] || '+'}<br>`;
        });

        return div;
    };

    legend.addTo(map);
};

// Function to create the map
function createMap(quakeMarkers) {
    // Create a tile layer for the map
    let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });

    // Create the map object and set its initial view
    let map = L.map("map", {
        center: [39.46463, -98.11159],  // Center of the US
        zoom: 3,
        layers: [streetLayer, quakeMarkers]  // Add markers to the map
    });

    // Add the legend to the map
    addLegend(map);
}

// Function to create earthquake markers
function createMarkers(response) {
    let quakeMarkers = [];

    // Loop through each feature in the response
    response.features.forEach(feature => {
        let [long, lat, depth] = feature.geometry.coordinates;  // Extract coordinates
        let magnitude = feature.properties.mag;

        // Create circle marker for each earthquake
        let quakeMarker = L.circleMarker([lat, long], {
            radius: magnitude * 2,  // Set radius proportional to magnitude
            color: getColor(depth)   // Set color based on depth
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}</p>`);

        quakeMarkers.push(quakeMarker);
    });

    // Create the map with the markers
    createMap(L.layerGroup(quakeMarkers));
}

// Fetch earthquake data and create markers
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
