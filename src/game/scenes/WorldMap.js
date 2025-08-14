import { Scene } from 'phaser';
import { DungeonManager } from '../../engine/DungeonManager.js';
import { SizingManager } from '../../engine/SizingManager.js';

export class WorldMap extends Scene
{
    constructor ()
    {
        super('WorldMap');
        this.dungeonManager = null;
        this.commander = null;
        this.cursors = null;
        this.tileSize = SizingManager.TILE_SIZE;
    }

    create ()
    {
        const DUNGEON_WIDTH = 50;
        const DUNGEON_HEIGHT = 50;

        this.dungeonManager = new DungeonManager(this, DUNGEON_WIDTH, DUNGEON_HEIGHT, 'wall-tile', 'floor-tile');
        const dungeonTiles = this.dungeonManager.generateDungeon();
        this.dungeonManager.renderDungeon(this.tileSize);

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
            this.commander = this.add.sprite(startX, startY, 'unit_warrior').setOrigin(0.5);
            this.cameras.main.startFollow(this.commander);
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
                this.cameras.main.zoom = Math.max(0.5, this.cameras.main.zoom * 0.9);
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
        if (!this.commander || !this.cursors) {
            return;
        }

        const speed = this.tileSize * delta / 1000;
        const prevX = this.commander.x;
        const prevY = this.commander.y;

        if (this.cursors.left.isDown) {
            this.commander.x -= speed;
        } else if (this.cursors.right.isDown) {
            this.commander.x += speed;
        } else if (this.cursors.up.isDown) {
            this.commander.y -= speed;
        } else if (this.cursors.down.isDown) {
            this.commander.y += speed;
        }

        const tileX = Math.floor(this.commander.x / this.tileSize);
        const tileY = Math.floor(this.commander.y / this.tileSize);

        if (this.dungeonManager.getTileAt(tileX, tileY) === 1) {
            this.commander.x = prevX;
            this.commander.y = prevY;
        }
    }
}

