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

    edge = {
        "from": id_map[u],
        "to": id_map[v],
        "length": data["length"],
        "time": data["travel_time"],
        "geometry": points,
    }

    edges.append(edge)

graph = {"nodes": nodes, "edges": edges}

with open("data/graph.json", "w") as file:
    json.dump(graph, file)

print("Download Complete!")
print("Total Nodes:", len(nodes))
print("Total Edges:", len(edges))
