// Генератор статической сетки ткани
// Использовался на раннем этапе разработки для проверки рендеринга
export class ClothMesh {
    constructor(size = 1.2, segments = 10) {

        // Размер сетки
        this.size = size;

        // Количество разбиений по каждой оси
        this.segments = segments;
    }

    // Создаёт треугольную сетку в виде списка вершин
    // Формат вершины: position.xy + color.rgb
    generateVertices() {
        const vertices = [];
        const step = this.size / this.segments;
        const start = -this.size / 2;

        for (let y = 0; y < this.segments; y++) {
            for (let x = 0; x < this.segments; x++) {
                const x0 = start + x * step;
                const y0 = start + y * step;
                const x1 = x0 + step;
                const y1 = y0 + step;

                this.addTriangle(vertices, x0, y0, x1, y0, x0, y1);
                this.addTriangle(vertices, x1, y0, x1, y1, x0, y1);
            }
        }

        return new Float32Array(vertices);
    }

    // Создаёт набор линий для отображения каркаса сетки
    generateWireframeVertices() {
        const vertices = [];
        const step = this.size / this.segments;
        const start = -this.size / 2;

        for (let y = 0; y <= this.segments; y++) {
            for (let x = 0; x < this.segments; x++) {
                const x0 = start + x * step;
                const x1 = x0 + step;
                const yy = start + y * step;

                this.addLine(vertices, x0, yy, x1, yy);
            }
        }

        for (let x = 0; x <= this.segments; x++) {
            for (let y = 0; y < this.segments; y++) {
                const y0 = start + y * step;
                const y1 = y0 + step;
                const xx = start + x * step;

                this.addLine(vertices, xx, y0, xx, y1);
            }
        }

        for (let y = 0; y < this.segments; y++) {
            for (let x = 0; x < this.segments; x++) {
                const x0 = start + x * step;
                const y0 = start + y * step;
                const x1 = x0 + step;
                const y1 = y0 + step;

                this.addLine(vertices, x1, y0, x0, y1);
            }
        }

        return new Float32Array(vertices);
    }

    addLine(vertices, x0, y0, x1, y1) {
        this.addVertex(vertices, x0, y0);
        this.addVertex(vertices, x1, y1);
    }

    addTriangle(vertices, x0, y0, x1, y1, x2, y2) {
        this.addVertex(vertices, x0, y0);
        this.addVertex(vertices, x1, y1);
        this.addVertex(vertices, x2, y2);
    }

    addVertex(vertices, x, y) {
        vertices.push(
            x, y,
            0.65, 0.65, 0.75
        );
    }
}