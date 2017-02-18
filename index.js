window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')

console.log(Phaser);

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;
var movementVelocity = 200;
var cursors;


function preload() {
	game.load.image('miku', 'images/miku.png');
	game.load.spritesheet('actor1', 'images/actor1.png', 48, 48);
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	player = game.add.sprite(0, 0, 'actor1');
	player.animations.add('up', [9, 10, 11], 5, true);
    player.animations.add('down', [0, 1, 2], 5, true);
    player.animations.add('left', [3, 4, 5], 5, true);
    player.animations.add('right', [6, 7, 8], 5, true);

    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	//  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -movementVelocity;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = movementVelocity;

        player.animations.play('right');
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = movementVelocity;

        player.animations.play('down');
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -movementVelocity;

        player.animations.play('up');
    }
    else
    {
        //  Stand still
        player.animations.stop();
    }
}