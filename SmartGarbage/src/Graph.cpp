
#include "Graph.h"

Graph::Graph(int nodes)
{
    totalNodes = nodes;
    adjacencyList.resize(nodes);
}

void Graph::addEdge(int from, int to, double distance, double time)
{
    Edge newEdge;

    newEdge.destination = to;
    newEdge.distance = distance;
    newEdge.time = time;

    adjacencyList[from].push_back(newEdge);
}

void Graph::displayNode(int node)
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

void Graph::displayGraphInfo()
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

void Graph::BFS(int startNode)
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
