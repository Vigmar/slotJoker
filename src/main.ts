import Phaser from 'phaser'

import MainGame from './Game'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
	parent: 'phaser-example',
	backgroundColor: '#ffffff',
    scene: [MainGame],
	scale: {
		mode: Phaser.Scale.RESIZE,  
        autoCenter: Phaser.Scale.CENTER_BOTH,
        
	}   
}

export default new Phaser.Game(config)
