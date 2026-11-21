
var map = L.map('map').setView([33.729, 73.079], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Collection Priority Interaction

var prioritySelect = document.getElementById('priority');

function updatePriorityColor() {

    if (prioritySelect.value == 'urgent') {
        prioritySelect.style.backgroundColor = '#E8D1C6';
        prioritySelect.style.borderColor = '#B9785D';
    }
    else {
        prioritySelect.style.backgroundColor = '#DCE8D8';
        prioritySelect.style.borderColor = '#66866A';
    }
}

prioritySelect.addEventListener('change', updatePriorityColor);
updatePriorityColor();


// Graph Data

var graphData;
var nodeCoordinates = {};

var shortestLayer = null;
var fastestLayer = null;
var commonLayer = null;
var startMarker = null;
var destinationMarker = null;

// Load Road Name Suggestions

fetch('../data/road_names.json')
    .then(response => response.json())
    .then(data => {

        var roadSuggestions = document.getElementById('roadSuggestions');

        for (var roadName in data) {

            var option = document.createElement('option');

            option.value = roadName;

            roadSuggestions.appendChild(option);
        }

        console.log('Road Suggestions Loaded Successfully!');

    })
    .catch(error => {
        console.log('Error Loading Road Names:', error);
    });

// Load Graph

fetch('../data/graph.json')
    .then(response => response.json())
    .then(data => {

        graphData = data;

        // Display Nodes

        for (var i = 0; i < data.nodes.length; i++) {

            var node = data.nodes[i];

            nodeCoordinates[node.id] = [node.lat, node.lon];

            L.circleMarker([node.lat, node.lon], {
                radius: 3,
                color: '#66866A',
                fillColor: '#66866A',
                fillOpacity: 0.7
            })
                .bindPopup('Node ID: ' + node.id)
                .addTo(map);
        }

        // Display Road Connections

        for (var i = 0; i < data.edges.length; i++) {

            L.polyline(data.edges[i].geometry, {
                color: '#A9A39A',
                weight: 2
            }).addTo(map);
        }

        console.log('Graph Loaded Successfully!');

    })
    .catch(error => {
        console.log('Error Loading Graph:', error);
    });


// Find Edge Geometry

function getEdgeGeometry(from, to) {

    for (var i = 0; i < graphData.edges.length; i++) {

        var edge = graphData.edges[i];

        if (edge.from == from && edge.to == to) {
            return edge.geometry;
        }
    }

    return null;
}


// Calculate Route Distance or Time

function calculateRouteValue(route, field) {

    var total = 0;

    for (var i = 0; i < route.length - 1; i++) {

        for (var j = 0; j < graphData.edges.length; j++) {

            var edge = graphData.edges[j];

            if (edge.from == route[i] && edge.to == route[i + 1]) {

                total += edge[field];
                break;
            }
        }
    }

    return total;
}


// Get Complete Route Geometry

function getRouteGeometry(route) {

    var routePoints = [];

    for (var i = 0; i < route.length - 1; i++) {

        var geometry = getEdgeGeometry(route[i], route[i + 1]);

        if (geometry != null) {

            for (var j = 0; j < geometry.length; j++) {
                routePoints.push(geometry[j]);
            }
        }
        else {
            if (routePoints.length == 0) {
                routePoints.push(nodeCoordinates[route[i]]);
            }

            routePoints.push(nodeCoordinates[route[i + 1]]);
        }
    }

    return routePoints;
}


// Active Button Control

function setActiveButton(buttonId) {

    var buttons = document.querySelectorAll('#controls button');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    document.getElementById(buttonId).classList.add('active');
}


// Show Both Routes

function showBothRoutes() {

    if (shortestLayer == null) return;

    map.removeLayer(shortestLayer);
    map.removeLayer(fastestLayer);
    map.removeLayer(commonLayer);

    shortestLayer.addTo(map);
    fastestLayer.addTo(map);
    commonLayer.addTo(map);

    setActiveButton('showBoth');
}


// Show Shortest Route

function showShortestRoute() {

    if (shortestLayer == null) return;

    map.removeLayer(shortestLayer);
    map.removeLayer(fastestLayer);
    map.removeLayer(commonLayer);

    shortestLayer.addTo(map);

    setActiveButton('showShortest');
}


// Show Fastest Route

function showFastestRoute() {

    if (fastestLayer == null) return;

    map.removeLayer(shortestLayer);
    map.removeLayer(fastestLayer);
    map.removeLayer(commonLayer);

    fastestLayer.addTo(map);

    setActiveButton('showFastest');
}


// Show Common Route

function showCommonRoute() {

    if (commonLayer == null) return;

    map.removeLayer(shortestLayer);
    map.removeLayer(fastestLayer);
    map.removeLayer(commonLayer);

    commonLayer.addTo(map);

    setActiveButton('showCommon');
}


// Connect Map Buttons

document.getElementById('showBoth').onclick = showBothRoutes;
document.getElementById('showShortest').onclick = showShortestRoute;
document.getElementById('showFastest').onclick = showFastestRoute;
document.getElementById('showCommon').onclick = showCommonRoute;


// Calculate Route Button

document.getElementById('calculateRoute').addEventListener('click', function () {

    var startNode = document.getElementById('startNode').value;
    var destination = document.getElementById('destination').value.trim();

    if (startNode == '' || destination == '') {
        alert('Please enter starting node and destination road!');
        return;
    }

    if (graphData == null) {
        alert('Graph is still loading. Please wait!');
        return;
    }

    var button = document.getElementById('calculateRoute');

    button.disabled = true;
    button.innerText = 'Calculating...';


    // Send Request to Flask Backend

    fetch('http://127.0.0.1:5000/calculate-route', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startNode: Number(startNode),
            destination: destination,
            priority: prioritySelect.value
        })

    })

        .then(response => {

            return response.json().then(data => {

                if (!response.ok) {
                    console.log('Backend Error Details:', data);
                    throw new Error(JSON.stringify(data));
                }

                return data;
            });
        })

        .then(routeData => {

            var shortestRoute = routeData.shortestRoute;
            var fastestRoute = routeData.fastestRoute;

            var destinationNode = routeData.destinationNode;

            // Remove Previous Routes

            if (shortestLayer != null) map.removeLayer(shortestLayer);
            if (fastestLayer != null) map.removeLayer(fastestLayer);
            if (commonLayer != null) map.removeLayer(commonLayer);

            if (startMarker != null) map.removeLayer(startMarker);
            if (destinationMarker != null) map.removeLayer(destinationMarker);


            // Get Route Coordinates

            var shortestPoints = getRouteGeometry(shortestRoute);
            var fastestPoints = getRouteGeometry(fastestRoute);


            // Create Shortest Route

            shortestLayer = L.polyline(shortestPoints, {
                color: '#B9785D',
                weight: 5
            });


            // Create Fastest Route

            fastestLayer = L.polyline(fastestPoints, {
                color: '#66866A',
                weight: 5
            });


            // Find Common Route Segments

            commonLayer = L.layerGroup();

            var fastestEdges = {};

            for (var i = 0; i < fastestRoute.length - 1; i++) {

                var key = fastestRoute[i] + '-' + fastestRoute[i + 1];

                fastestEdges[key] = true;
            }

            for (var i = 0; i < shortestRoute.length - 1; i++) {

                var key = shortestRoute[i] + '-' + shortestRoute[i + 1];

                if (fastestEdges[key]) {

                    var geometry = getEdgeGeometry(
                        shortestRoute[i],
                        shortestRoute[i + 1]
                    );

                    if (geometry != null) {

                        L.polyline(geometry, {
                            color: '#D3A84D',
                            weight: 7
                        })
                            .bindPopup('Common Route')
                            .addTo(commonLayer);
                    }
                }
            }


            // Starting Point

            // Starting Point Highlight

            startMarker = L.circleMarker(nodeCoordinates[Number(startNode)], {
                radius: 10,
                color: '#FFFFFF',
                weight: 3,
                fillColor: '#83B8CE',
                fillOpacity: 1
            })
                .bindPopup('Starting Point - Node ' + startNode)
                .bindTooltip('START', {
                    permanent: true,
                    direction: 'top'
                })
                .addTo(map);


            // Destination Point Highlight

            destinationMarker = L.circleMarker(nodeCoordinates[destinationNode], {
                radius: 11,
                color: '#FFFFFF',
                weight: 3,
                fillColor: '#B9785D',
                fillOpacity: 1
            })
                .bindPopup(
                    'Destination: ' + destination +
                    '<br>Node: ' + destinationNode
                )
                .bindTooltip('DESTINATION', {
                    permanent: true,
                    direction: 'top'
                })
                .addTo(map);
            // Calculate Route Information

            var shortestDistance = calculateRouteValue(shortestRoute, 'length');

            var fastestTime = calculateRouteValue(fastestRoute, 'time');

            // Calculate Route Comparison

            var shortestTime = calculateRouteValue(shortestRoute, 'time');

            var fastestDistance = calculateRouteValue(fastestRoute, 'length');


            // Update Comparison Cards

            document.getElementById('shortestRouteDistance').innerText =
                shortestDistance.toFixed(2) + ' m';

            document.getElementById('shortestRouteTime').innerText =
                shortestTime.toFixed(2) + ' sec';


            document.getElementById('fastestRouteDistance').innerText =
                fastestDistance.toFixed(2) + ' m';

            document.getElementById('fastestRouteTime').innerText =
                fastestTime.toFixed(2) + ' sec';


            // Calculate Differences

            var distanceDifference = Math.abs(shortestDistance - fastestDistance);

            var timeDifference = Math.abs(shortestTime - fastestTime);


            // Display Differences

            document.getElementById('distanceDifference').innerText =
                distanceDifference.toFixed(2) + ' meters';

            document.getElementById('timeDifference').innerText =
                timeDifference.toFixed(2) + ' seconds';

            // Update Dashboard

            document.getElementById('shortestDistance').innerText =
                shortestDistance.toFixed(2);

            document.getElementById('fastestTime').innerText =
                fastestTime.toFixed(2);

            document.getElementById('destinationNode').innerText =
                destinationNode;
            // Update Current Route Details

            document.getElementById('routeStartNode').innerText =
                startNode;

            document.getElementById('routeDestinationRoad').innerText =
                destination;

            document.getElementById('routePriority').innerText =
                prioritySelect.value.toUpperCase();


            // Display Both Routes

            showBothRoutes();


            // Zoom to Routes

            var allPoints = shortestPoints.concat(fastestPoints);

            if (allPoints.length > 0) {
                map.fitBounds(L.latLngBounds(allPoints));
            }

            console.log('New Routes Loaded Successfully!');

        })

        .catch(error => {

            console.log('Route Error:', error);

            alert(error.message);

        })

        .finally(() => {

            button.disabled = false;
            button.innerText = 'Calculate Route';

        });

});
