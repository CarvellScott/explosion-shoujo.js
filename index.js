window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')

console.log(Phaser);

var tilemap =
[
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
]

var movementVelocity = 200;
var blockSize = 48;
var xBlocks = 15;
var yBlocks = 15;
var bbAdjust = 13;

var game = new Phaser.Game(blockSize * xBlocks, blockSize * yBlocks, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;
var cursors;
var blocks;

function preload() {
	game.load.image('block', 'images/block.png');
	game.load.spritesheet('actor1', 'images/actor1.png', 48, 48);
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	blocks = game.add.group();
	blocks.enableBody = true;

	for (var y = 0; y < yBlocks; y++) {
		for (var x = 0; x < xBlocks; x++) {
			if (tilemap[y][x] == "*") {
				var block = blocks.create(x * blockSize, y * blockSize, 'block');
				block.body.immovable = true;
			}
		}
	}

	player = game.add.sprite(0, 0, 'actor1');
	player.animations.add('up', [9, 10, 11], 5, true);
    player.animations.add('down', [0, 1, 2], 5, true);
    player.animations.add('left', [3, 4, 5], 5, true);
    player.animations.add('right', [6, 7, 8], 5, true);

    player.block = {};

    game.physics.arcade.enable(player);
    player.body.setSize(blockSize - bbAdjust, blockSize - bbAdjust, bbAdjust/2, bbAdjust/2);
    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	game.debug.body(player);

	player.block.x = Math.floor(player.x / blockSize);
	player.block.y = Math.floor(player.y / blockSize);

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

    var hitPlatform = game.physics.arcade.collide(player, blocks);

    if (hitPlatform) {
    	if (player.body.touching.up || player.body.touching.down) {
    		player.body.velocity. y = 0;
    	}
    	if (player.body.touching.left || player.body.touching.right) {
    		player.body.velocity. x = 0;
    	}
    }
}