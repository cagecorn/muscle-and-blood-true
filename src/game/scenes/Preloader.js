import { Scene } from 'phaser';
import { MapManager } from '../../engine/MapManager.js'; // MapManager를 불러옵니다.

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        // 월드맵 타일을 로드합니다.
        this.load.image('wall-tile', 'images/world-mab/wall-tile-1.png');
        this.load.image('floor-tile', 'images/world-mab/floor-tile-1.png');

        this.load.image('unit_warrior', 'images/unit/warrior.png');

        // MapManager를 사용하여 맵 타일 에셋을 로드합니다.
        MapManager.preload(this);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Start the adventure on the world map instead of the main menu.
        this.scene.start('WorldMap');
    }
}
