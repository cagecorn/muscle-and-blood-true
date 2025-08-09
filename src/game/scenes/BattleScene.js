import { Scene } from 'phaser';

export class BattleScene extends Scene
{
    constructor ()
    {
        super('BattleScene');
    }

    preload ()
    {
        //  Preload battle scene assets here.
        //  Example: this.load.image('battle-background', 'assets/images/battle/battle-stage-arena.png');
    }

    create ()
    {
        //  Add the battle background image.
        //  this.add.image(512, 384, 'battle-background');

        this.add.text(512, 384, '\uC5EC\uAE30\uB294 \uC804\uD22C \uC2E4\uD5D8\uC785\uB2C8\uB2E4.', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        //  Pressing the 'M' key returns to the world map.
        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('WorldMap');
        });
    }

    update (time, delta)
    {
        //  Implement core battle logic that needs to run each frame here.
    }
}
