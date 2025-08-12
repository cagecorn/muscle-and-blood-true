export const TurnState = {
    PLAYER_INPUT: 'PLAYER_INPUT', // 플레이어의 입력을 기다리는 상태
    PROCESSING: 'PROCESSING',     // 유닛들의 행동이 진행 중인 상태
};

export class TurnManager {
    constructor(scene) {
        this.scene = scene;
        this.state = TurnState.PLAYER_INPUT;
        this.actionQueue = []; // 실행할 행동들을 담는 큐
    }

    // 플레이어가 행동을 결정했을 때 호출
    playerAction(action) {
        if (this.state === TurnState.PLAYER_INPUT) {
            this.actionQueue.push(action);
            this.state = TurnState.PROCESSING; // 처리 상태로 변경
            console.log("플레이어 행동 접수. 처리 시작...");
            this.processQueue();
        }
    }

    // 큐에 쌓인 행동들을 순차적으로 처리
    async processQueue() {
        // 현재 씬의 모든 유닛이 행동을 결정하게 함 (AI)
        this.scene.enemies.forEach(enemy => {
            if (enemy.ai) {
                const enemyAction = enemy.ai.decideAction(this.scene.player);
                if (enemyAction) {
                    this.actionQueue.push(enemyAction);
                }
            }
        });

        // 큐에 있는 모든 행동이 끝날 때까지 기다림
        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift(); // 큐에서 행동 하나를 꺼냄
            await action.unit.executeAction(action); // 행동이 끝날 때까지 대기
        }

        console.log("모든 행동 처리 완료. 플레이어 입력 대기.");
        this.state = TurnState.PLAYER_INPUT; // 다시 플레이어 입력 대기 상태로
    }
}

