
#ifndef GRAPH_H
#define GRAPH_H

#include <iostream>
#include <vector>
#include <queue>
#include "Edge.h"

using namespace std;

class Graph
{
public:
    int totalNodes;
    vector<vector<Edge>> adjacencyList;

    Graph(int nodes);

    void addEdge(int from, int to, double distance, double time);

    void displayNode(int node);

    void displayGraphInfo();

    void BFS(int startNode);
};

#endif
