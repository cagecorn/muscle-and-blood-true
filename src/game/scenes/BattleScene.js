import { Scene } from 'phaser';
import { UNITS } from '../../data/units.js';
import { MeleeAI } from '../../ai/meleeAI.js'; // 우리가 만든 AI 클래스 불러오기

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        this.player = null;
        this.enemy = null;
        this.enemyAI = null; // 적군 AI 인스턴스를 담을 변수
        this.cursors = null;
    }

    create() {
        this.add.image(512, 384, 'battle-background');

        this.player = this.physics.add.sprite(200, 384, UNITS.WARRIOR.key);
        this.enemy = this.physics.add.sprite(824, 384, UNITS.WARRIOR.key);
        this.enemy.setFlipX(true);
        
        // 적 캐릭터의 스탯을 데이터에서 직접 가져와 설정합니다.
        // 나중에 캐릭터마다 다른 AI나 스탯을 적용하기 용이합니다.
        this.enemy.speed = UNITS.WARRIOR.speed;

        // 적 AI를 생성하고, 주인(enemy)과 목표(player)를 알려줍니다.
        this.enemyAI = new MeleeAI(this.enemy, this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('WorldMap');
        });
    }

    update(time, delta) {
        // 1. 플레이어 움직임 처리
        const speed = UNITS.WARRIOR.speed;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

        // 2. 적 AI 업데이트
        // 매 프레임 AI의 update()를 호출하여 스스로 판단하고 행동하게 합니다.
        if (this.enemyAI) {
            this.enemyAI.update();
        }
    }
}
