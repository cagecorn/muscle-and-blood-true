import * as Phaser from 'phaser';

// 행동 트리의 기본 노드 상태
const NodeStatus = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    RUNNING: 'RUNNING',
};

// 기본 노드 클래스 (모든 노드들의 부모)
class BehaviorNode {
    execute(owner, target) {
        throw new Error("실행 메소드가 구현되지 않았습니다.");
    }
}

// Sequence 노드: 모든 자식이 성공해야 성공
class Sequence extends BehaviorNode {
    constructor(nodes) {
        super();
        this.nodes = nodes;
    }

    execute(owner, target) {
        for (const node of this.nodes) {
            if (node.execute(owner, target) === NodeStatus.FAILURE) {
                return NodeStatus.FAILURE;
            }
        }
        return NodeStatus.SUCCESS;
    }
}

// --- AI를 위한 실제 노드들 ---

// 조건 노드: 플레이어가 추격 범위 안에 있는지 확인
class IsPlayerInChaseRange extends BehaviorNode {
    constructor(range) {
        super();
        this.range = range;
    }

    execute(owner, target) {
        // owner(적)와 target(플레이어) 사이의 거리를 계산
        const distance = Phaser.Math.Distance.Between(owner.x, owner.y, target.x, target.y);
        
        if (distance <= this.range) {
            console.log('플레이어 발견! 추격 시작.');
            return NodeStatus.SUCCESS; // 범위 안이면 성공
        }
        return NodeStatus.FAILURE; // 범위 밖이면 실패
    }
}

// 행동 노드: 플레이어를 향해 이동
class MoveToPlayer extends BehaviorNode {
    execute(owner, target) {
        // 물리 엔진을 사용하여 target(플레이어) 방향으로 owner(적)를 이동시킴
        // owner.scene은 현재 씬(BattleScene)에 접근하기 위함입니다.
        owner.scene.physics.moveToObject(owner, target, owner.stats.speed);
        return NodeStatus.SUCCESS;
    }
}

// 행동 노드: 정지
class StopMovement extends BehaviorNode {
    execute(owner) {
        owner.setVelocity(0, 0);
        return NodeStatus.SUCCESS;
    }
}


// --- 실제 MeleeAI 클래스 ---
export class MeleeAI {
    constructor(owner, target) {
        this.owner = owner;   // 이 AI를 사용하는 적 캐릭터
        this.target = target; // 공격 대상 (플레이어)
        
        // AI의 행동 트리 구조를 정의합니다.
        this.root = new Sequence([
            new IsPlayerInChaseRange(300), // 300픽셀 범위 안에 들어오면
            new MoveToPlayer()             // 플레이어를 향해 이동한다
        ]);

        // 추격 범위 밖에 있을 때를 위한 대체 행동
        this.idleBehavior = new StopMovement();
    }

    update() {
        // 매 프레임마다 행동 트리의 최상단(root)부터 실행
        const result = this.root.execute(this.owner, this.target);

        // 만약 행동 트리가 실패했다면 (플레이어가 범위 밖에 있다면)
        if (result === NodeStatus.FAILURE) {
            this.idleBehavior.execute(this.owner); // 정지 행동을 실행
        }
    }
}
