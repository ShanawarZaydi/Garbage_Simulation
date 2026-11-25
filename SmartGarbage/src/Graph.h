
#ifndef GRAPH_H
#define GRAPH_H

#include <string>
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

    vector<int> Dijkstra(int startNode, int destinationNode, bool useTime);
    int findNearestNode(int startNode, vector<int> destinationNodes);

    double getRouteDistance(vector<int> route);
    double getRouteTime(vector<int> route);
};

class Trie
{
private:
    struct TrieNode
    {
        vector<pair<unsigned char, TrieNode *>> children;

        bool isEnd;
        string roadName;
        vector<int> graphNodes;

        TrieNode();
    };

    TrieNode *root;

    TrieNode *findChild(TrieNode *node, unsigned char character);

    void displayMatches(TrieNode *node);

public:
    Trie();

    void insert(string roadName, vector<int> nodes);

    void search(string prefix);
    vector<int> getRoadNodes(string roadName);
};
#endif
