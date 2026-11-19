
#ifndef MINHEAP_H
#define MINHEAP_H

#include <vector>

using namespace std;

class MinHeap
{
private:
    vector<double> heap;

public:
    void insert(double value);

    double getMinimum();

    void removeMinimum();

    bool isEmpty();

    void heapifyUp(int index);

    void heapifyDown(int index);
};

#endif
