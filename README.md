<div align="center">

# ♻️ Smart Garbage Collection System

### Intelligent, Map-Based Waste Collection and Route Planning

<p>
  <img src="https://img.shields.io/badge/C%2B%2B-DSA-blue?style=for-the-badge&logo=cplusplus&logoColor=white" alt="C++">
  <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Flask">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="Frontend">
  <img src="https://img.shields.io/badge/Map-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet">
</p>

**A university Data Structures and Algorithms project applying graph-based route planning to an urban waste collection problem.**

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Objectives](#-objectives)
- [Current Features](#-current-features)
- [Data Structures and Algorithms](#-data-structures-and-algorithms)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Setup and Installation](#-setup-and-installation)
- [How to Run](#-how-to-run)
- [Virtual Environment](#-virtual-environment)
- [Current Scope](#-current-scope)
- [Future Improvements](#-future-improvements)
- [Screenshots](#-screenshots)

---

## 🌍 Overview

The **Smart Garbage Collection System** is designed to support organized waste collection through graph-based road modelling and route calculation.

The project combines a C++ route-planning component, a Python Flask backend, and a web frontend. The frontend uses Leaflet to display an interactive map.

The main academic focus is the practical use of **Data Structures and Algorithms (DSA)** to model a road network and calculate suitable routes.

## ⚠️ Problem Statement

Garbage collection operations can involve inefficient travel routes and limited visibility of collection locations. This project explores how graph representation and route optimization can help plan routes across a road network.

## 🎯 Objectives

- Represent a road network using a graph.
- Apply Dijkstra's algorithm for route calculation.
- Support shortest-distance and fastest-route planning.
- Use a manually implemented MinHeap in graph processing.
- Use Trie-based road-name lookup and suggestions.
- Display map and collection-related information through a web interface.
- Connect the C++ routing component with the frontend through Flask.

## 🚀 Current Features

| Feature | Description |
|---|---|
| Road Network Graph | Represents road-network nodes and connections. |
| Dijkstra's Algorithm | Calculates routes through the graph. |
| Shortest-Distance Route | Supports route planning based on distance. |
| Fastest-Route Option | Supports route planning using the available travel-time/weight data. |
| Manual MinHeap | Used in graph-related processing. |
| Trie-Based Suggestions | Supports road-name searching/suggestions. |
| Interactive Map | Displays geographical information using Leaflet. |
| Flask Backend | Connects frontend requests with the C++ routing program. |
| JSON Data | Stores graph, road-name, bin, and route-related data. |
| Rule-Based Route Recommendation | Existing priority-based logic selects the available route-planning mode. |

> **Scope note:** Independent multi-vehicle dispatch, complete battery and capacity management, charging stations, and disposal workflows are not claimed as completed features in this README.

## 🧠 Data Structures and Algorithms

| Concept | Purpose |
|---|---|
| Graph (Adjacency List) | Represents road-network nodes and connections. |
| Dijkstra's Algorithm | Calculates routes through the road network. |
| Manual MinHeap | Supports efficient selection of the next graph node. |
| Trie | Supports road-name lookup and suggestions. |

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| C++ | Graph processing and route calculation |
| Python | Backend integration |
| Flask | Backend server/API |
| HTML5 | Frontend structure |
| CSS3 | Frontend styling |
| JavaScript | Frontend interactions |
| Leaflet.js | Interactive map |
| OpenStreetMap | Map tiles and geographical data |
| JSON | Data storage and exchange |
| Python `venv` | Isolated Python environment |

## 🏗️ System Architecture

```text
             ┌──────────────────────────────┐
             │          Frontend            │
             │      HTML / CSS / JS         │
             │         Leaflet Map          │
             └──────────────┬───────────────┘
                            │ HTTP Requests
                            ▼
             ┌──────────────────────────────┐
             │        Python Flask          │
             │        Backend API           │
             └──────────────┬───────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │          C++ Backend         │
             │                              │
             │     Graph / Dijkstra         │
             │       Manual MinHeap         │
             │           Trie               │
             └──────────────┬───────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │          JSON Data           │
             │ Graph / Roads / Bins / Route │
             └──────────────────────────────┘
```

## 📁 Project Structure

The following structure is based on the current project layout.

```text
SmartGarbage/
│
├── .venv/                    # Python virtual environment (local)
│
├── .vscode/                  # VS Code project settings
│
├── cache/                    # Cached/generated data
│
├── data/
│   ├── bins.json
│   ├── dispatch.json
│   ├── graph.json
│   ├── multi_route.json
│   ├── road_names.json
│   ├── route.json
│   └── vehicles.json
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── scripts/
│   ├── export_graph.py
│   └── server.py
│
├── src/
│   ├── Edge.h
│   ├── Graph.cpp
│   ├── Graph.h
│   ├── main.cpp
│   ├── minHeap.cpp
│   ├── MinHeap.h
│   └── Trie.cpp
│
├── tests/
│   └── minheap_test.cpp
│
├── build.ps1
├── compiler_test.cpp
├── err.txt
├── heap_test.exe
├── main.exe
├── requirements.txt
└── simple_test.cpp
```

> `.venv/`, cache files, executables, and generated output files are local/project-support files. They do not all need to be committed to GitHub. Keep the source code, required JSON data, scripts, and `requirements.txt` in the repository as appropriate.

## ⚙️ Setup and Installation

### 1. Install the Prerequisites

Make sure you have:

- Windows 10/11
- Python 3
- g++ compiler (MinGW-w64 / MSYS2)
- Visual Studio Code
- VS Code Live Server extension
- A modern web browser

### 2. Clone the Repository

```powershell
git clone https://github.com/YOUR-USERNAME/SmartGarbage.git
cd SmartGarbage
```

Replace `YOUR-USERNAME` with your GitHub username.

### 3. Create a Virtual Environment (if needed)

If `.venv` is not already present, create it:

```powershell
python -m venv .venv
```

### 4. Activate the Virtual Environment

In PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

After activation, your terminal prompt should show `(.venv)`.

If PowerShell blocks script execution, run this command for the current terminal session, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 5. Install Python Dependencies

With `.venv` activated:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The `requirements.txt` file contains the Python packages required by the project.

## ▶️ How to Run

Run the project from the **SmartGarbage root folder**.

### Step 1 — Open the Project

Open the `SmartGarbage` folder in VS Code.

### Step 2 — Activate `.venv`

In the VS Code PowerShell terminal:

```powershell
.\.venv\Scripts\Activate.ps1
```

If it is already active, you do not need to activate it again.

### Step 3 — Build the C++ Program (when rebuilding is needed)

The project contains `build.ps1`. Run the existing build script from the project root:

```powershell
.\build.ps1
```

This step is for rebuilding the C++ executable after source-code changes. If the script reports an error, review the compiler output before continuing.

### Step 4 — Start the Flask Backend

Open a terminal in VS Code, make sure `.venv` is active, and run:

```powershell
python scripts/server.py
```

Keep this terminal running while using the application.

### Step 5 — Start the Frontend

1. In VS Code Explorer, open `frontend/index.html`.
2. Right-click the file.
3. Select **Open with Live Server**.
4. The application should open in your browser.

Typical local development addresses:

| Component | Address |
|---|---|
| Flask Backend | `http://127.0.0.1:5000` |
| Frontend | `http://127.0.0.1:5500/frontend/index.html` |

> The ports above are the local development addresses used for this project. If your server configuration or Live Server port changes, use the address shown in your terminal/browser.

### Step 6 — Use the Application

Use the available frontend controls to interact with the map and existing route-planning features. Keep the Flask backend terminal running while using the frontend.

## 🐍 Virtual Environment (`.venv`)

The `.venv` folder is a **Python virtual environment**. It keeps this project's Python packages separate from packages installed globally on your computer.

| Item | Explanation |
|---|---|
| `.venv/` | Local environment containing the project's Python interpreter and installed packages. |
| `requirements.txt` | List of Python dependencies needed to set up the project. |
| Activate command | `.\.venv\Scripts\Activate.ps1` |
| Install dependencies | `pip install -r requirements.txt` |

**Important:** Do not upload the `.venv/` folder to GitHub. It is machine-specific and can be recreated using `requirements.txt`.

## 📌 Current Scope

This README describes the existing project structure and its current route-planning focus. It does not treat planned fleet-management features as completed functionality.

## 🔮 Future Improvements

Potential future development includes:

- Independent multi-vehicle simulation.
- Intelligent vehicle assignment based on route distance and availability.
- Vehicle battery and garbage-capacity tracking.
- Charging and waste-disposal workflows.
- Live fleet monitoring and dashboard analytics.
- Improved collection-request management.

These are future development ideas and should be marked complete only after implementation and testing.

## 🖼️ Screenshots

Add screenshots of the running application to the repository and link them here.

For example, if you add an image at `screenshots/dashboard.png`:

```md
![Smart Garbage Collection Dashboard](screenshots/dashboard.png)
```

---

<div align="center">

### ♻️ Smart Garbage Collection System

**Developed as a Data Structures and Algorithms university project.**

*Applying DSA concepts to smarter urban waste collection.*

</div>
