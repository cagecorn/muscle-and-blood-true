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
        //  Add the world map background to the scene.
        //  this.add.image(0, 0, 'world-map-background').setOrigin(0);

        this.add.text(512, 384, '\uC5EC\uAE30\uB294 \uC6D4\uB4DC\uB9F5\uC785\uB2C8\uB2E4.', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
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
