
#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>
#include "Graph.h"

using namespace std;
using json = nlohmann::json;

int main()
{
    ifstream file("data/graph.json");

    if (!file.is_open())
    {
        cout << "Error: Cannot open graph.json" << endl;
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

    cout << "Graph Loaded Successfully!" << endl;
    cout << "Total Nodes: " << totalNodes << endl;
    cout << "Total Edges: " << data["edges"].size() << endl;

    cityGraph.displayNode(0);
    cityGraph.displayGraphInfo();
    cityGraph.BFS(0);

    // false = Distance Mode
    //  true = Time Mode
    cityGraph.Dijkstra(0, 249, false);
    cityGraph.Dijkstra(0, 249, true);

    cityGraph.Dijkstra(0, 500, false);
    cityGraph.Dijkstra(0, 500, true);

    ifstream roadFile("data/road_names.json");

    if (!roadFile.is_open())
    {
        cout << "Road Names File Not Found!" << endl;
        return 1;
    }

    json roadData;

    roadFile >> roadData;

    roadFile.close();

    cout << "\nRoad Names Loaded Successfully!" << endl;
    cout << "Total Road Names: " << roadData.size() << endl;

    auto firstRoad = roadData.begin();

    cout << "\nFirst Road: " << firstRoad.key() << endl;

    cout << "Connected Nodes: ";

    for (int i = 0; i < firstRoad.value()["nodes"].size(); i++)
    {
        cout << firstRoad.value()["nodes"][i] << " ";
    }

    cout << endl;

    // TRIE----------------------------
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

    cout << "\nTrie Loaded Successfully!" << endl;
    cout << "Total Roads Inserted: " << roadData.size() << endl;

    roadTrie.search("Ataturk");
    roadTrie.search("7th");
    roadTrie.search("شارع");
    return 0;
}
