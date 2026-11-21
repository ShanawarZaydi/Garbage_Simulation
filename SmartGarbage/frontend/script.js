
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

                for (var i = 0; i < routeData.shortestRoute.length; i++) {

                    var nodeID = routeData.shortestRoute[i];

                    if (nodeCoordinates[nodeID]) {
                        shortestPoints.push(nodeCoordinates[nodeID]);
                    }
                }

                // Display Shortest Route
                L.polyline(shortestPoints, {
                    color: 'red',
                    weight: 5
                }).addTo(map);

                console.log('Shortest Route:', routeData.shortestRoute);
                console.log('Shortest Route Displayed!');

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
