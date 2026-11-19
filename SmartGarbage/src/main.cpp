
#include <iostream>
#include <vector>
#include <fstream>
#include <nlohmann/json.hpp>

// using queue header file
#include <queue>

using namespace std;
using json = nlohmann::json;

class Edge
{
public:
    int destination;
    double distance;
    double time;
};

class Graph
{
public:
    int totalNodes;
    vector<vector<Edge>> adjacencyList;

    Graph(int nodes)
    {
        totalNodes = nodes;
        adjacencyList.resize(nodes);
    }

    void addEdge(int from, int to, double distance, double time)
    {
        Edge newEdge;

        newEdge.destination = to;
        newEdge.distance = distance;
        newEdge.time = time;

        adjacencyList[from].push_back(newEdge);
    }

    void displayNode(int node)
    {
        cout << "\nNode: " << node << endl;

        for (int i = 0; i < adjacencyList[node].size(); i++)
        {
            cout << "Connected to: "
                 << adjacencyList[node][i].destination;

            cout << " | Distance: "
                 << adjacencyList[node][i].distance;

            cout << " | Time: "
                 << adjacencyList[node][i].time << endl;
        }
    }
    void displayGraphInfo()
    {
        int connectedNodes = 0;
        int totalConnections = 0;

        for (int i = 0; i < totalNodes; i++)
        {
            if (adjacencyList[i].size() > 0)
            {
                connectedNodes++;
            }

            totalConnections += adjacencyList[i].size();
        }

        cout << "\nGraph Information" << endl;
        cout << "Total Nodes: " << totalNodes << endl;
        cout << "Connected Nodes: " << connectedNodes << endl;
        cout << "Total Connections: " << totalConnections << endl;
    }
    void BFS(int startNode)
    {
        vector<bool> visited(totalNodes, false);

        queue<int> q;

        visited[startNode] = true;
        q.push(startNode);

        int visitedCount = 0;

        while (!q.empty())
        {
            int currentNode = q.front();
            q.pop();

            visitedCount++;

            for (int i = 0; i < adjacencyList[currentNode].size(); i++)
            {
                int nextNode = adjacencyList[currentNode][i].destination;

                if (!visited[nextNode])
                {
                    visited[nextNode] = true;
                    q.push(nextNode);
                }
            }
        }

        cout << "\nBFS Traversal Information" << endl;
        cout << "Starting Node: " << startNode << endl;
        cout << "Reachable Nodes: " << visitedCount << endl;
    }
};

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

    return 0;
}
