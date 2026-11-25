
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


// Garbage Bin Management

var binMarkers = {};
var allBins = [];
var multiBinLayer = null;

var allVehicles = [];
var vehicleMarkers = {};
var lastMultiBinRoute = null;
var simulationRoute = null;
var dispatchedVehicle = null;
var lastSelectedBinIds = [];
var simulationTimer = null;
var simulationIndex = 0;
var simulationRunning = false;
var simulationSpeed = 300;


// Get Bin Color

function getBinColor(status) {

    if (status == 'Empty') {
        return '#00ff22';
    }
    else if (status == 'Half Full') {
        return '#ffae00';
    }
    else {
        return '#ff4d00';
    }
}


// Get Bin Popup

function getBinPopup(bin) {

    return `
        <div class="bin-popup">

            <b>Garbage Bin #${bin.id}</b>

            <p>Node: ${bin.node}</p>

            <p>Current Status: ${bin.status}</p>

            <select id="binStatusSelect">
                <option value="Empty" ${bin.status == 'Empty' ? 'selected' : ''}>Empty</option>
                <option value="Half Full" ${bin.status == 'Half Full' ? 'selected' : ''}>Half Full</option>
                <option value="Full" ${bin.status == 'Full' ? 'selected' : ''}>Full</option>
            </select>

            <button id="updateBinStatus">
                Update Status
            </button>

        </div>
    `;
}


// Add Garbage Bin to Map

function addGarbageBin(bin) {

    var binLocation = nodeCoordinates[bin.node];

    if (binLocation == null) {
        return;
    }

    var marker = L.circleMarker(binLocation, {
        radius: 12,
        color: '#FFFFFF',
        weight: 3,
        fillColor: getBinColor(bin.status),
        fillOpacity: 1

    });

    marker.bindPopup(getBinPopup(bin));

    // Update Bin Status Button

    marker.on('popupopen', function () {

        var updateButton = document.getElementById('updateBinStatus');

        updateButton.onclick = function () {

            var newStatus = document.getElementById('binStatusSelect').value;

            fetch('http://127.0.0.1:5000/update-bin-status', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    id: bin.id,
                    status: newStatus
                })

            })

                .then(response => {

                    return response.json().then(data => {

                        if (!response.ok) {
                            throw new Error(data.error);
                        }

                        return data;
                    });

                })

                .then(data => {

                    bin.status = data.bin.status;

                    marker.setStyle({
                        fillColor: getBinColor(bin.status)
                    });

                    marker.closePopup();

                    marker.setPopupContent(getBinPopup(bin));

                    marker.openPopup();

                    console.log('Bin Status Updated Successfully!');

                })

                .catch(error => {

                    alert(error.message);

                });

        };

    });

    marker.addTo(map);

    binMarkers[bin.id] = marker;
}


// Render Bin Checkboxes for Multi-Bin Planning

function renderBinCheckboxes(bins) {

    var container = document.getElementById('binCheckboxes');

    container.innerHTML = '';

    for (var i = 0; i < bins.length; i++) {

        var bin = bins[i];

        var label = document.createElement('label');
        label.className = 'bin-check-item';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = bin.id;

        var text = document.createElement('span');
        text.innerText = 'Bin #' + bin.id + ' (Node ' + bin.node + ') - ' + bin.status;

        label.appendChild(checkbox);
        label.appendChild(text);

        container.appendChild(label);
    }
}


// Display Multi-Bin Route on Map

function showMultiBinRoute(routeData) {

    var orderedBinIds = routeData.orderedBinIds;
    var orderedStops = routeData.orderedStops;

    var orderText = '';

    for (var i = 0; i < orderedBinIds.length; i++) {

        orderText += 'Bin #' + orderedBinIds[i];

        if (i != orderedBinIds.length - 1) {
            orderText += ' -> ';
        }
    }

    var resultBox = document.getElementById('multiBinResult');

    resultBox.innerHTML =
        '<h4>Multi-Bin Plan</h4>' +
        '<p><strong>Visit Order:</strong> ' + orderText + '</p>' +
        '<p><strong>Total Distance:</strong> ' + routeData.totalDistance.toFixed(2) + ' m</p>' +
        '<p><strong>Total Time:</strong> ' + routeData.totalTime.toFixed(2) + ' sec</p>';

    resultBox.classList.add('show');

    if (multiBinLayer != null) {
        map.removeLayer(multiBinLayer);
    }

    multiBinLayer = L.layerGroup();

    var routePoints = getRouteGeometry(routeData.fullRoute);

    L.polyline(routePoints, {
        color: '#6A5ACD',
        weight: 5
    }).addTo(multiBinLayer);

    for (var i = 0; i < orderedStops.length; i++) {

        var node = orderedStops[i];
        var tooltip = i == 0 ? 'START' : String(i);

        L.circleMarker(nodeCoordinates[node], {
            radius: 10,
            color: '#FFFFFF',
            weight: 3,
            fillColor: i == 0 ? '#83B8CE' : '#6A5ACD',
            fillOpacity: 1
        })
            .bindTooltip(tooltip, {
                permanent: true,
                direction: 'top'
            })
            .addTo(multiBinLayer);
    }

    multiBinLayer.addTo(map);

    if (routePoints.length > 0) {
        map.fitBounds(L.latLngBounds(routePoints));
    }

    lastMultiBinRoute = routeData.fullRoute;
    simulationRoute = lastMultiBinRoute;
    dispatchedVehicle = null;

    document.getElementById('dispatchInfo').innerText = 'No vehicle dispatched yet.';

    resetSimulation();
}


