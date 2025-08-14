import { Scene } from 'phaser';
import { DungeonManager } from '../../engine/DungeonManager.js';
import { SizingManager } from '../../engine/SizingManager.js';

export class WorldMap extends Scene
{
    constructor ()
    {
        super('WorldMap');

        this.dungeonManager = null;
    }

    create ()
    {
        const TILE_SIZE = SizingManager.TILE_SIZE; // 타일 크기
        const DUNGEON_WIDTH = 50; // 던전의 가로 타일 수
        const DUNGEON_HEIGHT = 50; // 던전의 세로 타일 수

        //  DungeonManager 인스턴스 생성
        this.dungeonManager = new DungeonManager(this, DUNGEON_WIDTH, DUNGEON_HEIGHT, 'wall-tile');

        //  던전 생성 및 렌더링
        this.dungeonManager.generateDungeon();
        this.dungeonManager.renderDungeon(TILE_SIZE);
        
        //  안내 텍스트 추가
        this.add.text(this.scale.width / 2, this.scale.height - 50, '던전이 생성되었습니다. B 키로 전투를 시작하세요.', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        //  카메라 설정
        this.cameras.main.setBounds(0, 0, DUNGEON_WIDTH * TILE_SIZE, DUNGEON_HEIGHT * TILE_SIZE);
        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown)
            {
                return;
            }

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });
        
        // 마우스 휠로 줌 기능 추가
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (deltaY > 0) {
                this.cameras.main.zoom = Math.max(0.5, this.cameras.main.zoom * 0.9);
            } else if (deltaY < 0) {
                this.cameras.main.zoom = Math.min(3, this.cameras.main.zoom * 1.1);
            }
        });

        //  'B' 키를 눌러 전투 씬으로 전환
        this.input.keyboard.on('keydown-B', () => {
            this.scene.start('BattleScene');
        });
    }
}
