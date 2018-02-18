console.log('SET CORE 2018')



// globals

var g = {}

g.running = false // sim status
g.time = 0 // system time
g.up = 0 // sim uptime
g.delay = 0 // time sim last ran
g.delta = 0 // frame delta time


// steps

var z = {}

z.init = () => {

	g.time = Date.now()

	z.load()

	g.delay = g.time - g.delay
	g.up = g.up + g.delay

	if ( !g.running ) {
		window.requestAnimationFrame( z.update )    
		g.running = true
	} else {
		window.cancelAnimationFrame( z.update )
		g.running = false
	}

}

z.update = () => {

	let past = g.time
	let time = Date.now()
	let del = time - past
	let up = g.up + del
	
	g.time = time
	g.up = up
	g.delta = del

	if ( g.running ) {
		window.requestAnimationFrame( z.update )
	}

	if (typeof scene.update[scene.active] === 'function' ) {
		scene.update[scene.active]()
	}

	z.save()

	z.render()

}

z.render = () => {
	let c = clocks( g.up )	
	div.innerHTML = '<p>' + c.hr + ' hr : ' + c.min + ' min : ' + c.sec + ' sec' + '</p>';
}



// state management

z.save = () => {
	let cache = {
		up: g.up,
		time: g.time
	}
	let save = JSON.stringify( cache )
	window.localStorage.setItem( 'SETOUT', save )
}

z.load = () => {
	if ( localStorage.getItem( 'SETOUT' ) ) {
		let load = localStorage.getItem( 'SETOUT' )
		let cache = JSON.parse( load )
		g.up = cache.up
		g.delay = cache.time
	}
}

z.reset = () => {
	if ( localStorage.getItem( 'SETOUT' ) ) {
		localStorage.removeItem( 'SETOUT' )
		g.up = 0
	}
}






function clocks ( ms ) {
	let clock = {
		ms: Math.floor( ms % 1000 ),
		sec: Math.floor( ( ms / 1000 ) % 60 ),
		min: Math.floor( (ms / ( 1000 * 60 ) ) % 60 ),
		hr: Math.floor( ( ms / ( 1000 * 60 * 60 ) ) % 24 ),
		up: Math.floor( g.up / 1000 )
	}
	return clock
}



// elements

var body = document.getElementsByTagName('body')[0];

var playpause = document.createElement('button');
playpause.innerHTML = 'Begin';
playpause.addEventListener('click', z.init);
body.appendChild(playpause);

var forget = document.createElement('button');
forget.innerHTML = 'Reset';
forget.addEventListener('click', z.reset);
body.appendChild(forget);

var div = document.createElement('div');
body.appendChild(div);








z.init();













// scenes ---------------------

var scene = {}


scene.active = 0

scene.update = {}

scene.draw = {}

scene.updates = () => {
	
}

scene.drawing = () => {
	if (typeof scene.draw[scene.active] === 'function' ) scene.draw[scene.active]()
}

scene.reset = () => {
  if (scene.active != 0) scene.active = 0
}

scene.cycle = () => {
	if (scene.active < scene.draw.length) scene.active += 1
	else scene.active = 0
}