// Plan Multi-Bin Route Button

document.getElementById('planMultiBinRoute').addEventListener('click', function () {

    var startNode = document.getElementById('multiStartNode').value;

    var checkboxes = document.querySelectorAll('#binCheckboxes input[type="checkbox"]:checked');

    if (startNode == '') {
        alert('Please enter starting node!');
        return;
    }

    if (checkboxes.length == 0) {
        alert('Please select at least one bin!');
        return;
    }

    var binIds = [];

    for (var i = 0; i < checkboxes.length; i++) {
        binIds.push(Number(checkboxes[i].value));
    }

    var button = document.getElementById('planMultiBinRoute');

    button.disabled = true;
    button.innerText = 'Planning...';

    fetch('http://127.0.0.1:5000/plan-multi-bin-route', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            startNode: Number(startNode),
            binIds: binIds
        })

    })

        .then(response => {

            return response.json().then(data => {

                if (!response.ok) {
                    throw new Error(data.error);
                }

                return data;
            });

        })

        .then(routeData => {

            showMultiBinRoute(routeData);

            lastSelectedBinIds = binIds;

            console.log('Multi-Bin Route Loaded Successfully!');

        })

        .catch(error => {

            alert(error.message);

        })

        .finally(() => {

            button.disabled = false;
            button.innerText = 'Plan Multi-Bin Route';

        });

});


// Add Vehicle to Map

function addVehicle(vehicle) {

    var location = nodeCoordinates[vehicle.node];

    if (location == null) {
        return;
    }

    var marker = L.circleMarker(location, {
        radius: 11,
        color: '#FFFFFF',
        weight: 3,
        fillColor: '#2F4F6F',
        fillOpacity: 1
    });

    marker.bindTooltip(vehicle.name, {
        direction: 'top'
    });

    marker.addTo(map);

    vehicleMarkers[vehicle.id] = marker;
}


// Vehicle Simulation

function getTruck() {

    if (dispatchedVehicle != null) {
        return dispatchedVehicle;
    }

    if (allVehicles.length > 0) {
        return allVehicles[0];
    }

    return null;
}


function moveTruckToNode(node) {

    var truck = getTruck();

    if (truck == null) {
        return;
    }

    var marker = vehicleMarkers[truck.id];

    if (marker == null) {
        return;
    }

    if (nodeCoordinates[node] != null) {
        marker.setLatLng(nodeCoordinates[node]);
        marker.bringToFront();
    }
}


function updateSimulationStatus(text) {

    var truck = getTruck();

    if (truck != null) {
        truck.status = text;
    }

    document.getElementById('vehicleStatus').innerText = text;
}


function updateSimulationProgress() {

    if (simulationRoute == null) {
        document.getElementById('vehicleProgress').innerText = '--';
        return;
    }

    var totalSteps = simulationRoute.length - 1;
    var percent = 0;

    if (totalSteps > 0) {
        percent = Math.round((simulationIndex / totalSteps) * 100);
    }

    document.getElementById('vehicleProgress').innerText =
        percent + '% (Node ' + simulationRoute[simulationIndex] + ')';
}


function stopSimulationTimer() {

    if (simulationTimer != null) {
        clearInterval(simulationTimer);
        simulationTimer = null;
    }
}


function resetSimulation() {

    stopSimulationTimer();

    simulationRunning = false;
    simulationIndex = 0;

    var truck = getTruck();

    if (truck != null) {
        document.getElementById('vehicleName').innerText = truck.name;
    }

    if (simulationRoute != null && simulationRoute.length > 0) {

        moveTruckToNode(simulationRoute[0]);

        updateSimulationStatus('Ready');
        updateSimulationProgress();
    }
}


function startSimulation() {

    var truck = getTruck();

    if (truck == null) {
        alert('Vehicle data is not loaded yet.');
        return;
    }

    if (simulationRoute == null) {
        alert('Please plan a multi-bin route first.');
        return;
    }

    if (simulationRunning) {
        return;
    }

    if (simulationIndex >= simulationRoute.length - 1) {
        simulationIndex = 0;
        moveTruckToNode(simulationRoute[0]);
    }

    simulationRunning = true;

    updateSimulationStatus('Moving');
    updateSimulationProgress();

    simulationTimer = setInterval(function () {

        if (simulationIndex >= simulationRoute.length - 1) {

            stopSimulationTimer();

            simulationRunning = false;

            updateSimulationStatus('Route Completed');

            return;
        }

        simulationIndex++;

        moveTruckToNode(simulationRoute[simulationIndex]);

        updateSimulationProgress();

        if (simulationIndex >= simulationRoute.length - 1) {

            stopSimulationTimer();

            simulationRunning = false;

            updateSimulationStatus('Route Completed');
        }

    }, simulationSpeed);
}


