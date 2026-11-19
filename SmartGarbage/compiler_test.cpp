#include <iostream>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

int main()
{
    json data;
    data["status"] = "working";

    cout << data["status"] << endl;

    return 0;
}
