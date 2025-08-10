import { Physics } from 'phaser';

export class Unit extends Physics.Arcade.Sprite {
    constructor(scene, x, y, unitData) {
        // 부모 클래스(Sprite) 생성자 호출
        super(scene, x, y, unitData.key);

        // 1. 씬에 물리 객체로 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 2. 유닛 데이터와 스탯 설정
        this.stats = { ...unitData }; // 원본 데이터를 복사하여 사용
        this.lastAttackTime = 0; // 마지막 공격 시간

        // 3. 체력바 생성 (VFX + 바인딩)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar(); // 체력바 초기화

        // 4. 레이어 설정
        this.setDepth(1);
        this.healthBar.setDepth(2);
    }

    // 체력이 변할 때마다 체력바를 다시 그리는 함수
    updateHealthBar() {
        this.healthBar.clear();
        // 체력바 배경
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-25, -40, 50, 8);
        // 실제 체력
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(-25, -40, 50 * (this.stats.hp / 100), 8);
    }

    // 데미지를 받는 함수
    takeDamage(damage) {
        this.stats.hp -= damage;
        if (this.stats.hp < 0) this.stats.hp = 0;

        console.log(`${this.stats.name}이(가) ${damage}의 데미지를 입었습니다. 남은 체력: ${this.stats.hp}`);
        this.updateHealthBar();

        // 5. 피격 시 붉은색 점멸 효과 (VFX)
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });
    }

    // preUpdate는 씬의 update가 실행되기 전에 매 프레임 자동으로 실행됩니다.
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // 체력바가 유닛을 따라다니도록 위치를 계속 업데이트합니다 (바인딩)
        this.healthBar.setPosition(this.x, this.y);
    }
}

