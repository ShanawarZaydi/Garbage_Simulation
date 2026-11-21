
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


fetch('../data/graph.json')
    .then(response => response.json())
    .then(data => {

        var nodeCoordinates = {};

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

        fetch('../data/route.json')
            .then(response => response.json())
            .then(routeData => {

                // Find Edge Geometry
                function getEdgeGeometry(from, to) {

                    for (var i = 0; i < data.edges.length; i++) {

                        var edge = data.edges[i];

                        if (edge.from == from && edge.to == to) {
                            return edge.geometry;
                        }
                    }

                    return null;
                }

                // Get Complete Route Geometry
                function getRouteGeometry(route) {

                    var routePoints = [];

                    for (var i = 0; i < route.length - 1; i++) {

                        var geometry = getEdgeGeometry(
                            route[i],
                            route[i + 1]
                        );

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

                var shortestRoute = routeData.shortestRoute;
                var fastestRoute = routeData.fastestRoute;

                var shortestPoints = getRouteGeometry(shortestRoute);
                var fastestPoints = getRouteGeometry(fastestRoute);

                // Create Route Layers
                var shortestLayer = L.polyline(shortestPoints, {
                    color: '#B9785D',
                    weight: 5
                });

                var fastestLayer = L.polyline(fastestPoints, {
                    color: '#66866A',
                    weight: 5
                });

                var commonLayer = L.layerGroup();

                // Find Common Road Segments
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
                L.marker(nodeCoordinates[routeData.startNode])
                    .bindPopup('Starting Point')
                    .addTo(map);

                // Destination Point
                L.marker(nodeCoordinates[routeData.destinationNode])
                    .bindPopup('Destination Point')
                    .addTo(map);


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

                    map.removeLayer(shortestLayer);
                    map.removeLayer(fastestLayer);
                    map.removeLayer(commonLayer);

                    shortestLayer.addTo(map);

                    setActiveButton('showShortest');
                }


                // Show Fastest Route
                function showFastestRoute() {

                    map.removeLayer(shortestLayer);
                    map.removeLayer(fastestLayer);
                    map.removeLayer(commonLayer);

                    fastestLayer.addTo(map);

                    setActiveButton('showFastest');
                }


                // Show Common Route
                function showCommonRoute() {

                    map.removeLayer(shortestLayer);
                    map.removeLayer(fastestLayer);
                    map.removeLayer(commonLayer);

                    commonLayer.addTo(map);

                    setActiveButton('showCommon');
                }


                // Connect Buttons
                document.getElementById('showBoth').onclick = showBothRoutes;

                document.getElementById('showShortest').onclick = showShortestRoute;

                document.getElementById('showFastest').onclick = showFastestRoute;

                document.getElementById('showCommon').onclick = showCommonRoute;


                // Display Both Routes Initially
                showBothRoutes();


                // Zoom to Routes
                var allPoints = shortestPoints.concat(fastestPoints);

                if (allPoints.length > 0) {
                    map.fitBounds(L.latLngBounds(allPoints));
                }

                console.log('Route Controls Loaded Successfully!');

            })
            .catch(error => {
                console.log('Error Loading Routes:', error);
            });

    })
    .catch(error => {
        console.log('Error Loading Graph:', error);
    });
