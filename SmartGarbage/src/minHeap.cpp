
#include "MinHeap.h"

void MinHeap::insert(double weight, int node)
{
    pair<double, int> newValue;

    newValue.first = weight;
    newValue.second = node;

    heap.push_back(newValue);

    heapifyUp(heap.size() - 1);
}

pair<double, int> MinHeap::getMinimum()
{
    if (heap.empty())
    {
        return {-1, -1};
    }

    return heap[0];
}

void MinHeap::removeMinimum()
{
    if (heap.empty())
    {
        return;
    }

    heap[0] = heap[heap.size() - 1];

    heap.pop_back();

    if (!heap.empty())
    {
        heapifyDown(0);
    }
}

bool MinHeap::isEmpty()
{
    return heap.empty();
}

void MinHeap::heapifyUp(int index)
{
    while (index > 0)
    {
        int parent = (index - 1) / 2;

        if (heap[index].first < heap[parent].first)
        {
            pair<double, int> temp = heap[index];
            heap[index] = heap[parent];
            heap[parent] = temp;

            index = parent;
        }
        else
        {
            break;
        }
    }
}

void MinHeap::heapifyDown(int index)
{
    int size = heap.size();

    while (true)
    {
        int smallest = index;

        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < size &&
            heap[left].first < heap[smallest].first)
        {
            smallest = left;
        }

        if (right < size &&
            heap[right].first < heap[smallest].first)
        {
            smallest = right;
        }

        if (smallest != index)
        {
            pair<double, int> temp = heap[index];
            heap[index] = heap[smallest];
            heap[smallest] = temp;

            index = smallest;
        }
        else
        {
            break;
        }
    }
}
