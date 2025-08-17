import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { DungeonManager } from '../../engine/DungeonManager.js';
import { SizingManager } from '../../engine/SizingManager.js';
import { Nameplate } from '../Nameplate.js';
import { HealthBar } from '../HealthBar.js';

export class WorldMap extends Scene
{
    constructor ()
    {
        super('WorldMap');
        this.dungeonManager = null;
        this.commander = null;
        this.cursors = null;
        this.tileSize = 0;
        this.isMoving = false;
        this.targetX = null;
        this.targetY = null;
        this.nameplates = [];
        this.healthBars = [];
    }

    create ()
    {
        const DUNGEON_WIDTH = 50;
        const DUNGEON_HEIGHT = 50;

        this.dungeonManager = new DungeonManager(this, DUNGEON_WIDTH, DUNGEON_HEIGHT, 'wall-tile', 'floor-tile');
        const dungeonTiles = this.dungeonManager.generateDungeon();

        const tileTexture = this.textures.get('floor-tile').getSourceImage();
        this.tileSize = tileTexture.width;

        this.dungeonManager.renderDungeon();

        let startX = -1, startY = -1;
        for (let x = 1; x < DUNGEON_WIDTH - 1; x++) {
            for (let y = 1; y < DUNGEON_HEIGHT - 1; y++) {
                if (dungeonTiles[x] && dungeonTiles[x][y] === 0) {
                    startX = x * this.tileSize + this.tileSize / 2;
                    startY = y * this.tileSize + this.tileSize / 2;
                    break;
                }
            }
            if (startX !== -1) {
                break;
            }
        }

        if (startX !== -1 && startY !== -1) {
            // 파티를 하나의 컨테이너에 담아 단일 유닛처럼 이동하게 한다
            const party = this.add.container(startX, startY);

            const baseSize = this.tileSize * SizingManager.WORLD_UNIT_SCALE;
            const leaderSize = this.tileSize * SizingManager.WORLD_LEADER_SCALE;

            // 전사(선봉), 거너, 메딕 순서로 배치
            const gunner = this.add.sprite(-15, -8, 'unit_gunner')
                .setDisplaySize(baseSize, baseSize);
            const medic = this.add.sprite(15, -8, 'unit_medic')
                .setDisplaySize(baseSize, baseSize);
            const warrior = this.add.sprite(0, 8, 'unit_warrior')
                .setDisplaySize(leaderSize, leaderSize);

            party.add([gunner, medic, warrior]);

            // 이름표 및 체력바 생성
            [
                { sprite: gunner, name: '거너' },
                { sprite: medic, name: '메딕' },
                { sprite: warrior, name: '워리어' }
            ].forEach(({ sprite, name }) => {
                const nameplate = new Nameplate(this, sprite, name);
                const healthBar = new HealthBar(this, sprite);
                party.add(nameplate.renderTexture);
                party.add(healthBar.renderTexture);
                this.nameplates.push(nameplate);
                this.healthBars.push(healthBar);
            });

            this.commander = party;

            // 부드러운 카메라 이동 및 확대 설정
            this.cameras.main.startFollow(this.commander, true, 0.08, 0.08);
            this.cameras.main.setZoom(1.5);
        } else {
            console.warn('시작 지점을 찾을 수 없습니다.');
        }
        const info = '던전이 생성되었습니다. 방향키로 이동하세요. B 키로 전투 시작.';
        this.add.text(this.scale.width / 2, this.scale.height - 50, info, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.cameras.main.setBounds(0, 0, DUNGEON_WIDTH * this.tileSize, DUNGEON_HEIGHT * this.tileSize);
        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown)
            {
                return;
            }

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (deltaY > 0) {
                this.cameras.main.zoom = Math.max(0.125, this.cameras.main.zoom * 0.9);
            } else if (deltaY < 0) {
                this.cameras.main.zoom = Math.min(3, this.cameras.main.zoom * 1.1);
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-B', () => {
            this.scene.start('BattleScene');
        });
    }

    update(time, delta) {
        this.nameplates.forEach(np => np.update());
        this.healthBars.forEach(hb => hb.update());

        if (!this.commander || !this.cursors || this.isMoving) {
            return;
        }

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown) {
            moveX = 1;
        } else if (this.cursors.up.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown) {
            moveY = 1;
        }

        if (moveX !== 0 || moveY !== 0) {
            const currentTileX = Math.floor(this.commander.x / this.tileSize);
            const currentTileY = Math.floor(this.commander.y / this.tileSize);

            const nextTileX = currentTileX + moveX;
            const nextTileY = currentTileY + moveY;

            if (this.dungeonManager.getTileAt(nextTileX, nextTileY) === 0) {
                this.isMoving = true;
                this.targetX = nextTileX * this.tileSize + this.tileSize / 2;
                this.targetY = nextTileY * this.tileSize + this.tileSize / 2;

                // 전투 씬과 유사한 빠르고 자연스러운 이동을 위해 Tween 사용
                this.tweens.add({
                    targets: this.commander,
                    x: this.targetX,
                    y: this.targetY,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        this.isMoving = false;
                        this.commander.setPosition(this.targetX, this.targetY);
                    }
                });
            }
        }
    }
}

