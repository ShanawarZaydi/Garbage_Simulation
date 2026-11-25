from flask import Flask, request, jsonify
import subprocess
import json
from pathlib import Path

app = Flask(__name__)

project_folder = Path(__file__).resolve().parent.parent


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/calculate-route", methods=["POST"])
def calculate_route():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request data"}), 400

    try:
        start_node = int(data.get("startNode"))
        destination = str(data.get("destination", "")).strip()
        priority = str(data.get("priority", "normal")).strip().lower()
        if priority not in ["normal", "urgent"]:
            return jsonify({"error": "Invalid collection priority"}), 400

        if start_node < 0 or start_node > 767:
            return jsonify({"error": "Invalid starting node"}), 400

        if destination == "":
            return jsonify({"error": "Destination is required"}), 400

        result = subprocess.run(
            [str(project_folder / "main.exe"), str(start_node), destination, priority],
            cwd=project_folder,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return (
                jsonify(
                    {
                        "error": "C++ program failed",
                        "returncode": result.returncode,
                        "output": result.stdout,
                        "error_details": result.stderr,
                    }
                ),
                400,
            )

        route_file = project_folder / "data" / "route.json"

        with open(route_file, "r") as file:
            route_data = json.load(file)

        return jsonify(route_data)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Route calculation timed out"}), 500

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/update-bin-status", methods=["POST"])
def update_bin_status():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    try:
        bin_id = int(data.get("id"))
        status = str(data.get("status", "")).strip()

        if status not in ["Empty", "Half Full", "Full"]:
            return jsonify({"error": "Invalid bin status"}), 400

        bins_file = project_folder / "data" / "bins.json"

        with open(bins_file, "r") as file:
            bin_data = json.load(file)

        found = False

        for bin in bin_data["bins"]:

            if bin["id"] == bin_id:

                bin["status"] = status
                found = True
                break

        if not found:
            return jsonify({"error": "Bin not found"}), 404

        with open(bins_file, "w") as file:
            json.dump(bin_data, file, indent=4)

        return jsonify(
            {
                "message": "Bin status updated successfully",
                "bin": {"id": bin_id, "status": status},
            }
        )

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/plan-multi-bin-route", methods=["POST"])
def plan_multi_bin_route():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    try:
        start_node = int(data.get("startNode"))
        bin_ids = data.get("binIds", [])

        if not isinstance(bin_ids, list) or len(bin_ids) == 0:
            return jsonify({"error": "Please select at least one bin"}), 400

        if start_node < 0 or start_node > 767:
            return jsonify({"error": "Invalid starting node"}), 400

        bins_file = project_folder / "data" / "bins.json"

        with open(bins_file, "r") as file:
            bin_data = json.load(file)

        selected_nodes = []
        bin_lookup = {}

        for bin_id in bin_ids:
            bin_id = int(bin_id)
            found = False

            for bin in bin_data["bins"]:
                if bin["id"] == bin_id:
                    selected_nodes.append(bin["node"])
                    bin_lookup[bin["node"]] = bin_id
                    found = True
                    break

            if not found:
                return jsonify({"error": "Bin not found: " + str(bin_id)}), 404

        command = [str(project_folder / "main.exe"), "multi", str(start_node)]

        for node in selected_nodes:
            command.append(str(node))

        result = subprocess.run(
            command,
            cwd=project_folder,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return (
                jsonify(
                    {
                        "error": "Multi-bin route calculation failed",
                        "output": result.stdout,
                        "error_details": result.stderr,
                    }
                ),
                400,
            )

        multi_route_file = project_folder / "data" / "multi_route.json"

        with open(multi_route_file, "r") as file:
            multi_route_data = json.load(file)

        ordered_bin_ids = []

        for i in range(1, len(multi_route_data["orderedStops"])):
            node = multi_route_data["orderedStops"][i]

            if node in bin_lookup:
                ordered_bin_ids.append(bin_lookup[node])

        multi_route_data["orderedBinIds"] = ordered_bin_ids

        return jsonify(multi_route_data)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Multi-bin route calculation timed out"}), 500

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/dispatch-vehicle", methods=["POST"])
def dispatch_vehicle():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request"}), 400

    try:
        target_node = int(data.get("targetNode"))

        if target_node < 0 or target_node > 767:
            return jsonify({"error": "Invalid target node"}), 400

        bin_ids = data.get("binIds", [])

        command = [str(project_folder / "main.exe"), "dispatch", str(target_node)]

        for bin_id in bin_ids:
            command.append(str(bin_id))

        result = subprocess.run(
            command,
            cwd=project_folder,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return (
                jsonify(
                    {
                        "error": "Vehicle dispatch failed",
                        "output": result.stdout,
                        "error_details": result.stderr,
                    }
                ),
                400,
            )

        dispatch_file = project_folder / "data" / "dispatch.json"

        with open(dispatch_file, "r") as file:
            dispatch_data = json.load(file)

        return jsonify(dispatch_data)

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Vehicle dispatch timed out"}), 500

    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
