<div align="center">

# ♻️ Smart Garbage Collection System

### An Intelligent, Map-Based Waste Collection and Route Planning System

<p>
  <img src="https://img.shields.io/badge/C%2B%2B-DSA-blue?style=for-the-badge&logo=cplusplus&logoColor=white" alt="C++">
  <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Flask">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="Frontend">
  <img src="https://img.shields.io/badge/Map-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet">
</p>

**A university Data Structures and Algorithms project focused on improving garbage collection through graph-based road modelling, route optimization, and an interactive map interface.**

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Project Objectives](#-project-objectives)
- [Current Features](#-current-features)
- [Data Structures and Algorithms](#-data-structures-and-algorithms)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running the Project](#-running-the-project)
- [Current Scope](#-current-scope)
- [Future Improvements](#-future-improvements)
- [Screenshots](#-screenshots)

---

## 🌍 Overview

The **Smart Garbage Collection System** is designed to support more organized waste collection by representing a road network as a graph and calculating routes between locations.

The project combines a C++ route-planning component with a Python Flask backend and a web-based frontend. An interactive Leaflet map provides a geographical view of the road network and collection-related locations.

The main focus of this project is the practical application of **Data Structures and Algorithms (DSA)** to a real-world urban management problem.

## ⚠️ Problem Statement

Traditional garbage collection can involve inefficient route planning, unnecessary travel, and limited visibility of collection locations.

This project explores how graph-based modelling and route optimization can help identify suitable routes across a road network and provide a map-based interface for interacting with the system.

## 🎯 Project Objectives

- Represent a road network using graph data structures.
- Apply Dijkstra's algorithm for route calculation.
- Support shortest-distance and fastest-route planning.
- Use a manual MinHeap implementation in graph-related operations.
- Provide road-name suggestions through a Trie-based structure.
- Display road and collection information on an interactive map.
- Connect the C++ routing logic with a web interface through a Flask backend.

## 🚀 Current Features

The following describes the project's existing implementation and scope:

| Feature | Description |
|---|---|
| Road Network Graph | Stores road-network nodes and connections. |
| Route Calculation | Calculates routes using Dijkstra's algorithm. |
| Shortest-Distance Route | Finds a route based on distance. |
| Fastest-Route Option | Supports route planning using the available travel-time/weight data. |
| MinHeap | Uses a manually implemented MinHeap in graph processing. |
| Trie-Based Suggestions | Supports road-name searching/suggestions. |
| Interactive Map | Displays the geographical network using Leaflet. |
| Flask Backend | Connects frontend requests with the C++ routing program. |
| Route Output | Saves calculated route information for frontend use. |
| Collection Locations | Supports the existing bin-related data and interactions. |
| Rule-Based Route Recommendation | Existing priority-based logic selects the available route-planning mode. |

> **Note:** Features such as independent multi-vehicle dispatch, complete battery and capacity management, charging stations, and disposal workflows are not described as completed features here.

## 🧠 Data Structures and Algorithms

The project applies the following concepts from Data Structures and Algorithms:

| Concept | Role in the Project |
|---|---|
| Graph (Adjacency List) | Represents road-network nodes and connections. |
| Dijkstra's Algorithm | Calculates routes through the road network. |
| MinHeap | Supports efficient selection of the next graph node during route calculation. |
| Trie | Supports road-name lookup and suggestions. |

These concepts are used to demonstrate how core DSA techniques can be applied to a practical route-planning problem.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| C++ | Graph processing and route calculation |
| Python | Backend integration |
| Flask | API/server layer |
| HTML5 | Frontend structure |
| CSS3 | Frontend styling |
| JavaScript | Frontend interactions |
| Leaflet.js | Interactive map |
| OpenStreetMap | Map tiles and geographical data |
| JSON | Road-network, bin, and route data storage |

## 🏗️ System Architecture

```text
                 ┌──────────────────────────┐
                 │      Web Frontend        │
                 │   HTML / CSS / JavaScript│
                 │       Leaflet Map        │
                 └────────────┬─────────────┘
                              │
                              │ HTTP Requests
                              ▼
                 ┌──────────────────────────┐
                 │       Flask Server       │
                 │       Python API         │
                 └────────────┬─────────────┘
                              │
                              │ Executes / Communicates
                              ▼
                 ┌──────────────────────────┐
                 │       C++ Backend        │
                 │                          │
                 │   Graph + Dijkstra       │
                 │       Manual MinHeap     │
                 │          Trie            │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │       JSON Data          │
                 │ Graph / Roads / Bins     │
                 │       Route Output       │
                 └──────────────────────────┘
```

## 📁 Project Structure

The following is a high-level representation of the existing project layout. Some supporting files may be omitted for readability.

```text
SmartGarbage/
│
├── data/
│   ├── graph.json
│   ├── road_names.json
│   ├── route.json
│   └── bins.json
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── scripts/
│   ├── export_graph.py
│   └── server.py
│
├── src/
│   ├── main.cpp
│   ├── Graph.cpp
│   ├── Graph.h
│   ├── Edge.h
│   ├── MinHeap.cpp
│   ├── MinHeap.h
│   └── Trie.cpp
│
└── main.exe
```

## ⚙️ Getting Started

### Prerequisites

Make sure the following tools are available on your system:

- A C++ compiler such as **g++** (MinGW/MSYS2 on Windows).
- **Python 3**.
- **Flask** and any other Python dependencies required by the project.
- **Visual Studio Code** or another code editor.
- A modern web browser.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/SmartGarbage.git
```

```bash
cd SmartGarbage
```

Replace `YOUR-USERNAME` with your GitHub username and adjust the repository name if needed.

### 2. Install Python Dependencies

Install Flask if it is not already installed:

```bash
python -m pip install flask
```

If the project has a dependency file, install the dependencies listed there as well.

### 3. Compile the C++ Program

From the project root, compile the existing C++ source files according to their current dependencies.

Example command (adjust source files if your build setup differs):

```bash
g++ src/main.cpp src/Graph.cpp src/MinHeap.cpp src/Trie.cpp -o main.exe
```

> If your current project uses a different compilation command or additional source files, use the command that matches its actual build configuration.

## ▶️ Running the Project

The project uses a local Flask server and a browser-based frontend.

1. Open the project folder in your code editor.
2. Start the Flask server using the project's existing server script.
3. Open the frontend through a local development server, such as VS Code Live Server.
4. Use the map and available controls to interact with the existing route-planning functionality.

**Typical local addresses used during development:**

| Component | Local Address |
|---|---|
| Flask Backend | `http://127.0.0.1:5000` |
| Frontend (Live Server) | `http://127.0.0.1:5500/frontend/index.html` |

> These addresses assume the default local ports used during development. Your actual configuration may differ.

## 📌 Current Scope

This repository documents the existing project implementation, not a planned future version.

The current focus is graph-based route planning, road-name suggestions, the Flask integration layer, and the interactive map.

Vehicle fleet automation and advanced resource-management workflows should be documented as completed only after they have been implemented and tested.

## 🔮 Future Improvements

Potential future development areas include:

- Independent multi-vehicle simulation.
- Intelligent vehicle assignment based on route distance and availability.
- Vehicle battery and garbage-capacity tracking.
- Charging and waste-disposal workflows.
- Live fleet monitoring and status dashboards.
- Improved request management and collection analytics.

These are **future development ideas**, not claims about the current implementation.

## 🖼️ Screenshots

Add screenshots of the running application here as the interface evolves.

```text
screenshots/
├── dashboard.png
└── route-planning.png
```

To display an image after uploading it to the repository, use:

```md
![Application Dashboard](screenshots/dashboard.png)
```

---

<div align="center">

### ♻️ Smart Garbage Collection System

**Developed as a Data Structures and Algorithms university project.**

*Applying DSA concepts to smarter urban waste collection.*

</div>
