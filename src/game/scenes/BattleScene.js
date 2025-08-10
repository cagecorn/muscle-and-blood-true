import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { MeleeAI } from '../../ai/meleeAI.js';

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.player = null;
        this.enemy = null;
        this.enemyAI = null;
        this.cursors = null;
    }

    create() {
        // 1. 배경 및 유닛 생성 (이전과 동일)
        this.add.image(512, 384, 'battle-background');
        this.player = this.physics.add.sprite(200, 384, UNITS.WARRIOR.key);
        this.enemy = this.physics.add.sprite(824, 384, UNITS.WARRIOR.key);
        this.enemy.setFlipX(true);
        this.enemy.speed = UNITS.WARRIOR.speed;
        this.enemyAI = new MeleeAI(this.enemy, this.player);
        this.cursors = this.input.keyboard.createCursorKeys();

        // === 카메라 엔진 기능 추가 시작 ===

        // 2. 카메라 경계 설정
        // 게임 월드의 전체 크기를 1600x1200으로 설정합니다.
        // 이제 카메라는 이 경계 안에서만 움직일 수 있습니다.
        this.cameras.main.setBounds(0, 0, 1600, 1200);

        // 3. 카메라 드래그 기능 구현
        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            const cam = this.cameras.main;
            cam.scrollX -= (pointer.x - pointer.prevPosition.x) / cam.zoom;
            cam.scrollY -= (pointer.y - pointer.prevPosition.y) / cam.zoom;
        });

        // 4. 카메라 줌 기능 구현 (마우스 휠)
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const cam = this.cameras.main;
            if (deltaY > 0) {
                // 휠을 아래로 내리면 축소 (zoom out)
                cam.zoom = Math.max(0.5, cam.zoom - 0.1);
            } else {
                // 휠을 위로 올리면 확대 (zoom in)
                cam.zoom = Math.min(1.5, cam.zoom + 0.1);
            }
        });

        // === 카메라 엔진 기능 추가 끝 ===

        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('WorldMap');
        });
    }

    update(time, delta) {
        // 플레이어 및 AI 업데이트 로직 (이전과 동일)
        const speed = UNITS.WARRIOR.speed;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        if (this.enemyAI) {
            this.enemyAI.update();
        }
    }
}

