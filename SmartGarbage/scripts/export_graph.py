import osmnx as ox
import json

center = (33.729, 73.079)
distance = 1500

print("Downloading F-6 road network...")

G = ox.graph_from_point(center, dist=distance, network_type="drive")

print("Adding road speeds...")

G = ox.routing.add_edge_speeds(G)
G = ox.routing.add_edge_travel_times(G)

osm_ids = list(G.nodes)
id_map = {}

nodes = []
edges = []

road_names = {}

for i in range(len(osm_ids)):
    osm_id = osm_ids[i]
    id_map[osm_id] = i

for osm_id in osm_ids:
    data = G.nodes[osm_id]

    node = {"id": id_map[osm_id], "osm_id": osm_id, "lat": data["y"], "lon": data["x"]}

    nodes.append(node)

for u, v, key, data in G.edges(keys=True, data=True):

    if "geometry" in data:
        points = []

        for lon, lat in data["geometry"].coords:
            points.append([lat, lon])

    else:
        points = [
            [G.nodes[u]["y"], G.nodes[u]["x"]],
            [G.nodes[v]["y"], G.nodes[v]["x"]],
        ]
    # removes extra names
    if "name" in data:

        names = data["name"]

        if isinstance(names, str):
            names = names.split(";")

        for name in names:

            name = name.strip()

            if name != "":

                if name not in road_names:
                    road_names[name] = set()

                road_names[name].add(id_map[u])
                road_names[name].add(id_map[v])
    edge = {
        "from": id_map[u],
        "to": id_map[v],
        "length": data["length"],
        "time": data["travel_time"],
        "geometry": points,
    }

    edges.append(edge)

graph = {"nodes": nodes, "edges": edges}
clean_road_names = {}

for name in road_names:

    clean_road_names[name] = {"nodes": sorted(list(road_names[name]))}

with open("data/road_names.json", "w", encoding="utf-8") as file:
    json.dump(clean_road_names, file, ensure_ascii=False, indent=4)

print("Total Unique Road Names:", len(clean_road_names))
print("Road Names Dataset Created!")

with open("data/graph.json", "w") as file:
    json.dump(graph, file)

print("Download Complete!")
print("Total Nodes:", len(nodes))
print("Total Edges:", len(edges))
