
#include "Graph.h"
#include "MinHeap.h"
#include <limits>

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

vector<int> Graph::Dijkstra(int startNode, int destinationNode, bool useTime)
{
    if (startNode < 0 || startNode >= totalNodes ||
        destinationNode < 0 || destinationNode >= totalNodes)
    {
        cout << "\nInvalid Node ID!" << endl;
        return {};
    }

    vector<double> distance(totalNodes, numeric_limits<double>::max());

    vector<int> parent(totalNodes, -1);

    MinHeap minHeap;

    distance[startNode] = 0;

    minHeap.insert(0, startNode);

    while (!minHeap.isEmpty())
    {
        pair<double, int> current = minHeap.getMinimum();

        minHeap.removeMinimum();

        double currentWeight = current.first;
        int currentNode = current.second;

        if (currentWeight > distance[currentNode])
        {
            continue;
        }

        for (int i = 0; i < adjacencyList[currentNode].size(); i++)
        {
            Edge road = adjacencyList[currentNode][i];

            int nextNode = road.destination;

            double weight;

            if (useTime)
            {
                weight = road.time;
            }
            else
            {
                weight = road.distance;
            }

            double newDistance = distance[currentNode] + weight;

            if (newDistance < distance[nextNode])
            {
                distance[nextNode] = newDistance;

                parent[nextNode] = currentNode;

                minHeap.insert(newDistance, nextNode);
            }
        }
    }

    if (distance[destinationNode] == numeric_limits<double>::max())
    {
        cout << "\nNo Route Found!" << endl;
        return {};
    }

    vector<int> route;
    vector<int> finalRoute;

    int currentNode = destinationNode;

    while (currentNode != -1)
    {
        route.push_back(currentNode);

        currentNode = parent[currentNode];
    }

    for (int i = route.size() - 1; i >= 0; i--)
    {
        finalRoute.push_back(route[i]);
    }

    cout << "\nDijkstra Results" << endl;

    if (useTime)
    {
        cout << "Optimization: Fastest Route" << endl;
        cout << "Total Travel Time: " << distance[destinationNode]
             << " seconds" << endl;
    }
    else
    {
        cout << "Optimization: Shortest Distance" << endl;
        cout << "Total Distance: " << distance[destinationNode]
             << " meters" << endl;
    }

    cout << "Route: ";

    for (int i = 0; i < finalRoute.size(); i++)
    {
        cout << finalRoute[i];

        if (i < finalRoute.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << endl;

    return finalRoute;
}

int Graph::findNearestNode(int startNode, vector<int> destinationNodes)
{
    vector<double> distance(totalNodes, numeric_limits<double>::max());

    MinHeap minHeap;

    distance[startNode] = 0;

    minHeap.insert(0, startNode);

    while (!minHeap.isEmpty())
    {
        pair<double, int> current = minHeap.getMinimum();

        minHeap.removeMinimum();

        double currentDistance = current.first;
        int currentNode = current.second;

        if (currentDistance > distance[currentNode])
        {
            continue;
        }

        for (int i = 0; i < adjacencyList[currentNode].size(); i++)
        {
            Edge road = adjacencyList[currentNode][i];

            int nextNode = road.destination;

            double newDistance = currentDistance + road.distance;

            if (newDistance < distance[nextNode])
            {
                distance[nextNode] = newDistance;

                minHeap.insert(newDistance, nextNode);
            }
        }
    }

    int nearestNode = -1;
    double shortestDistance = numeric_limits<double>::max();

    for (int i = 0; i < destinationNodes.size(); i++)
    {
        int node = destinationNodes[i];

        if (node >= 0 && node < totalNodes && node != startNode)
        {
            if (distance[node] < shortestDistance)
            {
                shortestDistance = distance[node];
                nearestNode = node;
            }
        }
    }

    return nearestNode;
}