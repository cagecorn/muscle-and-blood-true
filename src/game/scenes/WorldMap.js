import { Scene } from 'phaser';
import { DungeonManager } from '../../engine/DungeonManager.js';
import { Nameplate } from '../Nameplate.js';
import { HealthBar } from '../HealthBar.js';
import { WorldEntity } from '../WorldEntity.js';
import { WorldEnemy } from '../WorldEnemy.js';

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
        this.enemies = [];
        this.playerEntity = null;
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
            const container = this.add.container(startX, startY);
            const warrior = this.add.sprite(0, 0, 'unit_warrior')
                .setDisplaySize(this.tileSize, this.tileSize);
            container.add(warrior);

            const nameplate = new Nameplate(this, warrior, '워리어');
            const healthBar = new HealthBar(this, warrior);
            container.add(nameplate.renderTexture);
            container.add(healthBar.renderTexture);
            this.nameplates.push(nameplate);
            this.healthBars.push(healthBar);

            this.commander = container;
            this.playerEntity = new WorldEntity(this, container, this.tileSize);

            this.spawnEnemies();

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

    spawnEnemies() {
        const playerPos = this.playerEntity.getGridPosition();
        const x = playerPos.x + 5;
        const y = playerPos.y;
        if (this.dungeonManager.getTileAt(x, y) === 0) {
            const enemy = new WorldEnemy(this, x, y, 'unit_warrior', '적 워리어', this.tileSize);
            this.enemies.push(enemy);
            this.nameplates.push(enemy.nameplate);
            this.healthBars.push(enemy.healthBar);
        }
    }

    processEnemyTurn() {
        this.enemies.forEach(enemy => {
            const action = enemy.ai.decideAction(this.playerEntity);
            if (action && action.type === 'move') {
                enemy.moveToTile(action.targetPosition.x, action.targetPosition.y);
            }
        });
    }

    update(time, delta) {
        this.nameplates.forEach(np => np.update());
        this.healthBars.forEach(hb => hb.update());
        this.enemies.forEach(e => e.update());

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
                        this.processEnemyTurn();
                    }
                });
            }
        }
    }
}

