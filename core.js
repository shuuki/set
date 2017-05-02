console.log('ready')

// globals

var up = 0,
	time = 0,
	running = false,
	luminosity,
	cache = {};


// elements

var body = document.getElementsByTagName('body')[0];

var playpause = document.createElement('button');
playpause.innerHTML = 'Begin';
playpause.addEventListener('click', init);

var forget = document.createElement('button');
forget.innerHTML = 'Reset';
forget.addEventListener('click', reset);


var div = document.createElement('div');

var pre = document.createElement('pre');

body.appendChild(playpause);
body.appendChild(forget);
body.appendChild(div);
body.appendChild(pre);



// steps

function init() {
	time = Date.now();
	if (!running) {
		window.requestAnimationFrame(update)    
		running = true;
		playpause.innerHTML = 'Pause';
	} else {
		window.cancelAnimationFrame(update)
		running = false;
		playpause.innerHTML = 'Resume';
	}
	load()
}

function update() {
  if (running) window.requestAnimationFrame(update)
	inputs()
	tick()
	render()
	save()
}


function inputs() {
	
}

function tick() {
	var del = 0,
    past = time;

	time = Date.now();
	del = time - past;
	up = up + del;
}


function clocks(time) {
	var clock = {};
		clock.ms = Math.floor(time % 1000);
		clock.sec = Math.floor((time/1000)%60);
		clock.min = Math.floor((time/(1000*60))%60);
		clock.hr = Math.floor((time/(1000*60*60))%24);
		clock.up = Math.floor(up/1000);
	return clock;
}


function beats(time) {
	var beat = [];
	
		beat[0] = ((Math.sin(time / 500)+1)/2).toFixed(3),
		beat[1] = ((Math.sin(time / 125)+1)/2).toFixed(3),
		beat[2] = ((Math.sin(time / 2000)+1)/2).toFixed(3);
		return beat;
}


function render() {

	var c = clocks(up);
	var b = beats(up);

	
	div.innerHTML = 
		p('Running: '+running) 
		+ ' ' 
		//+ p('Luminosity: '+luminosity)
		+ p('Uptime: ' + up)
		+ p(c.hr + ' hr : ' + c.min + ' min : ' + c.sec + ' sec')
		+ p(b[0]) 
		+ p(b[1]) 
		+ p(b[2]);
		
		// 28 days beat: 28*24*60*60*1000

  pre.innerHTML = linegen(b[0], b[1], b[2]);

}

function p(content) {
	return '<p>' + content + '</p>';
}


function save() {
	cache = { 
		time: up
	};
	window.localStorage.setItem('SETPOINT', JSON.stringify(cache));
}

function load() {
	if (localStorage.getItem('SETPOINT')) {
		cache = JSON.parse(localStorage.getItem('SETPOINT'));
		up = cache.time
	}
}

function reset() {
	if (localStorage.getItem('SETPOINT')) {
		localStorage.removeItem('SETPOINT');
		up = 0
	}
}


//function roll() {}

init();










function linegen(bar1,bar2,bar3) {
  
  var px1 = Math.floor(bar1*40),
    px2 = Math.floor(bar2*40),
    px3 = Math.floor(bar3*40);
  
  var foo = []
  for (var x = 0; x < 41; x++) {
    if (px1 === x || px2 === x || px3 === x)
      foo.push('*')
    else
      foo.push(' ')
		if (x === 40)
			foo.push('\n')
  }
  //for (var y = 0; y < 25; y++){for (var x = 0; x < 40; x++){foo.push('*')}foo.push('\n')}
  return foo.join('')
}






// changes mode ambient light sensor
// only works on firefox

/*

var s = new AmbientLightSensor();
s.start();
s.onchange = event => alert(event.reading.illuminance); 
s.stop();

*/

window.addEventListener('devicelight', function (event) {
	luminosity = event.value;
	console.log(luminosity)
	//event.value is the lux value returned by the sensor on the device
	if (event.value < 100) {
		document.body.style.backgroundColor='#777';
		document.body.style.color='#fff';
	} else {
		document.body.style.backgroundColor='#fff';
	}

});







// scenes ---------------------

var scene = {}


scene.active = 0

scene.update = {}

scene.draw = {}

scene.updates = () => {
	if (typeof scene.update[scene.active] === 'function' ) scene.update[scene.active]()
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
