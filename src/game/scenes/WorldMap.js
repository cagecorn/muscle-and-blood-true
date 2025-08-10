import { Scene } from 'phaser';

export class WorldMap extends Scene
{
    constructor ()
    {
        super('WorldMap');
    }

    preload ()
    {
        //  Preload assets required for the world map scene here.
        //  Example: this.load.image('world-map-background', 'assets/images/territory/cursed-forest.png');
    }

    create ()
    {
        //  실제 월드맵 배경을 화면에 표시합니다.
        this.add.image(0, 0, 'world-map-background').setOrigin(0);

        //  전투로 들어가는 방법을 안내하는 텍스트를 추가합니다.
        this.add.text(512, 700, '\uC774\uB3D9 \uD0A4\uC785\uB2C8\uB2E4. B \uD0A4\uB85C \uC804\uD22C\uB97C \uC2DC\uC791\uD558\uC138\uC694.', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        //  Enable dragging the camera around the map.
        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown)
            {
                return;
            }

            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        });

        //  Pressing the 'B' key switches to the battle scene.
        this.input.keyboard.on('keydown-B', () => {
            this.scene.start('BattleScene');
        });
    }

    update (time, delta)
    {
        //  Handle world map logic that needs to run each frame here.
    }
}
