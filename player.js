var P = {
	ctx : null,
	dX: 350,
	dY: 150,

	gY : null,

	MEM_JUMPED : false,
	MEM_DIVE_BREACH : false,
	MEM_SURFACE_BREACH: false,
	MEM_PRESSED_DIVE: false,
	MEM_PRESSED_SURFACE: false,
	MEM_HOW_DEEP: 0,

	air : null,
	breath: null,



	init: function (ctx, gY) {
		//console.log(gY, 'player.init');
		P.ctx = ctx;
		P.gY = gY;
		P.air = 150;


		P.setState("idle");

		$(document).keyup(P.input);
		P.breath = setInterval(function () {
			if (P.MEM_DIVE_BREACH == true && P.MEM_SURFACE_BREACH == false) {
				P.drain(10)
			}
		}, 1000);
	},

	drain : function (value) {
		P.air -= value;
		if (P.air <= 0) {
			P.die();
		}
	},

	input: function (e) {

		switch (e.which) {
			case 65:
				//console.log('A');
				//P.x -= 10;
				break;
			case 68:
				//console.log('D');
				//P.x += 10;
				break;
			case 83:
				//console.log('S');
				if (P.state != "dead") {
					P.dive(G.VEl_DIVE, 200);
				}
				P.MEM_PRESSED_DIVE = true;
				break;
			case 87:
				//console.log('W');
				P.MEM_PRESSED_SURFACE = true;
				if (P.state != "dead") {
					P.surface();
				}
				break;
			default :
				//console.log(e.which, 'player.init');
				break;
		}

	},

	moveTo: function (x, y) {
		P.dX = x;
		P.dY = y;
	},

	dive: function (vel, dest) {
		if (P.state == "dead") {
			return;
		}

		if (P.state == 'idle') {
			P.setState('diving');
			P.diveTo = P.gY + dest;
			P.drain(5);
		}
		if (P.gY < P.diveTo) {
			G.vel = vel;
		} else {
			P.diveTo = null;
			P.setState('idle');
			G.vel = G.VEL_IDLE;
		}
	},

	surface: function () {

		if (P.state == 'idle') {
			P.setState('rising');
			P.diveTo = P.gY - 200;

		}

		if (P.gY > P.diveTo) {
			G.vel = G.VEL_SURFACE;
		} else {
			P.diveTo = null;
			P.setState('idle');
			G.vel = G.VEL_IDLE;
		}

	},

	die : function () {
		P.setState("dead");
		G.vel = G.VEL_IDLE;
	},

	update: function () {
		P.gY = G.gY + P.dY;

		if (P.gY > P.MEM_HOW_DEEP) {
			P.MEM_HOW_DEEP = P.gY;
		}

		if (P.gY > G.h) {
			P.MEM_DIVE_BREACH = true;
		}

		if (P.gY < G.h && P.MEM_DIVE_BREACH) {
			P.MEM_SURFACE_BREACH = true;

		}

		if (P.MEM_SURFACE_BREACH) {
			P.air = 100;
		}

		if (P.MEM_JUMPED == false) {
			P.dive(20, G.h);
			P.MEM_JUMPED = true;
		}

		if (P.state == "diving") {
			P.dive(G.VEl_DIVE, 200);
		}

		if (P.state == 'rising' && P.MEM_SURFACE_BREACH == false) {
			P.surface();
		}
	},

	draw: function (dX, dY) {
		P.dY = dY;
		//console.log('player.draw');
		P.ctx.fillStyle = "rgb(0, 0, 0)";
		if (P.state == 'dead') {
			P.ctx.fillRect(dX, dY, 100, 30);
		} else {
			P.ctx.fillRect(dX, dY, 30, 100);
		}
	},

	setState: function (value) {
		//console.log(value, "player.setState");
		P.state = value;
	}
};