import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { CombatEngine } from '../../engine/CombatEngine.js';
import { Unit } from '../Unit.js';
import { MeleeAI } from '../../ai/meleeAI.js';

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.player = null;
        this.enemy = null;
        this.cursors = null;
    }

    create() {
        this.add.image(512, 384, 'battle-background');

        // Unit 클래스를 사용하여 플레이어와 적을 생성합니다.
        this.player = new Unit(this, 200, 384, UNITS.WARRIOR);
        this.enemy = new Unit(this, 824, 384, UNITS.WARRIOR);
        this.enemy.setFlipX(true);

        // AI 설정
        this.enemy.ai = new MeleeAI(this.enemy, this.player);

        // 충돌 설정: 플레이어와 적이 부딪히면 handleCollision 함수를 호출
        this.physics.add.collider(this.player, this.enemy, this.handleCollision, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // 카메라 설정 (기존과 동일)
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.input.on('pointermove', (p) => {
            if (p.isDown) {
                this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
            }
        });
        this.input.on('wheel', (p, go, dx, dy) => {
            const cam = this.cameras.main;
            if (dy > 0) cam.zoom = Math.max(0.5, cam.zoom - 0.1);
            else cam.zoom = Math.min(1.5, cam.zoom + 0.1);
        });
        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('WorldMap');
        });
    }

    // 유닛들이 충돌했을 때 실행될 함수
    handleCollision(unit1, unit2) {
        const now = this.time.now;

        if (now > unit1.lastAttackTime + unit1.stats.attackSpeed) {
            const damage = CombatEngine.calculateDamage(unit1.stats, unit2.stats);
            unit2.takeDamage(damage);
            unit1.lastAttackTime = now;
        }

        if (now > unit2.lastAttackTime + unit2.stats.attackSpeed) {
            const damage = CombatEngine.calculateDamage(unit2.stats, unit1.stats);
            unit1.takeDamage(damage);
            unit2.lastAttackTime = now;
        }
    }

    update(time, delta) {
        // 플레이어 움직임
        const speed = this.player.stats.speed;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        // 적 AI 업데이트
        if (this.enemy && this.enemy.ai) {
            this.enemy.ai.update();
        }
    }
}

