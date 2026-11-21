
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

            var roadPoints = [];

            for (var j = 0; j < edge.geometry.length; j++) {
                roadPoints.push(edge.geometry[j]);
            }

            L.polyline(roadPoints, {
                color: 'gray',
                weight: 2
            }).addTo(map);
        }

        // Load Calculated Route
        fetch('../data/route.json')
            .then(response => response.json())
            .then(routeData => {

                var shortestPoints = [];

                // Find Actual Road Geometry
                for (var i = 0; i < routeData.shortestRoute.length - 1; i++) {

                    var currentNode = routeData.shortestRoute[i];
                    var nextNode = routeData.shortestRoute[i + 1];

                    var edgeFound = false;

                    for (var j = 0; j < data.edges.length; j++) {

                        var edge = data.edges[j];

                        if (edge.from == currentNode && edge.to == nextNode) {

                            for (var k = 0; k < edge.geometry.length; k++) {
                                shortestPoints.push(edge.geometry[k]);
                            }

                            edgeFound = true;
                            break;
                        }
                    }

                    // Fallback if edge geometry is not found
                    if (!edgeFound) {

                        if (shortestPoints.length == 0) {
                            shortestPoints.push(nodeCoordinates[currentNode]);
                        }

                        shortestPoints.push(nodeCoordinates[nextNode]);
                    }
                }

                // Display Actual Shortest Route
                L.polyline(shortestPoints, {
                    color: 'red',
                    weight: 5
                }).addTo(map);

                // Zoom Map to Route
                map.fitBounds(L.latLngBounds(shortestPoints));

                console.log('Shortest Route:', routeData.shortestRoute);
                console.log('Actual Road Geometry Displayed!');

            })
            .catch(error => {
                console.log('Error Loading Route:', error);
            });

        console.log('Total Nodes:', data.nodes.length);
        console.log('Total Edges:', data.edges.length);

    })
    .catch(error => {
        console.log('Error Loading Graph:', error);
    });