function pauseSimulation() {

    if (!simulationRunning) {
        return;
    }

    stopSimulationTimer();

    simulationRunning = false;

    updateSimulationStatus('Paused');
}


// Dispatch Nearest Available Vehicle

function dispatchVehicle() {

    if (lastMultiBinRoute == null) {
        alert('Please plan a multi-bin route first.');
        return;
    }

    var targetNode = lastMultiBinRoute[0];

    var button = document.getElementById('dispatchVehicle');

    button.disabled = true;
    button.innerText = 'Dispatching...';

    fetch('http://127.0.0.1:5000/dispatch-vehicle', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            targetNode: targetNode,
            binIds: lastSelectedBinIds
        })

    })

        .then(response => {

            return response.json().then(data => {

                if (!response.ok) {
                    throw new Error(data.error);
                }

                return data;
            });

        })

        .then(data => {

            var vehicle = null;

            for (var i = 0; i < allVehicles.length; i++) {
                if (allVehicles[i].id == data.vehicleId) {
                    vehicle = allVehicles[i];
                    break;
                }
            }

            dispatchedVehicle = vehicle;

            var combinedRoute = [];

            for (var i = 0; i < data.approachRoute.length; i++) {
                combinedRoute.push(data.approachRoute[i]);
            }

            for (var i = 1; i < lastMultiBinRoute.length; i++) {
                combinedRoute.push(lastMultiBinRoute[i]);
            }

            simulationRoute = combinedRoute;

            document.getElementById('vehicleName').innerText = data.vehicleName;

            document.getElementById('dispatchInfo').innerText =
                'Nearest eligible: ' + data.vehicleName +
                ' | Waste: ' + data.totalWaste + ' units' +
                ' (approach distance ' + data.distance.toFixed(2) + ' m)';

            stopSimulationTimer();

            simulationRunning = false;
            simulationIndex = 0;

            moveTruckToNode(simulationRoute[0]);

            updateSimulationStatus('Dispatched');
            updateSimulationProgress();

            console.log('Vehicle Dispatched Successfully!');

        })

        .catch(error => {

            alert(error.message);

        })

        .finally(() => {

            button.disabled = false;
            button.innerText = 'Dispatch Nearest Vehicle';

        });
}


document.getElementById('dispatchVehicle').onclick = dispatchVehicle;
document.getElementById('startSimulation').onclick = startSimulation;
document.getElementById('pauseSimulation').onclick = pauseSimulation;
document.getElementById('resetSimulation').onclick = resetSimulation;


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


        // Load Garbage Bins

        fetch('../data/bins.json')
            .then(response => response.json())
            .then(data => {

                allBins = data.bins;

                for (var i = 0; i < data.bins.length; i++) {

                    addGarbageBin(data.bins[i]);

                }

                renderBinCheckboxes(allBins);

                console.log('Garbage Bins Loaded Successfully!');

            })
            .catch(error => {

                console.log('Error Loading Garbage Bins:', error);

            });


        // Load Vehicles

        fetch('../data/vehicles.json')
            .then(response => response.json())
            .then(data => {

                allVehicles = data.vehicles;

                for (var i = 0; i < data.vehicles.length; i++) {

                    addVehicle(data.vehicles[i]);

                }

                if (allVehicles.length > 0) {

                    document.getElementById('vehicleName').innerText = allVehicles[0].name;
                    document.getElementById('vehicleStatus').innerText = allVehicles[0].status;

                }

                console.log('Vehicles Loaded Successfully!');

            })
            .catch(error => {

                console.log('Error Loading Vehicles:', error);

            });

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


            // Update AI Agent Recommendation

            document.getElementById('agentPriority').innerText =
                routeData.priority.toUpperCase();

            var shortestKey = shortestRoute.join('-');
            var fastestKey = fastestRoute.join('-');
            var recommendedKey = routeData.recommendedRoute.join('-');

            var agentDecision;

            if (shortestKey == fastestKey) {
                agentDecision = 'Both Routes Identical';
            }
            else if (recommendedKey == fastestKey) {
                agentDecision = 'Fastest Route Selected';
            }
            else {
                agentDecision = 'Shortest Route Selected';
            }

            document.getElementById('agentDecision').innerText = agentDecision;

            document.getElementById('agentRoute').innerText =
                routeData.recommendedRoute.join(' -> ');

            document.getElementById('agentReason').innerText =
                routeData.recommendationReason;


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
