// 원거리 유닛이 거리를 유지하며 공격하는 AI
export class RangedAI {
    constructor(owner) {
        this.owner = owner;
    }

    decideAction(target) {
        const ownerPos = this.owner.gridPosition;
        const targetPos = target.gridPosition;
        const dx = targetPos.x - ownerPos.x;
        const dy = targetPos.y - ownerPos.y;
        const distance = Math.abs(dx) + Math.abs(dy);
        const range = this.owner.stats.range || 1;

        if (distance === range) {
            return {
                type: 'attack',
                unit: this.owner,
                target
            };
        }

        let nextX = ownerPos.x;
        let nextY = ownerPos.y;

        if (distance > range) {
            if (dx < 0) nextX--;
            else if (dx > 0) nextX++;
            else if (dy < 0) nextY--;
            else if (dy > 0) nextY++;
        } else {
            if (Math.abs(dx) > Math.abs(dy)) nextX -= Math.sign(dx);
            else nextY -= Math.sign(dy);
        }

        if (nextX !== ownerPos.x || nextY !== ownerPos.y) {
            return {
                type: 'move',
                unit: this.owner,
                targetPosition: { x: nextX, y: nextY }
            };
        }

        return null;
    }
}
