// 아군을 지원하며 적과 거리를 유지하는 AI
export class HealerAI {
    constructor(owner, allies) {
        this.owner = owner;
        this.allies = allies;
    }

    decideAction(enemy) {
        const ownerPos = this.owner.gridPosition;
        const range = this.owner.stats.range || 1;

        // 치유가 필요한 아군 찾기
        const targets = this.allies.filter(u => u !== this.owner && u.stats.hp < u.stats.maxHp);
        targets.sort((a, b) => a.stats.hp - b.stats.hp);
        const healTarget = targets[0];

        if (healTarget) {
            const hx = healTarget.gridPosition.x - ownerPos.x;
            const hy = healTarget.gridPosition.y - ownerPos.y;
            const healDist = Math.abs(hx) + Math.abs(hy);
            if (healDist <= range) {
                return { type: 'heal', unit: this.owner, target: healTarget };
            }
            let nextX = ownerPos.x;
            let nextY = ownerPos.y;
            if (hx < 0) nextX--; else if (hx > 0) nextX++;
            else if (hy < 0) nextY--; else if (hy > 0) nextY++;
            if (nextX !== ownerPos.x || nextY !== ownerPos.y) {
                return { type: 'move', unit: this.owner, targetPosition: { x: nextX, y: nextY } };
            }
        }

        // 적과의 거리 유지
        if (enemy) {
            const ex = enemy.gridPosition.x - ownerPos.x;
            const ey = enemy.gridPosition.y - ownerPos.y;
            const enemyDist = Math.abs(ex) + Math.abs(ey);
            if (enemyDist < range) {
                let nextX = ownerPos.x;
                let nextY = ownerPos.y;
                if (Math.abs(ex) > Math.abs(ey)) nextX -= Math.sign(ex);
                else nextY -= Math.sign(ey);
                if (nextX !== ownerPos.x || nextY !== ownerPos.y) {
                    return { type: 'move', unit: this.owner, targetPosition: { x: nextX, y: nextY } };
                }
            }
        }
        return null;
    }
}
