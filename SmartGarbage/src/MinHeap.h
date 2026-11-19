
#ifndef MINHEAP_H
#define MINHEAP_H

#include <vector>
#include <utility>

using namespace std;

class MinHeap
{
private:
    vector<pair<double, int>> heap;

public:
    void insert(double weight, int node);

    pair<double, int> getMinimum();

    void removeMinimum();

    bool isEmpty();

    void heapifyUp(int index);

    void heapifyDown(int index);
};

#endif
