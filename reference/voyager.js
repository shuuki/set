
// Not fare well,
// But fare forward, Voyagers.
// -- T. S. Eliot, The Dry Salvages

// Planetary Fact Sheet - Metric
// http://nssdc.gsfc.nasa.gov/planetary/factsheet/
// NSSDCA: Voyager Project Information
// http://nssdc.gsfc.nasa.gov/planetary/voyager.html








// load

window.addEventListener('load', function()
{
	Sim.test();
	Sim.init(voyager);
	Sim.start();
}, false);








// seed

var voyager = {
	display: {
		width: 1000,
		height: 720
	},
	seed: {
		//stage: new Stage(),
		//camera: new Camera(),

		//                                kg
		//                x,y   vel x,y   mass
		ship: new Craft(460,310,   0, 420, 721.9),

		// magling data from NASA
		//             10^24 kg,       km,   10^6 km,  km/s,       hex    //   10^6 km,  10^6 km,
	 	//                 mass, diameter,  distance, speed,     color    // periapsis, apoapsis,
	 	slvr: new Body(       0,100000000,         0,     0, '#080808' ), //         0,        0,
		sonn: new Body( 1988435,   69570.0,         0,     0, '#f8f8f2' ), //         0,        0,
		mirk: new Body(   0.330,     4879,      57.9,  47.4, '#787878' ), //      46.0,     69.8,
		vans: new Body(    4.87,    12104,     108.2,  35.0, '#ae885d' ), //     107.5,    108.9,
		erth: new Body(    5.97,    12756,     149.6,  29.8, '#888ba0' ), //     147.1,    152.1,
		marz: new Body(   0.642,     6792,     227.9,  24.1, '#86674c' ), //     206.6,    249.2,
		jupt: new Body(    1898,   142984,     778.6,  13.1, '#b87e1b' ), //     740.5,    816.6,
		sats: new Body(     568,   120536,    1433.5,   9.7, '#debc7f' ), //    1352.6,   1514.5,
		urns: new Body(    86.8,    51118,    2872.5,   6.8, '#a8ccd1' ), //    2741.3,   3003.6,
		nepz: new Body(     102,    49528,    4495.1,   5.4, '#3d5ad8' ), //    4444.5,   4545.7,
	}
}








// celestial bodies

function Body(mass, diameter, distance, speed, color) // periapsis, apoapsis
{
	var scale = {
		distance: 1,
		diameter: 0.0005,
		time: 0.0001
	}

	this.m = mass;
	this.d = diameter * scale.diameter; // radius
	this.od = distance * scale.distance; // orbit, distance from origin
	this.speed = speed * scale.time; // speed
	this.color = color; 

	this.p = 0; // period, how far along

	// origin x/y, only for rendering
	this.ox = 240;
	this.oy = 320;
}
Body.prototype.update = function(origin)
{
	
	this.p += this.speed;

	var whatsit = polarToCoord(this.od, this.p);
	
	this.x = whatsit[0]+this.ox
	this.y = whatsit[1]+this.oy
	
	//https://lord.io/blog/2014/kepler/

}
Body.prototype.draw = function(origin)
{
	var context = origin.context;

	// fill circle with body color
	context.beginPath();
	context.fillStyle = "black";
	context.rect(0, 0, context.canvas.width, context.canvas.height);
	context.globalAlpha = 1;
	context.fill();
	context.closePath();

	// fill circle with body color
	context.beginPath();
	context.fillStyle = this.color;
	context.arc(this.x, this.y, this.d/2, 0, 2 * Math.PI);
	context.globalAlpha = 1;
	context.fill();
	context.closePath();

	// stroke outline for small bodies
	context.beginPath();
	context.strokeStyle = this.color;
	context.lineWidth = 4;
	context.arc(this.x, this.y, 8, 0, 2 * Math.PI);
	context.globalCompositeOperation = 'screen';
	context.globalAlpha = 0.2;
	context.stroke();
	context.closePath();

	// cycles elapsed on each planet
	//context.globalAlpha = 1;
	//context.fillText((this.d/(2*Math.PI)).toFixed(1), this.x+8, this.y+4);
}








// space craft

