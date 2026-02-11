import Phaser from 'phaser'

import MainGame from './Game'
import PreloaderScene from './Preloader';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1920,
	parent: 'phaser-example',
	backgroundColor: '#ffffff',
    scene: [PreloaderScene,MainGame],
	scale: {
		mode: Phaser.Scale.SHOW_ALL,  
        
        
	}   
}

export default new Phaser.Game(config)
