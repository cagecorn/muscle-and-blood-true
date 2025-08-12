import { GameObjects, Scene } from 'phaser';
import { SizingManager } from '../engine/SizingManager.js';

// 유닛의 이름표를 관리하는 클래스
export class Nameplate {
    /**
     * @param {Scene} scene - 현재 씬
     * @param {import('./Unit.js').Unit} owner - 이 이름표의 주인인 유닛
     * @param {string} text - 표시할 이름
     */
    constructor(scene, owner, text) {
        this.scene = scene;
        this.owner = owner;
        this.text = text;

        // 1. 고해상도 텍스트 생성 (화면에는 아직 보이지 않음)
        // SizingManager에서 폰트 크기를 가져와 선명도를 유지합니다.
        const tempText = scene.add.text(0, 0, this.text, {
            fontFamily: 'Arial Black',
            fontSize: `${SizingManager.NAMEPLATE_FONT_SIZE}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 2. 오프스크린 렌더 텍스처 생성
        // 텍스트 크기의 2배로 렌더 텍스처를 만듭니다.
        this.renderTexture = scene.add.renderTexture(0, 0, tempText.width * 2, tempText.height * 2);
        
        // 3. 렌더 텍스처에 텍스트 그리기
        this.renderTexture.draw(tempText, tempText.width, tempText.height);

        // 4. 고해상도 텍스처를 절반으로 축소하여 선명하게 표시
        this.renderTexture.setScale(0.5);
        this.renderTexture.setDepth(3); // 체력바보다 위에 보이도록 설정

        // 임시로 사용한 텍스트 객체는 파괴합니다.
        tempText.destroy();
    }

    // 이름표의 위치를 주인(유닛)을 따라가도록 업데이트
    update() {
        this.renderTexture.setPosition(this.owner.x, this.owner.y + SizingManager.NAMEPLATE_Y_OFFSET);
    }

    // 유닛이 파괴될 때 이름표도 함께 파괴
    destroy() {
        this.renderTexture.destroy();
    }
}
