
#include <iostream>
#include "../src/MinHeap.h"

using namespace std;

int main()
{
    MinHeap minHeap;

    minHeap.insert(40, 4);
    minHeap.insert(10, 2);
    minHeap.insert(25, 1);
    minHeap.insert(15, 3);

    while (!minHeap.isEmpty())
    {
        pair<double, int> result = minHeap.getMinimum();

        cout << "Weight: " << result.first;
        cout << " | Node: " << result.second << endl;

        minHeap.removeMinimum();
    }

    return 0;
}
