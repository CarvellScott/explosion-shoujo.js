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
	[" ", " ", "#", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", "#", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", "#", "#", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", "#", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", "#", "#", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
	[" ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " ", "*", " "],
	[" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
]

var MOVEMENT_VELOCITY = 200;
var ALLOWED_DISTANCE = 15;
var BB_ADJUST = 0;
var blockSize = 48;
var xBlocks = 15;
var yBlocks = 15;

var game = new Phaser.Game(blockSize * xBlocks, blockSize * yBlocks, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;
var cursors;
var blocks;

function preload() {
	game.load.image('block', 'images/block.png');
	game.load.image('break', 'images/breakable.png');
	game.load.spritesheet('actor1', 'images/actor4.png', 48, 48);
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	player = game.add.sprite(0, 0, 'actor1');
	blocks = game.add.group();


	blocks.enableBody = true;

	for (var y = 0; y < yBlocks; y++) {
		for (var x = 0; x < xBlocks; x++) {
			if (tilemap[y][x] == "*") {
				var block = blocks.create(x * blockSize, y * blockSize, 'block');
				block.body.immovable = true;
			} else 	if (tilemap[y][x] == "#") {
				var block = blocks.create(x * blockSize, y * blockSize, 'break');
				block.body.immovable = true;
			}
		}
	}

	player.animations.add('up', [9, 10, 11], 5, true);
    player.animations.add('down', [0, 1, 2], 5, true);
    player.animations.add('left', [3, 4, 5], 5, true);
    player.animations.add('right', [6, 7, 8], 5, true);

    player.block = {};
    player.center = {};

    game.physics.arcade.enable(player);
    player.body.setSize(blockSize - BB_ADJUST, blockSize - BB_ADJUST, BB_ADJUST/2, BB_ADJUST/2);
    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	//game.debug.body(player);

	player.center.x = player.x + blockSize/2;
	player.center.y = player.y + blockSize/2;

	player.block.x = Math.floor(player.center.x / blockSize);
	player.block.y = Math.floor(player.center.y / blockSize);

	//  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -MOVEMENT_VELOCITY;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = MOVEMENT_VELOCITY;

        player.animations.play('right');
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = MOVEMENT_VELOCITY;

        player.animations.play('down');
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -MOVEMENT_VELOCITY;

        player.animations.play('up');
    }
    else
    {
        //  Stand still
        player.animations.stop();
    }

    var hitPlatform = game.physics.arcade.collide(player, blocks);

    if (hitPlatform) {
		var delta = findDeltaFromPassing();

		var distance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));

		if (distance <= ALLOWED_DISTANCE) {
			adjustToCurrentBlock();
		}
    }
}

function adjustToCurrentBlock() {
	console.log("ADUJUSTING");
	player.x = player.block.x * blockSize;
	player.y = player.block.y * blockSize;
}

function findDeltaFromPassing() {
	var idealBlock = {center: {}};
	idealBlock.center.x = (player.block.x * blockSize) + blockSize/2;
	idealBlock.center.y = (player.block.y * blockSize) + blockSize/2;

	var delta = {};
	delta.x = Math.abs(player.center.x - idealBlock.center.x);
	delta.y = Math.abs(player.center.y - idealBlock.center.y);

	return delta;
}

function isAdjacentBlockPassable() {
	adjacentBlock = {};
	if (player.body.touching.up) {
		adjacentBlock.x = player.block.x;
		adjacentBlock.y = player.block.y - 1;
	} else if (player.body.touching.down) {
		adjacentBlock.x = player.block.x;
		adjacentBlock.y = player.block.y + 1;
	} else if (player.body.touching.left) {
		adjacentBlock.x = player.block.x - 1;
		adjacentBlock.y = player.block.y;
	} else if (player.body.touching.right) {
		adjacentBlock.x = player.block.x + 1;
		adjacentBlock.y = player.block.y;
	}

	if (tilemap[adjacentBlock.y][adjacentBlock.x] != '*' || tilemap[adjacentBlock.y][adjacentBlock.x] != '#') {
		return true;
	} else {
		return false;
	}
}