function Craft(x, y, velX, velY, m)
{
	this.x = x || 0;
	this.y = y || 0;
	this.velX = velX || 0;
	this.velY = velY || 0;
	this.m = m || 0;
	this.t = 0;
	this.velTurn = 0;
	this.direction = 0;
	this.history = [];
	this.history.push({
		x: this.x,
		y: this.y,
		t: this.t
	});
}
Craft.prototype.update = function(origin)
{

	// get delta time
	var delta = origin.time.delta;
	// try stepping to increase accuracy when delta gets too high
	// steps = Math.ceil(delta / 16);

	// build a list of all bodies x/y with their masses
	this.bodies = [];
	this.bodiesTotalWeight = 0;
	
	for (var body in origin.entity.active)
	{
		var isType = origin.entity.active[body].constructor.name;
		if (isType === 'Body')
		{
			// bind shortcut to currently selected body
			var selected = origin.entity.active[body];
			
			// calculate effect of gravity using body mass and distance		
			var mass = selected.m,
				distance = length([this.x, this.y], [selected.x, selected.y]),
				weight = attenuate(mass, distance);

			this.bodiesTotalWeight += weight;

			this.bodies.push({
				x: selected.x,
				y: selected.y,
				m: selected.m,
				d: selected.d,
				w: weight
			});
		}
	}

	// average out a gravity vector
	var avX = 0,
			avY = 0;

	for (var k = 0; k < this.bodies.length; k++)
	{	
		// bind shortcut to currently selected body
		var selected = this.bodies[k];

		// multiplier should be based on total current weight, not overall system mass
		// so near low mass bodies can be more influential than distant high mass bodies
		var multiplier = selected.w / this.bodiesTotalWeight;

		// calculate a weighted vector averaging all bodies
		avX += selected.x * multiplier;
		avY += selected.y * multiplier;
	}

	// reset gravity vector angle, calibrate a new weighted vector
	this.vectorAngle = 0;
	this.vectorAngle = angle([this.x, this.y], [avX, avY])
	this.barycenter = polarToCoord(this.bodiesTotalWeight, this.vectorAngle);

	// do x/y transforms	
	if (this.barycenter[0] && this.barycenter[1])
	{
			this.velX = this.velX + this.barycenter[0] / 2 / delta;
			this.velY = this.velY + this.barycenter[1] / 2 / delta;
	}
	
	this.x += this.velX / this.m
	this.y += this.velY / this.m
	
	
	// http://gafferongames.com/game-physics/integration-basics/
	// f = ma
	// a = f/m

	// http://lolengine.net/blog/2011/12/14/understanding-motion-in-games
	// (old_velocity + new_velocity) * 0.5 * dt


	// update internal time
	this.t += delta;
	
	// truncate history older than 10000 steps
	if (this.history.length > 10000) {
		this.history.shift()
	}

	// add current update to history
	this.history.push({
		x: this.x,
		y: this.y,
		t: this.t
	})

}
Craft.prototype.draw = function(origin)
{
	// bind canvas
	var context = origin.context;

	// fill circle with body color
	context.beginPath();
	context.fillStyle = '#f8f8f8';
	context.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
	context.globalAlpha = 1;
	context.fill();
	context.closePath();

	// asteroids ship style
	//var shipAngle = 0.8,
	//shipSize = 8;
	//context.strokeStyle = 'magenta';
	//context.lineWidth = 2;
	//context.arc(this.x, this.y, shipSize, (this.Direction - origin.util.pi - shipAngle), (this.Direction - origin.util.pi + shipAngle), false);
	//context.arc(this.x, this.y, shipSize, this.Direction, this.Direction, false);
	//context.arc(this.x, this.y, shipSize, (this.Direction - origin.util.pi - shipAngle), (this.Direction - origin.util.pi + shipAngle), false);

	for (var k = 0; k < this.bodies.length; k++)
	{	
		// bind shortcut to currently selected body
		var selected = this.bodies[k];

		// draw a line to every body
		context.beginPath();
		context.moveTo(this.x, this.y)
		context.lineTo(selected.x, selected.y);
		context.strokeStyle = 'rgba(255,0,0,' + selected.w * 1000 + ')';
		context.lineWidth = 4;
		//disabling the gravity view for aesthetics
		//context.stroke();
		context.closePath();
	}
	
	// draw current gravity vector
	context.beginPath();
	context.moveTo(this.x, this.y)
	context.strokeStyle = 'rgba(255,255,0,0.1)';
	context.lineWidth = 2;
	context.lineTo(this.x + this.barycenter[0], this.y + this.barycenter[1]);
	context.stroke();
	context.closePath();

	// draw a trail behind craft using points in history
	context.beginPath();
	for (var key = 0; key < this.history.length; key++)
	{
		context.lineTo(this.history[key].x, this.history[key].y);
	}
	context.strokeStyle = 'rgba(0,255,255,0.3)';
	context.stroke();
	context.closePath();

}








// distance between two points in [x,y]
function length(a, b) {
	var length = Math.sqrt(Math.pow(b[1] - a[1], 2) + Math.pow(b[0] - a[0], 2));
	return length;
}

// angle between two points in [x,y]
function angle(a, b) {
	var angle = Math.atan2(b[1] - a[1], b[0] - a[0])// * 180 / Math.PI + 180;
	return angle;
}

//
function polarToCoord(length, angle) {
	var x = length * Math.cos(angle),
		y = length * Math.sin(angle);
	return [x, y];
}

// 
function attenuate(intensity, length) {
	var attenuation = intensity / Math.pow(length, 2);
	return attenuation;
}
