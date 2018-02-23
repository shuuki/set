console.log('SET CORE 2018')



// utilities

// clock values generator
// takes time in ms
// returns object in clock units
const clocks = ( ms ) => {
	let clock = {
		up: Math.floor( ms / 1000 ),
		ms: Math.floor( ms % 1000 ),
		sec: Math.floor( ms / 1000 % 60 ),
		min: Math.floor( ms / 60000 % 60 ),
		hr: Math.floor( ms / 3600000 % 24 ),
		day: Math.floor( ms / 86400000 )
	}
	return clock
}



// pad numbers with leading zeros
// takes number and desired length
// returns number with zeros added
const pad = (num, len) => {
	let s = String(num);
	while ( s.length < ( len || 2 ) ) {
		s = "0" + s
	}
	return s
}
/*
pad( 1, 3 ) //returns "001"
pad( 10, 3 ) // returns "010"
pad( 100, 3 ) // returns "100"
*/



// system variables 

var g = {} // globals
var s = {} // scenes
var e = {} // entities
var z = {} // sim z



// globals

g.running = false // sim status
g.time = 0 // system time
g.up = 0 // sim uptime
g.delay = 0 // time sim last ran
g.delta = 0 // frame delta time
g.cache = {}
g.increment = 0 // sim update increment
g.default_increment = 1000
g.offset_increment = 0 
g.log = []



// entities

e.all = {}



// burner entity

e.all.burn = {
	active: true,
	cool: 0,
	count: 0,
	increment: 4
}

e.all.burn.update = () => {
	if ( e.all.burn.cool > 0 ) {
		e.all.burn.cool -= g.delta / 1000
	} else if (e.all.burn.cool <= 0 ) {
		e.all.burn.cool = 0
	}
}

e.all.burn.draw = () => {

	let sparker = document.getElementById( 'burner' )
	let cool = e.all.burn.cool

	if (sparker !== null && cool > 0) {
		sparker.innerHTML = Math.floor(cool)
		sparker.disabled = true
		sparker.style.background = 
		'linear-gradient(to right, black, black '
		+ e.all.burn.cool/e.all.burn.increment * 100
		+ '%, red '
		+ e.all.burn.cool/e.all.burn.increment * 100
		+'%, red)' 

		
		//sparker.remove()
	} else if (sparker !== null && cool <= 0) {
		sparker.disabled = false
		sparker.innerHTML = '*'

	}
	

	if ( sparker === null && cool <= 0 ) {
		let burner = document.createElement( 'button' );
		burner.innerHTML = '*';
		burner.id = 'burner';
		burner.enabled = true;
		burner.addEventListener( 'click', e.all.burn.spark );
		burner.style.width = '8em'
		burner.style.border = 'none'
		burner.style.color = 'white'
		burner.style.height = '2em'
		burner.style.display = 'block'
		burner.style.margin = '1em 0'
		burner.style.background = 'red' 

		interface.appendChild( burner );
	}

	//console.log(e.all.burn.cool)
}

e.all.burn.spark = () => {
	e.all.burn.cool = e.all.burn.increment
	g.log.push( 'spark' )
}



// scenes 

s.active = 0 // current active scene
s.update = {} // list of update functions
s.draw = {} // list of render functions

/*
s.reset = () => {
  if (s.active != 0) s.active = 0
}

s.cycle = () => {
	if (s.active < s.draw.length) s.active += 1
	else s.active = 0
}
*/



// base scene

s.update[0] = () => {
	let past = g.time
	let time = Date.now()
	let del = time - past
	let up = g.up + del
	
	g.time = time
	g.up = up
	g.delta = del
	
	if ( g.delta > 250 ) {
		g.log.push( 'over delta ' + g.delta )
	}
	
}

s.draw[0] = () => {
	let c = clocks( g.up )

	div.innerHTML = '<p>'
		+ pad(c.day, 2) + ' : '
		+ pad(c.hr, 2) + ' : '
		+ pad(c.min, 2) + ' : '
		+ pad(c.sec, 2) + ' : '
		+ pad(c.ms, 3)
		+ '</p>';
	
	logger.innerHTML = g.log.join( '\n' )
}



// sim z

z.init = () => {

	g.time = Date.now()

	z.load()

	if ( !g.running ) {
		window.requestAnimationFrame( z.update )
		g.running = true
	} else {
		window.cancelAnimationFrame( z.update )
		g.running = false
	}

}

z.update = () => {

	if ( g.running ) {
		window.requestAnimationFrame( z.update )
	}

	if (typeof s.update[s.active] === 'function' ) {
		s.update[s.active]()
	}
	

	for (var entity in e.all) {
		let found = e.all[entity]
		if (found.active && typeof found.update === 'function') {
			found.update(g.increment)
		}
	}

	z.save()

	z.render()

}

z.render = () => {
	if (typeof s.draw[s.active] === 'function' ) {
		s.draw[s.active]()
	}
	for (var entity in e.all) {
		let found = e.all[entity]
		if (found.active && typeof found.draw === 'function') {
			found.draw()
		}
	}

}



// sim state management

z.save = () => {
	let cache = {
		up: g.up,
		time: g.time,
		log: g.log
	}
	let save = JSON.stringify( cache )
	window.localStorage.setItem( 'SETOUT', save )
}

z.load = () => {
	if ( localStorage.getItem( 'SETOUT' ) ) {
		let load = localStorage.getItem( 'SETOUT' )
		let cache = JSON.parse( load )
		g.log = cache.log
		g.cache = cache

		// split this into a separate function
		// vvvvvvvvvvvvvv
		g.up = g.cache.up
		g.delay = g.cache .time
		// if it's paused this shouldn't happen
		// so when you go away you get delay updates
		// but on pause it should freeze the delay
		g.delay = g.time - g.delay
		g.up = g.up + g.delay

		// update logging
		let templog = 'delay ' + ( g.delay / 1000 ) + ' sec';
		// add log to end of array 
		g.log.push( templog )
		// or add to start of array
		//g.log.splice( 0, 0, templog )
		if ( g.log.length > 12 ) {
			g.log.shift()
		}
		// ^^^^^^^^^^^^^^
	}
}

z.reset = () => {
	if ( localStorage.getItem( 'SETOUT' ) ) {
		localStorage.removeItem( 'SETOUT' )
		g.log = []
		g.up = 0
	}
}



// dom elements

var body = document.getElementsByTagName( 'body' )[0];

/*
var playpause = document.createElement( 'button' );
playpause.innerHTML = 'Begin';
playpause.addEventListener( 'click', z.init );
body.appendChild( playpause );
*/

var interface = document.createElement( 'div' );
interface.id = 'interface'
body.appendChild( interface );


var forget = document.createElement( 'button' );
forget.innerHTML = 'Reset';
forget.addEventListener( 'click', z.reset );
interface.appendChild( forget );

var div = document.createElement( 'div' );
interface.appendChild( div );

var logger = document.createElement( 'pre' )
body.appendChild( logger )



// start the sim

z.init();
