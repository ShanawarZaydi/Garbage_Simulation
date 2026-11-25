
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
