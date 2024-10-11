import { API_KEY } from './config.js';

// Overlay layers
const earthquakeLayer = new L.layerGroup();
const tectLayer = new L.layerGroup();

// Base layers
const geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

const baseLayers = {
    "Outdoor": geoLayer,
    "Satellite": satelliteLayer,
};

const overlays = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectLayer,
};

// Initialize map
const myMap = L.map("map", {
    center: [37.6, -95.665],
    zoom: 2.5,
    layers: [satelliteLayer, earthquakeLayer]
});

// Add control
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(myMap);

// Fetch and display earthquake data
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(earthquakeUrl).then(data => {
    L.geoJSON(data.features, {
        pointToLayer: (feature, latlng) => L.circle(latlng, {
            radius: feature.properties.mag * 20000,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`Location: ${feature.properties.place}<br>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km`);
        }
    }).addTo(earthquakeLayer);
});

// Fetch and display tectonic plate boundaries
const tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
d3.json(tectonicUrl).then(data => {
    L.geoJSON(data, {
        color: "orange",
        weight: 2
    }).addTo(tectLayer);
    tectLayer.addTo(myMap);
});

// Function to get color based on depth
function getColor(depth) {
    return depth > 90 ? "#FF0D0D" :
           depth > 70 ? "#FF4E11" :
           depth > 50 ? "#FF8E15" :
           depth > 30 ? "#FFB92E" :
           depth > 10 ? "#ACB334" : "#69B34C";
}
