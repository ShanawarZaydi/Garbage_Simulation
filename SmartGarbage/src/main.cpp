
#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <iomanip>
#include <nlohmann/json.hpp>
#include "Graph.h"

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[])
{
    ifstream file("data/graph.json");

    if (!file.is_open())
    {
        cout << "Graph File Not Found!" << endl;
        return 1;
    }

    json data;
    file >> data;
    file.close();

    int totalNodes = data["nodes"].size();

    Graph cityGraph(totalNodes);

    for (int i = 0; i < data["edges"].size(); i++)
    {
        int from = data["edges"][i]["from"];
        int to = data["edges"][i]["to"];

        double distance = data["edges"][i]["length"];
        double time = data["edges"][i]["time"];

        cityGraph.addEdge(from, to, distance, time);
    }

    cout << "==================================" << endl;
    cout << " SMART GARBAGE COLLECTION SYSTEM" << endl;
    cout << "==================================" << endl;

    cout << "\nGraph Loaded Successfully!" << endl;
    cout << "Total Nodes: " << totalNodes << endl;
    cout << "Total Roads: " << data["edges"].size() << endl;

    if (argc >= 2 && string(argv[1]) == "multi")
    {
        if (argc < 4)
        {
            cout << "\nUsage: main.exe multi <startNode> <binNode1> <binNode2> ..." << endl;
            return 1;
        }

        int startNode = stoi(argv[2]);

        if (startNode < 0 || startNode >= totalNodes)
        {
            cout << "\nInvalid Starting Node!" << endl;
            return 1;
        }

        vector<int> remainingBins;

        for (int i = 3; i < argc; i++)
        {
            int binNode = stoi(argv[i]);

            if (binNode < 0 || binNode >= totalNodes)
            {
                cout << "\nInvalid Bin Node: " << binNode << endl;
                return 1;
            }

            bool alreadyAdded = false;

            for (int j = 0; j < remainingBins.size(); j++)
            {
                if (remainingBins[j] == binNode)
                {
                    alreadyAdded = true;
                }
            }

            if (!alreadyAdded)
            {
                remainingBins.push_back(binNode);
            }
        }

        if (remainingBins.size() == 0)
        {
            cout << "\nNo Bins Selected!" << endl;
            return 1;
        }

        vector<int> orderedStops;
        vector<int> fullRoute;

        int currentNode = startNode;
        orderedStops.push_back(currentNode);
        fullRoute.push_back(currentNode);

        while (remainingBins.size() > 0)
        {
            int bestIndex = -1;
            double bestDistance = 1000000000.0;
            vector<int> bestLegRoute;

            for (int i = 0; i < remainingBins.size(); i++)
            {
                vector<int> legRoute = cityGraph.Dijkstra(currentNode, remainingBins[i], false);

                if (legRoute.size() == 0)
                {
                    continue;
                }

                double legDistance = cityGraph.getRouteDistance(legRoute);

                if (legDistance < bestDistance)
                {
                    bestDistance = legDistance;
                    bestIndex = i;
                    bestLegRoute = legRoute;
                }
            }

            if (bestIndex == -1)
            {
                cout << "\nSome Bins Are Not Reachable!" << endl;
                return 1;
            }

            int nextBin = remainingBins[bestIndex];

            remainingBins.erase(remainingBins.begin() + bestIndex);

            orderedStops.push_back(nextBin);

            for (int i = 0; i < bestLegRoute.size(); i++)
            {
                if (fullRoute[fullRoute.size() - 1] != bestLegRoute[i])
                {
                    fullRoute.push_back(bestLegRoute[i]);
                }
            }

            currentNode = nextBin;
        }

        double totalDistance = cityGraph.getRouteDistance(fullRoute);
        double totalTime = cityGraph.getRouteTime(fullRoute);

        cout << "\n==================================" << endl;
        cout << " MULTI-BIN ROUTE PLAN" << endl;
        cout << "==================================" << endl;

        cout << "Visit Order: ";

        for (int i = 0; i < orderedStops.size(); i++)
        {
            cout << orderedStops[i];

            if (i != orderedStops.size() - 1)
            {
                cout << " -> ";
            }
        }

        cout << "\nTotal Distance: " << totalDistance << " meters" << endl;
        cout << "Total Time: " << totalTime << " seconds" << endl;

        json multiRouteData;

        multiRouteData["startNode"] = startNode;
        multiRouteData["orderedStops"] = orderedStops;
        multiRouteData["fullRoute"] = fullRoute;
        multiRouteData["totalDistance"] = totalDistance;
        multiRouteData["totalTime"] = totalTime;

        ofstream multiRouteFile("data/multi_route.json");

        if (!multiRouteFile.is_open())
        {
            cout << "\nUnable to Create Multi Route File!" << endl;
            return 1;
        }

        multiRouteFile << multiRouteData.dump(4);
        multiRouteFile.close();

        cout << "\nMulti-Bin Route Saved Successfully!" << endl;

        return 0;
    }

    if (argc >= 2 && string(argv[1]) == "dispatch")
    {
        if (argc < 3)
        {
            cout << "\nUsage: main.exe dispatch <targetNode> [binId1] [binId2] ..." << endl;
            return 1;
        }

        int targetNode = stoi(argv[2]);

        if (targetNode < 0 || targetNode >= totalNodes)
        {
            cout << "\nInvalid Target Node!" << endl;
            return 1;
        }

        ifstream vehicleFile("data/vehicles.json");

        if (!vehicleFile.is_open())
        {
            cout << "\nVehicles File Not Found!" << endl;
            return 1;
        }

        json vehicleData;
        vehicleFile >> vehicleData;
        vehicleFile.close();

        int totalWaste = 0;
        if (argc > 3)
        {
            ifstream binFile("data/bins.json");
            if (binFile.is_open())
            {
                json binData;
                binFile >> binData;
                binFile.close();
                for (int i = 2; i < argc; i++)
                {
                    int binId = stoi(argv[i]);
                    for (auto &b : binData["bins"])
                    {
                        if (b["id"] == binId)
                        {
                            string status = b["status"];
                            if (status == "Full") totalWaste += 100;
                            else if (status == "Half Full") totalWaste += 50;
                            // Empty => 0, nothing added
                            break;
                        }
                    }
                }
            }
        }

        int bestVehicleId = -1;
        string bestVehicleName;
        int bestVehicleNode = -1;
        double bestDistance = 1000000000.0;
        vector<int> bestApproachRoute;
        const int MIN_BATTERY = 20;
        int batterySkipped = 0;
        int availableCount = 0;
        int bestVehicleBattery = 0;

        for (int i = 0; i < vehicleData["vehicles"].size(); i++)
        {
            bool available = vehicleData["vehicles"][i]["available"];

            if (!available)
            {
                continue;
            }

            int vehicleBattery = vehicleData["vehicles"][i]["battery"];
            if (vehicleBattery < MIN_BATTERY)
            {
                batterySkipped++;
                continue;
            }
            availableCount++;

            int vehicleNode = vehicleData["vehicles"][i]["node"];

            vector<int> approachRoute = cityGraph.Dijkstra(vehicleNode, targetNode, false);

            if (approachRoute.size() == 0)
            {
                continue;
            }

            double distance = cityGraph.getRouteDistance(approachRoute);

            if (distance < bestDistance)
            {
                bestDistance = distance;
                bestVehicleId = vehicleData["vehicles"][i]["id"];
                bestVehicleName = vehicleData["vehicles"][i]["name"];
                bestVehicleNode = vehicleNode;
                bestApproachRoute = approachRoute;
                bestVehicleBattery = vehicleBattery;
            }
        }

        if (bestVehicleId == -1)
        {
            if (availableCount > 0 && batterySkipped > 0)
            {
                cout << "\nDISPATCH_ERROR: No available vehicle has sufficient battery (minimum " << MIN_BATTERY << "%)." << endl;
            }
            else
            {
                cout << "\nNo Available Vehicle Can Reach The Target!" << endl;
            }
            return 1;
        }

        cout << "\n==================================" << endl;
        cout << " VEHICLE DISPATCH" << endl;
        cout << "==================================" << endl;

        cout << "Target Node: " << targetNode << endl;
        cout << "Assigned Vehicle: " << bestVehicleName << endl;
        cout << "Vehicle Node: " << bestVehicleNode << endl;
        cout << "Approach Distance: " << bestDistance << " meters" << endl;
        cout << "Vehicle Battery: " << bestVehicleBattery << "%" << endl;
        cout << "Total Waste (from selected bins): " << totalWaste << " units" << endl;

        json dispatchData;

        dispatchData["targetNode"] = targetNode;
        dispatchData["vehicleId"] = bestVehicleId;
        dispatchData["vehicleName"] = bestVehicleName;
        dispatchData["vehicleNode"] = bestVehicleNode;
        dispatchData["distance"] = bestDistance;
        dispatchData["approachRoute"] = bestApproachRoute;
        dispatchData["totalWaste"] = totalWaste;

        ofstream dispatchFile("data/dispatch.json");

        if (!dispatchFile.is_open())
        {
            cout << "\nUnable to Create Dispatch File!" << endl;
            return 1;
        }

        dispatchFile << dispatchData.dump(4);
        dispatchFile.close();

        cout << "\nDispatch Saved Successfully!" << endl;

        return 0;
    }

    ifstream roadFile("data/road_names.json");

    if (!roadFile.is_open())
    {
        cout << "\nRoad Names File Not Found!" << endl;
        return 1;
    }

    json roadData;
    roadFile >> roadData;
    roadFile.close();

    Trie roadTrie;

    for (auto it = roadData.begin(); it != roadData.end(); it++)
    {
        string roadName = it.key();

        vector<int> connectedNodes;

        for (int i = 0; i < it.value()["nodes"].size(); i++)
        {
            connectedNodes.push_back(it.value()["nodes"][i]);
        }

        roadTrie.insert(roadName, connectedNodes);
    }

    cout << "Road Names Loaded: " << roadData.size() << endl;

    int startNode;
    string roadName;
    string priority;

    if (argc == 4)
    {
        startNode = stoi(argv[1]);
        roadName = argv[2];
        priority = argv[3];
    }
    else if (argc == 3)
    {
        startNode = stoi(argv[1]);
        roadName = argv[2];
        priority = "normal";
    }
    else
    {
        cout << "\nEnter Starting Node (0-" << totalNodes - 1 << "): ";
        cin >> startNode;
        cin.ignore();

        cout << "Enter Destination Road: ";
        getline(cin, roadName);

        cout << "Enter Collection Priority (normal/urgent): ";
        getline(cin, priority);
    }

    while (roadName.length() > 0 && roadName[0] == ' ')
    {
        roadName.erase(0, 1);
    }

    while (roadName.length() > 0 && roadName[roadName.length() - 1] == ' ')
    {
        roadName.erase(roadName.length() - 1, 1);
    }

    if (startNode < 0 || startNode >= totalNodes)
    {
        cout << "\nInvalid Starting Node!" << endl;
        return 1;
    }

    vector<int> destinationNodes = roadTrie.getRoadNodes(roadName);

    if (destinationNodes.size() == 0)
    {
        cout << "\nRoad Not Found!" << endl;
        return 1;
    }

    cout << "\nRoad Selected: " << roadName << endl;

    int nearestNode = cityGraph.findNearestNode(startNode, destinationNodes);

    if (nearestNode == -1)
    {
        cout << "\nNo Reachable Destination Found!" << endl;
        return 1;
    }

    cout << "Nearest Destination Node: " << nearestNode << endl;

    cout << "\nCalculating Routes..." << endl;

    vector<int> shortestRoute = cityGraph.Dijkstra(startNode, nearestNode, false);

    vector<int> fastestRoute = cityGraph.Dijkstra(startNode, nearestNode, true);

    // AI Agent Decision Making

    if (priority != "normal" && priority != "urgent")
    {
        cout << "\nInvalid Priority! Use normal or urgent." << endl;
        return 1;
    }

    double shortestDistance = cityGraph.getRouteDistance(shortestRoute);
    double shortestTime = cityGraph.getRouteTime(shortestRoute);

    double fastestDistance = cityGraph.getRouteDistance(fastestRoute);
    double fastestTime = cityGraph.getRouteTime(fastestRoute);

    double distanceRatio = 1;
    double timeRatio = 1;

    if (shortestDistance > 0)
    {
        distanceRatio = fastestDistance / shortestDistance;
    }

    if (fastestTime > 0)
    {
        timeRatio = shortestTime / fastestTime;
    }

    double distanceWeight;
    double timeWeight;

    if (priority == "normal")
    {
        distanceWeight = 0.7;
        timeWeight = 0.3;
    }
    else
    {
        distanceWeight = 0.3;
        timeWeight = 0.7;
    }

    double shortestScore = (distanceWeight * 1) + (timeWeight * timeRatio);
    double fastestScore = (distanceWeight * distanceRatio) + (timeWeight * 1);

    vector<int> recommendedRoute;
    string recommendedType;

    if (fastestScore < shortestScore)
    {
        recommendedRoute = fastestRoute;
        recommendedType = "fastest";
    }
    else
    {
        recommendedRoute = shortestRoute;
        recommendedType = "shortest";
    }

    stringstream reasonStream;
    reasonStream << fixed << setprecision(2);

    if (shortestRoute == fastestRoute)
    {
        recommendedRoute = shortestRoute;

        reasonStream << "Both routes are identical. Distance "
                     << shortestDistance << " m, time "
                     << shortestTime << " s.";
    }
    else if (recommendedType == "fastest")
    {
        reasonStream << "Fastest route selected. Distance "
                     << fastestDistance << " m, time "
                     << fastestTime << " s.";

        if (fastestDistance > shortestDistance)
        {
            reasonStream << " Shortest route saves "
                         << (fastestDistance - shortestDistance) << " m but adds "
                         << (shortestTime - fastestTime) << " s.";
        }
    }
    else
    {
        reasonStream << "Shortest route selected. Distance "
                     << shortestDistance << " m, time "
                     << shortestTime << " s.";

        if (shortestTime > fastestTime)
        {
            reasonStream << " Fastest route saves "
                         << (shortestTime - fastestTime) << " s but adds "
                         << (fastestDistance - shortestDistance) << " m.";
        }
    }

    string recommendationReason = reasonStream.str();

    cout << "\n==================================" << endl;
    cout << " AI AGENT RECOMMENDATION" << endl;
    cout << "==================================" << endl;

    cout << "Collection Priority: " << priority << endl;

    cout << "Recommended Route: ";

    for (int i = 0; i < recommendedRoute.size(); i++)
    {
        cout << recommendedRoute[i];

        if (i != recommendedRoute.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << "\nReason: " << recommendationReason << endl;

    json routeData;

    routeData["startNode"] = startNode;
    routeData["destinationNode"] = nearestNode;

    routeData["shortestRoute"] = shortestRoute;
    routeData["fastestRoute"] = fastestRoute;

    routeData["priority"] = priority;
    routeData["recommendedRoute"] = recommendedRoute;
    routeData["recommendationReason"] = recommendationReason;

    ofstream routeFile("data/route.json");

    if (!routeFile.is_open())
    {
        cout << "\nUnable to Create Route File!" << endl;
        return 1;
    }

    routeFile << routeData.dump(4);
    routeFile.close();

    cout << "\nRoutes Saved Successfully!" << endl;

    cout << "\nRoute Calculation Complete!" << endl;

    return 0;
}
