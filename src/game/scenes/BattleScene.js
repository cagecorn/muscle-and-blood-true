// Reference Phaser via CDN so this scene can load without tooling.
import { Scene } from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { PLAYER } from '../../data/units.js'; // 우리가 만든 유닛 데이터 불러오기

export class BattleScene extends Scene {
    constructor() {
        super('BattleScene');
        
        this.player = null; // 플레이어 객체를 담을 변수
        this.cursors = null; // 키보드 입력 객체를 담을 변수
    }

    create() {
        // 1. 배경 이미지 추가
        this.add.image(512, 384, 'battle-background');

        // 2. 플레이어 생성
        // 물리 엔진이 적용된 스프라이트로 생성하여 움직임을 처리합니다.
        // 'player'는 Preloader에서 지정한 이미지 키입니다.
        this.player = this.physics.add.sprite(512, 384, PLAYER.key);

        // 3. 입력 시스템 초기화
        // Phaser가 기본으로 제공하는 키보드 입력 시스템을 사용합니다.
        // 따로 '인풋 매니저'를 만들 필요가 없습니다.
        this.cursors = this.input.keyboard.createCursorKeys();

        // 4. 월드맵으로 돌아가는 키
        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('WorldMap');
        });
    }

    update(time, delta) {
        // 매 프레임마다 실행되며, 여기서 플레이어의 움직임을 처리합니다.

        // 이전 속도를 초기화하여 키를 뗐을 때 멈추도록 합니다.
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-PLAYER.speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(PLAYER.speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-PLAYER.speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(PLAYER.speed);
        }
    }
}
