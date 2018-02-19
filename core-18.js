console.log('SET CORE 2018')


// system variables 

var g = {} // globals
var s = {} // scenes
var z = {} // sim z



// globals

g.running = false // sim status
g.time = 0 // system time
g.up = 0 // sim uptime
g.delay = 0 // time sim last ran
g.delta = 0 // frame delta time
g.cache = {}
g.log = []


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


// sim z

z.init = () => {

	g.time = Date.now()

	z.load()

	g.up = g.cache.up
	g.delay = g.cache .time
	// if it's paused this shouldn't happen
	// so when you go away you get delay updates
	// but on pause it should freeze the delay
	g.delay = g.time - g.delay
	g.up = g.up + g.delay

	g.log.splice( 0, 0, 'delay ' + ( g.delay / 1000 ) + ' sec' )

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

	z.save()

	z.render()

}

z.render = () => {
	if (typeof s.draw[s.active] === 'function' ) {
		s.draw[s.active]()
	}
}



// state management

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
	}
}

z.reset = () => {
	if ( localStorage.getItem( 'SETOUT' ) ) {
		localStorage.removeItem( 'SETOUT' )
		g.log = []
		g.up = 0
	}
}



// base scene

s.update[0] = () => {
	let past = g.time
	let time = Date.now()
	let del = time - past
	let up = g.up + del
	
	g.time = time
	g.up = up
	g.delta = del
}

s.draw[0] = () => {
	let c = clocks( g.up )

	div.innerHTML = '<p>'
		+ pad(c.hr, 2) + ' : '
		+ pad(c.min, 2) + ' : '
		+ pad(c.sec, 2) + ' : '
		+ pad(c.ms, 3)
		+ '</p>';
	
	logger.innerHTML = g.log.join( '\n' )
}



// dom elements

var body = document.getElementsByTagName( 'body' )[0];

/*

var playpause = document.createElement( 'button' );
playpause.innerHTML = 'Begin';
playpause.addEventListener( 'click', z.init );
body.appendChild( playpause );

*/

var forget = document.createElement( 'button' );
forget.innerHTML = 'Reset';
forget.addEventListener( 'click', z.reset );
body.appendChild( forget );

var div = document.createElement( 'div' );
body.appendChild( div );

var logger = document.createElement( 'pre' )
body.appendChild( logger )


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
		hr: Math.floor( ms / 3600000 % 24 )
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



// start the sim

z.init();
