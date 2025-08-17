import { Physics } from 'phaser';
import { Nameplate } from './Nameplate.js';
import { SizingManager } from '../engine/SizingManager.js';

export class Unit extends Physics.Arcade.Sprite {
    constructor(scene, gridX, gridY, unitData, name, options = {}) {
        const { scale = 1 } = options;

        // 그리드 좌표를 실제 화면 좌표로 변환하여 생성
        const worldPos = scene.grid.getWorldPosition(gridX, gridY);
        super(scene, worldPos.x, worldPos.y, unitData.key);

        // --- 유닛의 그리드 위치 저장 ---
        this.gridPosition = { x: gridX, y: gridY };

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // SizingManager에서 정의한 TILE_SIZE와 스케일에 맞게 유닛의 표시 크기를 조절
        this.setDisplaySize(
            SizingManager.TILE_SIZE * scale,
            SizingManager.TILE_SIZE * scale
        );

        this.stats = { ...unitData };
        this.nameplate = new Nameplate(scene, this, name);
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

        this.setDepth(1);
        this.healthBar.setDepth(2);
        this.nameplate.renderTexture.setDepth(3);
    }

    // 유닛이 행동을 실행하는 함수
    executeAction(action) {
        return new Promise(resolve => {
            if (action.type === 'move') {
                this.moveToTile(action.targetPosition.x, action.targetPosition.y, resolve);
            }
            // 나중에 'attack' 등 다른 행동 타입 추가 가능
        });
    }
    
    // 목표 타일까지 부드럽게 이동하는 함수 (애니메이션)
    moveToTile(gridX, gridY, onComplete) {
        this.gridPosition = { x: gridX, y: gridY };
        const targetPos = this.scene.grid.getWorldPosition(gridX, gridY);

        // Phaser의 Tween 기능을 사용하여 애니메이션 생성
        this.scene.tweens.add({
            targets: this,
            x: targetPos.x,
            y: targetPos.y,
            duration: 200, // 0.2초 동안 이동
            ease: 'Power2',
            onComplete: () => {
                if (onComplete) {
                    onComplete(); // 애니메이션이 끝나면 Promise를 resolve
                }
            }
        });
    }

    // preUpdate에서 이름표, 체력바 위치 업데이트
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        const interpolatedPos = this.getCenter();
        const topY = interpolatedPos.y - this.displayHeight / 2;

        this.healthBar.setPosition(
            interpolatedPos.x,
            topY + SizingManager.HEALTHBAR_Y_OFFSET
        );

        if (this.nameplate) {
            this.nameplate.update();
        }
    }

    updateHealthBar() {
        const hbWidth = SizingManager.HEALTHBAR_WIDTH;
        const hbHeight = SizingManager.HEALTHBAR_HEIGHT;

        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-hbWidth / 2, 0, hbWidth, hbHeight);
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(
            -hbWidth / 2,
            0,
            hbWidth * (this.stats.hp / 100),
            hbHeight
        );
    }

    takeDamage(damage) {
        this.stats.hp -= damage;
        if (this.stats.hp < 0) {
            this.stats.hp = 0;
        }
        console.log(`${this.nameplate.text} ${damage} 데미지, 체력: ${this.stats.hp}`);
        this.updateHealthBar();
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });
    }

    destroy(fromScene) {
        if (this.nameplate) this.nameplate.destroy();
        this.healthBar.destroy();
        super.destroy(fromScene);
    }
}

