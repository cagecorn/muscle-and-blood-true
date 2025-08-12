// AI가 행동을 결정하는 클래스
export class MeleeAI {
    constructor(owner) {
        this.owner = owner; // 이 AI의 주인
    }

    // 어떤 행동을 할지 결정해서 반환
    decideAction(target) {
        const ownerPos = this.owner.gridPosition;
        const targetPos = target.gridPosition;

        let nextX = ownerPos.x;
        let nextY = ownerPos.y;

        // 타겟과의 거리 차이를 기반으로 다음 위치 결정 (간단한 추격 로직)
        if (targetPos.x < ownerPos.x) nextX--;
        else if (targetPos.x > ownerPos.x) nextX++;
        else if (targetPos.y < ownerPos.y) nextY--;
        else if (targetPos.y > ownerPos.y) nextY++;
        
        // 이동할 위치가 현재 위치와 같지 않다면, 이동 행동을 반환
        if (nextX !== ownerPos.x || nextY !== ownerPos.y) {
            return {
                type: 'move',
                unit: this.owner,
                targetPosition: { x: nextX, y: nextY }
            };
        }

        return null; // 움직일 필요가 없으면 아무 행동도 안함
    }
}

