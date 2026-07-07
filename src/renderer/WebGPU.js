import shaderCode from "../shaders/shader.wgsl?raw";

export class WebGPU {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.simulation = simulation;
        this.device = null;
        this.context = null;
        this.format = null;
        this.clothPipeline = null;
        this.vertexBuffer = null;
        this.vertexCount = 0;
        this.linePipeline = null;
        this.lineVertexBuffer = null;
        this.lineVertexCount = 0;
        this.markerPipeline = null;
        this.markerVertexBuffer = null;
        this.markerVertexCount = 0;
    }

    async init() {
        if (!navigator.gpu) {
            throw new Error("WebGPU не поддерживается");
        }

        const adapter = await navigator.gpu.requestAdapter();

        if (!adapter) {
            throw new Error("Не удалось получить GPU Adapter");
        }

        this.device = await adapter.requestDevice();

        this.context = this.canvas.getContext("webgpu");
        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque",
        });

        this.createPipeline();
        this.createVertexBuffer();
        this.createLineVertexBuffer();
        this.createMarkerVertexBuffer();

        console.log("WebGPU initialized");
    }

    createPipeline() {
        const shaderModule = this.device.createShaderModule({
            code: shaderCode,
        });

        // первый пайплайн
        this.clothPipeline = this.device.createRenderPipeline({
            layout: "auto",

            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 5 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            },
                            {
                                shaderLocation: 1,
                                offset: 2 * 4,
                                format: "float32x3",
                            },
                        ],
                    },
                ],
            },

            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },

            primitive: {
                topology: "triangle-list",
            },

            /*primitive: {
               topology: "line-list",
           },*/
        });

        // второй пайплайн - для сетки
        this.linePipeline = this.device.createRenderPipeline({
            layout: "auto",

            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 5 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            },
                            {
                                shaderLocation: 1,
                                offset: 2 * 4,
                                format: "float32x3",
                            },
                        ],
                    },
                ],
            },

            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },

            primitive: {
                topology: "line-list",
            },
        });

        // пайплайн для маркеров
        this.markerPipeline = this.device.createRenderPipeline({
            layout: "auto",

            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 5 * 4,
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            },
                            {
                                shaderLocation: 1,
                                offset: 2 * 4,
                                format: "float32x3",
                            },
                        ],
                    },
                ],
            },

            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },

            primitive: {
                topology: "line-list",
            },
        });
    }

    createVertexBuffer() {
        const vertices = this.createVerticesFromSimulation();

        this.vertexCount = vertices.length / 5;

        console.log("simulation", this.simulation);
        console.log("vertices", vertices);
        console.log("vertexCount", vertices.length / 5);

        this.vertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
    }

    createVerticesFromSimulation() {
        this.calculateNormals();

        const vertices = [];

        const width = this.simulation.width;
        const height = this.simulation.height;
        const points = this.simulation.points;

        function index(x, y) {
            return y * (width + 1) + x;
        }

        function project(point) {
            const x = point.position[0] - width / 2;
            const y = point.position[1] - height / 2;
            const z = point.position[2];

            const scale = 0.08;

            return [
                (x - y) * scale,
                (x + y) * scale * 0.5 - z * scale
            ];
        }

        // формат вершины: x y nx ny nz
        function addVertex(point) {
            const [x, y] = project(point);

            vertices.push(
                x,
                y,
                point.normal[0],
                point.normal[1],
                point.normal[2]
            );
        }

        function addTriangle(p1, p2, p3) {
            addVertex(p1);
            addVertex(p2);
            addVertex(p3);
        }

        //const clothColor = [0.45, 0.45, 0.45];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const p00 = points[index(x, y)];
                const p10 = points[index(x + 1, y)];
                const p01 = points[index(x, y + 1)];
                const p11 = points[index(x + 1, y + 1)];

                addTriangle(p00, p10, p11);
                addTriangle(p00, p11, p01);
            }
        }

        return new Float32Array(vertices);
    }

    // расчет нормалей
    calculateNormals() {
        const points = this.simulation.points;

        for (const point of points) {
            point.normal = [0, 0, 0];
        }

        const width = this.simulation.width;
        const height = this.simulation.height;

        const index = (x, y) =>
            y * (width + 1) + x;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const p00 = points[index(x, y)];
                const p10 = points[index(x + 1, y)];
                const p01 = points[index(x, y + 1)];
                const p11 = points[index(x + 1, y + 1)];

                this.addTriangleNormal(p00, p10, p11);
                this.addTriangleNormal(p00, p11, p01);
            }
        }

        for (const point of points) {
            const n = point.normal;
            const len = Math.hypot(n[0], n[1], n[2]);

            if (len > 0) {
                n[0] /= len;
                n[1] /= len;
                n[2] /= len;
            }
        }
    }

    // функция генерации сетки
    createWireframeVertices() {
        const vertices = [];

        const width = this.simulation.width;
        const height = this.simulation.height;
        const points = this.simulation.points;

        function index(x, y) {
            return y * (width + 1) + x;
        }

        function project(point) {
            const x = point.position[0] - width / 2;
            const y = point.position[1] - height / 2;
            const z = point.position[2];

            const scale = 0.08;

            return [
                (x - y) * scale,
                (x + y) * scale * 0.5 - z * scale
            ];
        }

        function addLine(a, b) {
            const [ax, ay] = project(a);
            const [bx, by] = project(b);

            vertices.push(
                ax, ay, 0.05, 0.05, 0.05,
                bx, by, 0.05, 0.05, 0.05
            );
        }

        for (let y = 0; y <= height; y++) {
            for (let x = 0; x <= width; x++) {

                const current = points[index(x, y)];

                if (x < width) {
                    addLine(current, points[index(x + 1, y)]);
                }

                if (y < height) {
                    addLine(current, points[index(x, y + 1)]);
                }

                if (x < width && y < height) {
                    addLine(current, points[index(x + 1, y + 1)]);
                }
            }
        }

        return new Float32Array(vertices);
    }

    // генерация маркеров
    createMarkerVertices() {
        const vertices = [];

        const width = this.simulation.width;
        const height = this.simulation.height;
        const points = this.simulation.points;

        const index = (x, y) =>
            y * (width + 1) + x;


        function project(point) {
            const x = point.position[0] - width / 2;
            const y = point.position[1] - height / 2;
            const z = point.position[2];

            const scale = 0.08;

            return [
                (x - y) * scale,
                (x + y) * scale * 0.5 - z * scale
            ];
        }


        function addLine(x1, y1, x2, y2, color) {
            vertices.push(
                x1, y1,
                color[0], color[1], color[2],

                x2, y2,
                color[0], color[1], color[2]
            );
        }


        function addMarker(point, size, color) {
            const [x, y] = project(point);

            addLine(
                x - size,
                y,
                x + size,
                y,
                color
            );

            addLine(
                x,
                y - size,
                x,
                y + size,
                color
            );
        }


        // красные закрепленные углы
        for (const point of points) {
            if (point.pinned) {
                addMarker(
                    point,
                    0.025,
                    [1.0, 0.0, 0.0]
                );
            }
        }


        // синяя управляемая вершина
        for (const point of points) {
            if (point.driven) {
                addMarker(
                    point,
                    0.03,
                    [0.0, 0.3, 1.0]
                );
            }
        }


        return new Float32Array(vertices);
    }

    createLineVertexBuffer() {
        const vertices = this.createWireframeVertices();

        this.lineVertexCount = vertices.length / 5;

        this.lineVertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(
            this.lineVertexBuffer,
            0,
            vertices
        );
    }

    // создать буфер маркеров
    createMarkerVertexBuffer() {
        const vertices = this.createMarkerVertices();

        this.markerVertexCount = vertices.length / 5;

        this.markerVertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(
            this.markerVertexBuffer,
            0,
            vertices
        );
    }

    // обновление обоих буферов
    updateVertexBuffers() {
        const clothVertices = this.createVerticesFromSimulation();

        this.vertexCount = clothVertices.length / 5;

        this.device.queue.writeBuffer(
            this.vertexBuffer,
            0,
            clothVertices
        );


        const lineVertices = this.createWireframeVertices();

        this.lineVertexCount = lineVertices.length / 5;

        this.device.queue.writeBuffer(
            this.lineVertexBuffer,
            0,
            lineVertices
        );

        // обновление маркеров
        const markerVertices = this.createMarkerVertices();

        this.markerVertexCount = markerVertices.length / 5;

        this.device.queue.writeBuffer(
            this.markerVertexBuffer,
            0,
            markerVertices
        );
    }

    addTriangleNormal(p0, p1, p2) {
        const ax = p1.position[0] - p0.position[0];
        const ay = p1.position[1] - p0.position[1];
        const az = p1.position[2] - p0.position[2];

        const bx = p2.position[0] - p0.position[0];
        const by = p2.position[1] - p0.position[1];
        const bz = p2.position[2] - p0.position[2];

        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;

        for (const p of [p0, p1, p2]) {
            p.normal[0] += nx;
            p.normal[1] += ny;
            p.normal[2] += nz;
        }
    }

    render() {
        this.updateVertexBuffers();

        const commandEncoder = this.device.createCommandEncoder();

        const textureView = this.context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.02, g: 0.02, b: 0.02, a: 1.0 },
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });

        // отрисовка ткани
        renderPass.setPipeline(this.clothPipeline);
        renderPass.setVertexBuffer(0, this.vertexBuffer);
        renderPass.draw(this.vertexCount);

        // отрисовка сетки
        renderPass.setPipeline(this.linePipeline);
        renderPass.setVertexBuffer(0, this.lineVertexBuffer);
        renderPass.draw(this.lineVertexCount);

        // отрисовка маркеров
        renderPass.setPipeline(this.markerPipeline);
        renderPass.setVertexBuffer(0, this.markerVertexBuffer);
        renderPass.draw(this.markerVertexCount);

        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}