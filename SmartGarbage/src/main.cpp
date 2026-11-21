
#include <iostream>
#include <fstream>
#include <string>
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

    vector<int> recommendedRoute;
    string recommendationReason;

    if (priority == "normal")
    {
        recommendedRoute = shortestRoute;
        recommendationReason = "Shortest distance selected for normal collection.";
    }
    else if (priority == "urgent")
    {
        recommendedRoute = fastestRoute;
        recommendationReason = "Fastest route selected for urgent collection.";
    }
    else
    {
        cout << "\nInvalid Priority! Use normal or urgent." << endl;
        return 1;
    }

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
