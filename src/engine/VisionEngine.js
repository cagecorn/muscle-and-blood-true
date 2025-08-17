export class VisionEngine {
    static hasLineOfSight(grid, start, end, radius = 10) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (Math.sqrt(dx * dx + dy * dy) > radius) {
            return false;
        }
        const line = bresenham(start.x, start.y, end.x, end.y);
        for (let i = 1; i < line.length - 1; i++) {
            const { x, y } = line[i];
            if (grid[x] && grid[x][y] === 1) {
                return false;
            }
        }
        return true;
    }

    static computeFOV(grid, origin, radius) {
        const visible = [];
        for (let x = origin.x - radius; x <= origin.x + radius; x++) {
            for (let y = origin.y - radius; y <= origin.y + radius; y++) {
                if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) {
                    continue;
                }
                if (this.hasLineOfSight(grid, origin, { x, y }, radius)) {
                    visible.push({ x, y });
                }
            }
        }
        return visible;
    }
}

function bresenham(x0, y0, x1, y1) {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
        points.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
    return points;
}
