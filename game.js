var G = {

	w: 800,
	h: 600,

	ctx: null,
	bgImg: null,

	dX: null,
	dY: null,
	gX: null,
	gY: null,

	interval: null,

	vel: null,
	_state: null,
	tick: 0,

	VEL_IDLE: -0.5,
	VEl_DIVE: 7,
	VEL_SURFACE: -7,
	VEL_PAUSE: 0,

	entities: [],

	sR: 202,
	sG: 228,
	sB: 241,
	eR: 0,
	eG: 87,
	eB: 138,

	init: function (ctx, bgImg) {
		//console.log('G.init');
		G.ctx = ctx;
		G.bgImg = bgImg;

		G.dX = 0;
		G.dY = 0;
		G.gX = 0;
		G.gY = 0;

		G.vel = G.VEL_IDLE;

		G.state("init");

		$(document).keydown(G.input);
		P.init(ctx, G.gY);
		G.draw();
	},

	state: function (value) {

		if (typeof value == "undefined") {
			return G._state;
		}
		//console.log(value, 'state');
		G._state = value;
	},

	start: function () {
		//console.log('G.start');
		G.state("start");
		G.interval = setInterval(G.update, Math.floor(1000 / 60));
	},

	draw: function () {
		G.drawBg();

		/**
		 G.ctx.fillStyle = 'black';
		 G.ctx.font = "bold 16px Arial";
		 G.ctx.fillText(G.gY, 10, 25);
		 **/

		if (P.MEM_DIVE_BREACH == true) {
			/*
			 G.ctx.fillStyle = 'black';
			 G.ctx.font = "bold 16px Arial";
			 G.ctx.fillText("DIVE BREACHED", 10, 50);
			 */

			G.ctx.fillStyle = 'black';
			G.ctx.font = "bold 16px Arial";
			G.ctx.fillText(P.MEM_HOW_DEEP - 600, 300, P.dY - 20);
			if (P.state == "dead") {
				G.ctx.beginPath();
				G.ctx.lineWidth = 1;
				G.ctx.moveTo(300, P.dY - 25);
				G.ctx.lineTo(350, P.dY - 25);
				G.ctx.strokeStyle = "black";
				G.ctx.stroke();
			}
		}


		if (P.MEM_SURFACE_BREACH == true) {
			G.ctx.fillStyle = 'white';
			G.ctx.font = "bold 40px Arial";
			G.ctx.fillText("PRESS F5 to try again", 100, 75);
		}


		/**
		 G.ctx.fillStyle = 'black';
		 G.ctx.font = "bold 16px Arial";
		 G.ctx.fillText(P.air, 100, 25);
		 **/

		for (var mI = 0; mI <= G.entities.length - 1; mI++) {
			G.entities[mI].draw();
		}

		if (P.MEM_SURFACE_BREACH) {
			P.draw(350, G.h - G.gY);
		} else {
			P.draw(350, 100);
		}
	},

	"_getRgbByDepth": function (depth) {

		var X1 = 0, X2 = 1000,
			rY1 = 202 , rY2 = 0, rM = (rY2 - rY1) / (X2 - X1),
			gY1 = 228, gY2 = 87, gM = (gY2 - gY1) / (X2 - X1) ,
			bY1 = 241, bY2 = 138, bM = (bY2 - bY1) / (X2 - X1),
			rgb;


		if (depth >= X2) {
			return {r: rY2, g: gY2, b: bY2};
		}

		rgb = {
			r: Math.floor(rM * (depth - X1) + rY1),
			g: Math.floor(gM * (depth - X1) + gY1),
			b: Math.floor(bM * (depth - X1) + bY1)
		};

		return rgb;
	},

	drawBg: function () {
		//console.log('G.drawBg');
		var dX = 0, dY = 0;

		G.ctx.clearRect(0, 0, G.w, G.h);


		if (G.gY > 0) {
			dY -= G.gY;
		}

		if (G.gY < G.h) {
			G.ctx.drawImage(G.bgImg, 0, dY);
		}


		var rgb = G._getRgbByDepth(G.gY),
			my_gradient = G.ctx.createLinearGradient(0, 0, 0, G.h);

		my_gradient.addColorStop(0, "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")");
		my_gradient.addColorStop(1, "rgb(" + G.eR + ", " + G.eG + ", " + G.eB + ")");
		G.ctx.fillStyle = my_gradient;

		if (G.gY < G.h) {
			G.ctx.fillRect(0, 600 - G.gY, 800, 600);
		} else {
			G.ctx.fillRect(0, 0, 800, 600);
		}

		if (G.state() == 'init') {
			//console.log('DRAW START');
			G.ctx.fillStyle = 'black';
			G.ctx.font = "bold 40px Arial";
			G.ctx.fillText("PRESS SPACE", 250, 250);
		}

		if (P.MEM_DIVE_BREACH && P.MEM_PRESSED_DIVE == false && G.tick < 200) {
			G.ctx.fillStyle = 'white';
			G.ctx.font = "bold 40px Arial";
			G.ctx.fillText("PRESS S to dive ", 200, 250);
		}

		if (P.MEM_PRESSED_DIVE && P.MEM_PRESSED_SURFACE == false && G.tick < 250) {
			G.ctx.fillStyle = 'white';
			G.ctx.font = "bold 40px Arial";
			G.ctx.fillText("PRESS W to surface", 180, 250);
		}

		if (P.state == "dead") {

			G.ctx.fillStyle = 'white';
			if (G.dY < 500) {
				G.ctx.fillStyle = 'black';
			}
			G.ctx.font = "bold 40px Arial";
			G.ctx.fillText("DROWNED", 300, 250);
		}
	},

	goingDown: function () {
		return G.vel > 0;
	},

	update: function () {
		if (G.state() == "pause") {
			return;
		}

		G.tick += 1;

		if (P.MEM_SURFACE_BREACH == true) {
			G.vel = G.VEL_IDLE;
			if (G.gY == 100) {
				G.vel = G.VEL_PAUSE;
			}
		}

		G.gY += G.vel;

		if (G.gY > 100) {

			if (P.MEM_SURFACE_BREACH != true) {
				if (G.gY % 200 == 0) {
					//console.log('spawn fish');
					fx = Math.floor((Math.random() * 800) + 1);
					G.entities.push(new fish(G.ctx, fx, G.gY + G.h));
				}
			}

			if (G.tick % 100 == 0) {
				var bX, bR;
				bx = Math.floor((Math.random() * 800) + 1);
				bR = Math.floor((Math.random() * 10) + 1);
				G.entities.push(new bubble(G.ctx, bx, G.gY + G.h, bR));
			}
		}

		P.update();

		for (var mI = 0; mI <= G.entities.length - 1; mI++) {
			G.entities[mI].update();
		}

		G.draw();
		G.cleanup();
	},

	input: function (e) {
		//console.log(e.which, 'G.input');
		switch (e.which) {
			case 32:
				switch (G.state()) {
					case "init":
						G.start();
						break;
					case "pause":
						//G.resume();
						break;
					case "start":
						//G.stop();
						break;
				}
				break;
			case 83:

				break;
			case 87:
				break;
			case 27:
				//G.state("pause");
				break;
			default:
				break;
		}
	},

	log: function (value) {
		//console.log(value);
	},

	stop: function () {
		G.vel = 0;
		//G.state("pause");
	},

	resume: function () {
		G.state("start");
	},

	cleanup: function () {
		for (var i = 0; i < G.entities.length - 1; i++) {
			var cBubble = G.entities[i];
			if (cBubble.y < 600) {
				G.entities.splice(i, 1);
			}
		}
	}
};

