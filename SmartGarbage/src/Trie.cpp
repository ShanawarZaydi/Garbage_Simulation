
#include <iostream>
#include "Graph.h"

using namespace std;

Trie::TrieNode::TrieNode()
{
    isEnd = false;
}

Trie::Trie()
{
    root = new TrieNode();
}

Trie::TrieNode *Trie::findChild(TrieNode *node, unsigned char character)
{
    for (int i = 0; i < node->children.size(); i++)
    {
        if (node->children[i].first == character)
        {
            return node->children[i].second;
        }
    }

    return nullptr;
}

void Trie::insert(string roadName, vector<int> nodes)
{
    TrieNode *current = root;

    for (int i = 0; i < roadName.length(); i++)
    {
        unsigned char character = (unsigned char)roadName[i];

        TrieNode *next = findChild(current, character);

        if (next == nullptr)
        {
            next = new TrieNode();

            current->children.push_back({character, next});
        }

        current = next;
    }

    current->isEnd = true;
    current->roadName = roadName;
    current->graphNodes = nodes;
}

void Trie::displayMatches(TrieNode *node)
{
    if (node->isEnd)
    {
        cout << "\nRoad: " << node->roadName << endl;

        cout << "Connected Nodes: ";

        for (int i = 0; i < node->graphNodes.size(); i++)
        {
            cout << node->graphNodes[i] << " ";
        }

        cout << endl;
    }

    for (int i = 0; i < node->children.size(); i++)
    {
        displayMatches(node->children[i].second);
    }
}

void Trie::search(string prefix)
{
    TrieNode *current = root;

    for (int i = 0; i < prefix.length(); i++)
    {
        unsigned char character = (unsigned char)prefix[i];

        current = findChild(current, character);

        if (current == nullptr)
        {
            cout << "\nNo Matching Road Found!" << endl;
            return;
        }
    }

    cout << "\nMatching Roads:" << endl;

    displayMatches(current);
}
