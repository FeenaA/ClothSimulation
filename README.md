# WebGPU Cloth Simulation

A real-time cloth simulation implemented from scratch using WebGPU and JavaScript.

## About

This project explores real-time cloth simulation using modern WebGPU rendering. The simulation is based on Verlet integration and distance constraints without relying on external physics engines.

The goal of the project is to better understand GPU rendering pipelines, cloth physics, and modern browser graphics APIs by implementing the core algorithms from scratch.

## Features

- Cloth simulation based on Verlet integration
- Distance constraint solver
- Triangle mesh generation
- Toggleable gravity
- Pinned vertices
- Driven control vertex
- Debug visualization

## Algorithms

- Verlet integration
- Distance constraints
- Triangle mesh generation

## Technologies

- JavaScript (ES6)
- WebGPU API
- WGSL
- Vite

## Project Structure

```text
src/
├── renderer/      # WebGPU renderer
│   └── WebGPU.js
├── shaders/       # WGSL shaders
│   ├── cloth.wgsl
│   └── debug.wgsl
├── simulation/    # Cloth simulation and mesh generation
│   ├── ClothMesh.js
│   └── ClothSimulation.js
└── main.js
```

## Running locally

```bash
npm install
npm run dev
```

## Screenshot

> Screenshot will be added after the first stable release.

## Planned Improvements

- Surface shading
- Lighting
- Mouse interaction
- Wind simulation
- Vertex picking
- Cloth tearing

## License

This project is provided for educational and portfolio purposes.