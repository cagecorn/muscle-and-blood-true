export class PathfindingEngine {
    static findPath(grid, start, goal) {
        const cols = grid.length;
        const rows = grid[0].length;
        const toKey = (x, y) => `${x},${y}`;

        const open = [];
        const closed = new Set();

        const startNode = {
            x: start.x,
            y: start.y,
            g: 0,
            h: Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y),
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        open.push(startNode);

        const dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            const current = open.shift();

            if (current.x === goal.x && current.y === goal.y) {
                return reconstructPath(current);
            }

            closed.add(toKey(current.x, current.y));

            for (const dir of dirs) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;

                if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
                    continue;
                }
                if (grid[nx][ny] !== 0) {
                    continue;
                }
                const key = toKey(nx, ny);
                if (closed.has(key)) {
                    continue;
                }

                const g = current.g + 1;
                const h = Math.abs(goal.x - nx) + Math.abs(goal.y - ny);
                const node = { x: nx, y: ny, g, h, f: g + h, parent: current };
                const existing = open.find(n => n.x === nx && n.y === ny);
                if (!existing) {
                    open.push(node);
                } else if (g < existing.g) {
                    existing.g = g;
                    existing.f = g + existing.h;
                    existing.parent = current;
                }
            }
        }
        return null;
    }
}

function reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }
    return path;
}
