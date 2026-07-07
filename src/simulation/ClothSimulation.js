export class ClothSimulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.points = [];
        this.time = 0;

        this.driverX = Math.floor(width / 2);
        this.driverY = Math.floor(height / 2);

        this.gravityEnabled = false;

        for (let y = 0; y <= height; y++) {
            for (let x = 0; x <= width; x++) {
                this.points.push({
                    position: [x, y, 0],
                    previousPosition: [x, y, 0],
                    pinned:
                        (x === 0 && y === 0) ||
                        (x === width && y === 0) ||
                        (x === 0 && y === height) ||
                        (x === width && y === height),
                    driven: x === this.driverX && y === this.driverY,
                });
            }
        }
    }

    index(x, y) {
        return y * (this.width + 1) + x;
    }

    update(deltaTime) {
        this.time += deltaTime;

        for (const point of this.points) {
            if (point.pinned || point.driven) {
                continue;
            }

            const x = point.position[0];
            const y = point.position[1];
            const z = point.position[2];

            const prevX = point.previousPosition[0];
            const prevY = point.previousPosition[1];
            const prevZ = point.previousPosition[2];

            const velocityX = (x - prevX) * 0.995;
            const velocityY = (y - prevY) * 0.995;
            const velocityZ = (z - prevZ) * 0.995;

            point.previousPosition = [x, y, z];

            point.position[0] = x + velocityX;
            point.position[1] = y + velocityY;
            point.position[2] = z + velocityZ;

            if (this.gravityEnabled) {
                point.position[2] -= 8.0 * deltaTime * deltaTime;
            }
        }

        this.updateDrivenPoint();

        for (let i = 0; i < 12; i++) {
            this.satisfyConstraints();
            this.updateDrivenPoint();
        }
    }

    updateDrivenPoint() {
        const point = this.points[this.index(this.driverX, this.driverY)];

        const amplitude = 1.2;
        const frequency = 2.0;

        const z = amplitude * Math.sin(this.time * frequency);

        point.position[0] = this.driverX;
        point.position[1] = this.driverY;
        point.position[2] = z;

        point.previousPosition[0] = point.position[0];
        point.previousPosition[1] = point.position[1];
        point.previousPosition[2] = point.position[2];
    }

    satisfyConstraints() {
        const applyConstraint = (p1, p2, restLength) => {
            const dx = p2.position[0] - p1.position[0];
            const dy = p2.position[1] - p1.position[1];
            const dz = p2.position[2] - p1.position[2];

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance === 0) return;

            const difference = (distance - restLength) / distance;

            const offsetX = dx * 0.5 * difference;
            const offsetY = dy * 0.5 * difference;
            const offsetZ = dz * 0.5 * difference;

            if (!p1.pinned && !p1.driven) {
                p1.position[0] += offsetX;
                p1.position[1] += offsetY;
                p1.position[2] += offsetZ;
            }

            if (!p2.pinned && !p2.driven) {
                p2.position[0] -= offsetX;
                p2.position[1] -= offsetY;
                p2.position[2] -= offsetZ;
            }
        };

        for (let y = 0; y <= this.height; y++) {
            for (let x = 0; x <= this.width; x++) {
                const current = this.points[this.index(x, y)];

                if (x < this.width) {
                    applyConstraint(current, this.points[this.index(x + 1, y)], 1);
                }

                if (y < this.height) {
                    applyConstraint(current, this.points[this.index(x, y + 1)], 1);
                }

                if (x < this.width && y < this.height) {
                    applyConstraint(current, this.points[this.index(x + 1, y + 1)], Math.sqrt(2));
                }

                if (x > 0 && y < this.height) {
                    applyConstraint(current, this.points[this.index(x - 1, y + 1)], Math.sqrt(2));
                }
            }
        }
    }
}