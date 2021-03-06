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

var MOVEMENT_VELOCITY = 250;
var ALLOWED_DISTANCE = 20;
var BB_ADJUST = 0;

var blockSize = 48;
var xBlocks = 15;
var yBlocks = 15;

var game = new Phaser.Game(blockSize * xBlocks, blockSize * yBlocks, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;

var cursors;
var bombButton;
var explosionButton;

var blocks;

function preload() {
	game.load.image('block', 'images/block.png');
	game.load.image('break', 'images/breakable.png');
	game.load.image('bomb', 'images/bomb.png');
    game.load.image('explosion', 'images/explosion.png');
	game.load.spritesheet('actor1', 'images/actor4.png', 48, 48);
}

function create() {
	game.stage.backgroundColor = "#00FF00";
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
    player.direction = "down";

    game.physics.arcade.enable(player);
    player.body.setSize(blockSize - BB_ADJUST, blockSize - BB_ADJUST, BB_ADJUST/2, BB_ADJUST/2);
    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();
    bombButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    explosionButton = game.input.keyboard.addKey(Phaser.KeyCode.X);
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
        player.direction = "left";
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = MOVEMENT_VELOCITY;

        player.animations.play('right');
        player.direction = "right";
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = MOVEMENT_VELOCITY;

        player.animations.play('down');
        player.direction = "down";
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -MOVEMENT_VELOCITY;

        player.animations.play('up');
        player.direction = "up";
    }
    else
    {
        //  Stand still
        player.animations.stop();
    }

    if (bombButton.isDown) {
    	player.body.velocity.x = 0;
    	player.body.velocity.y = 0;
    	placeBomb();
    }
    
    // TODO <CS>: Explosions must get placed by bombs upon detonation.
    if (explosionButton.isDown) {
        placeExplosion();
    }

    var hitPlatform = game.physics.arcade.collide(player, blocks);

    if (hitPlatform && isAdjacentBlockPassable()) {
    	var delta = findDeltaFromPassing();

		var distance = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));

		if (distance <= ALLOWED_DISTANCE) {
			adjustToCurrentBlock();
		}
	}
}

function placeBomb() {
	var bombBlock = player.block;
	if (player.direction == "down") {
		bombBlock.y += 1;
	} else if (player.direction == "up") {
		bombBlock.y -= 1;
	} else if (player.direction == "right") {
		bombBlock.x += 1;
	} else if (player.direction == "left") {
		bombBlock.x -= 1;
	}

	console.log(tilemap[bombBlock.y][bombBlock.x]);

	if (tilemap[bombBlock.y][bombBlock.x] != "*" && tilemap[bombBlock.y][bombBlock.x] != "#") {
		var bomb = blocks.create(bombBlock.x * blockSize, bombBlock.y * blockSize, 'bomb');
		bomb.body.immovable = true;
	}
}

function blockIsNotWall(x,y) {
    return (tilemap[y][x] != "*");
}

// TODO <CS>: Should probably take in coordinates here. Whatever's the equivalent of a vector2 in phaser.
function placeExplosion() {
    var explosionOrigin = player.block;
    // TODO <CS>: Get rid of this magic number by associating it with player powerup acquisition.
    var explosionRange = 4;
    var explosionCoords = [];
    var rt = "rt", up = "up", lf = "lf", dn = "dn";
    var maxRanges = {rt: 0, dn: 0, lf: 0, up: 0};
    
    for (var i = 1; i < explosionRange; i++) {
        if (maxRanges[rt] == i - 1 && blockIsNotWall(explosionOrigin.x + i, explosionOrigin.y)) {
            maxRanges[rt] += 1;
            explosionCoords.push({"x": explosionOrigin.x + i, "y": explosionOrigin.y});
        }

        if (maxRanges[up] == i - 1 && blockIsNotWall(explosionOrigin.x, explosionOrigin.y - i)) {
            maxRanges[up] += 1;
            explosionCoords.push({"x": explosionOrigin.x, "y": explosionOrigin.y - i});
        }
        
        if (maxRanges[lf] == i - 1 && blockIsNotWall(explosionOrigin.x - i, explosionOrigin.y)) {
            maxRanges[lf] += 1;
            explosionCoords.push({"x": explosionOrigin.x - i, "y": explosionOrigin.y});
        }
        
        if (maxRanges[dn] == i - 1 && blockIsNotWall(explosionOrigin.x, explosionOrigin.y + i)) {
            maxRanges[dn] += 1;
            explosionCoords.push({"x": explosionOrigin.x, "y": explosionOrigin.y + i});
        }
    }
    
    explosionCoords.push({"x": explosionOrigin.x, "y": explosionOrigin.y});
   
    //console.log("ranges: " + JSON.stringify(maxRanges) + " explosionCoords: " + JSON.stringify(explosionCoords));
    for (i in explosionCoords) {
        var point = explosionCoords[i];
        var explosion = blocks.create(point["x"] * blockSize, point["y"] * blockSize, 'explosion');
        explosion.body.immovable = true;
        explosion.lifespan = 250;
    }
}

function adjustToCurrentBlock() {
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
	console.log(JSON.stringify(player.body.touching));

	var adjacentBlock = {};
	if (player.direction == "up") {
		adjacentBlock.x = player.block.x;
		adjacentBlock.y = player.block.y - 1;
	} else if (player.direction == "down") {
		adjacentBlock.x = player.block.x;
		adjacentBlock.y = player.block.y + 1;
	} else if (player.direction == "left") {
		adjacentBlock.x = player.block.x - 1;
		adjacentBlock.y = player.block.y;
	} else if (player.direction == "right") {
		adjacentBlock.x = player.block.x + 1;
		adjacentBlock.y = player.block.y;
	} else {
		return true;
	}

	if (tilemap[adjacentBlock.y][adjacentBlock.x] != '*' && tilemap[adjacentBlock.y][adjacentBlock.x] != '#') {
		return true;
	} else {
		return false;
	}
}