var fish = function (ctx, x, y) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this._draw = false;
	this.align = "left";
	//console.log(y, 'fish');

	this.draw = function () {
		if (this._draw == false) {
			return;
		}
		var y = this.y - G.gY;

		// body
		this.ctx.fillStyle = "rgb(100, 100, 100)";
		this.ctx.fillRect(this.x, y, 30, 20);
		// tail
		this.ctx.fillStyle = "rgb(100, 100, 100)";
		this.ctx.beginPath();
		this.ctx.moveTo(this.x + 30, y + 10);
		this.ctx.lineTo(this.x + 40, y); // /
		this.ctx.lineTo(this.x + 40, y + 20); // |
		this.ctx.lineTo(this.x + 30, y + 10); // \
		//this.ctx.stroke();
		this.ctx.fill();
		this.ctx.closePath();


		// eye
		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.ctx.arc(this.x + 10, y + 10, 5, 0, 2 * Math.PI, false);
		this.ctx.closePath();
		this.ctx.stroke();
	};

	this.update = function () {
		this._draw = (this.y < G.gY + G.h && this.y > G.gY);

		if (this.align == "left") {
			if (this.x > 0) {
				this.x -= 1;
			} else {
				this.align = "right";
			}
		}

		if (this.align == "right") {
			if (this.x < G.w) {
				this.x += 1;
			} else {
				this.align = "left";
			}
		}
	};


};

var bubble = function (ctx, x, y, r) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this.r = r;
	this._draw = false;
	this.vel = Math.floor((Math.random() * 3) + 1);


	this.draw = function () {

		if (this._draw == false) {
			return;
		}
		var y = this.y - G.gY;
		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.ctx.arc(this.x, y, this.r, 0, 2 * Math.PI, false)
		this.ctx.stroke();
	};

	this.update = function (v) {
		this._draw = (this.y < G.gY + G.h && this.y > G.gY);
		this.y -= this.vel;
	}

};