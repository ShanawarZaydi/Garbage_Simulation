
var map = L.map('map').setView([33.729, 73.079], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

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
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.7
            })
                .bindPopup('Node ID: ' + node.id)
                .addTo(map);
        }

        // Display Road Connections
        for (var i = 0; i < data.edges.length; i++) {

            var edge = data.edges[i];

            L.polyline(edge.geometry, {
                color: 'gray',
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

                var shortestRoute = routeData.shortestRoute;
                var fastestRoute = routeData.fastestRoute;

                var shortestPoints = getRouteGeometry(shortestRoute);
                var fastestPoints = getRouteGeometry(fastestRoute);

                // Display Shortest Route
                L.polyline(shortestPoints, {
                    color: 'red',
                    weight: 5
                }).addTo(map);

                // Display Fastest Route
                L.polyline(fastestPoints, {
                    color: 'green',
                    weight: 5
                }).addTo(map);

                // Store Fastest Route Edges
                var fastestEdges = {};

                for (var i = 0; i < fastestRoute.length - 1; i++) {

                    var key = fastestRoute[i] + '-' + fastestRoute[i + 1];

                    fastestEdges[key] = true;
                }

                // Highlight Common Road Segments
                var commonCount = 0;

                for (var i = 0; i < shortestRoute.length - 1; i++) {

                    var key = shortestRoute[i] + '-' + shortestRoute[i + 1];

                    if (fastestEdges[key]) {

                        var geometry = getEdgeGeometry(
                            shortestRoute[i],
                            shortestRoute[i + 1]
                        );

                        if (geometry != null) {

                            L.polyline(geometry, {
                                color: 'yellow',
                                weight: 7
                            })
                                .bindPopup('Common Route')
                                .addTo(map);

                            commonCount++;
                        }
                    }
                }

                // Start Marker
                L.marker(nodeCoordinates[routeData.startNode])
                    .bindPopup('Starting Point')
                    .addTo(map);

                // Destination Marker
                L.marker(nodeCoordinates[routeData.destinationNode])
                    .bindPopup('Destination Point')
                    .addTo(map);

                // Zoom to Routes
                var allPoints = shortestPoints.concat(fastestPoints);

                map.fitBounds(L.latLngBounds(allPoints));

                console.log('Shortest Route Displayed!');
                console.log('Fastest Route Displayed!');
                console.log('Common Road Segments:', commonCount);

            })
            .catch(error => {
                console.log('Error Loading Routes:', error);
            });

        console.log('Total Nodes:', data.nodes.length);
        console.log('Total Edges:', data.edges.length);

    })
    .catch(error => {
        console.log('Error Loading Graph:', error);
    });
