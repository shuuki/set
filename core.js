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
	var clock = {}
	clock.ms = Math.floor(time % 1000)
	clock.sec = Math.floor((time/1000)%60)
	clock.min = Math.floor((time/(1000*60))%60)
	clock.hr = Math.floor((time/(1000*60*60))%24)
	clock.up = Math.floor(up/1000)
	return clock
}


function beats(time) {
	var beat = []
	beat[0] = ((Math.sin(time / 500)+1)/2).toFixed(3)
	beat[1] = ((Math.sin(time / 125)+1)/2).toFixed(3)
	beat[2] = ((Math.sin(time / 2000)+1)/2).toFixed(3)
	beat[3] = ((Math.sin(time / (24*60*60*1000))+1)/2).toFixed(3)
	// more http://www.sengpielaudio.com/calculator-bpmtempotime.htm
	return beat
}


function render() {

	var c = clocks(up);
	var b = beats(up);

	
	div.innerHTML = 
		p('Running: '+running) 
		+ ' ' 
		//+ p('Luminosity: '+luminosity)
		+ p('Uptime: ' + up)
		+ p(c.hr + ' hr : ' + c.min + ' min : ' + c.sec + ' sec');

  pre.innerHTML = display(b) ;
	//p(b.join(', '))
	

}

function p(content) {
	return '<p>' + content + '</p>';
}





//function roll() {}

init();


var screen = [];


function display(n) {
	
	
	screen.push (linegen(n))
	
	if (screen.length > 50) screen = screen.splice(1,50)
	
	return screen
}


function linegen(bar) {
  
	
	var px = [];
	
	bar.forEach(function(n) { px[Math.floor(n*40)] = true })
	  
  var foo = []
  for (var x = 0; x < 41; x++) {
    if (px[x])
      foo.push('#')//█
    else
      foo.push(' ')
		if (x === 40)
			foo.push('\n')
  }
  //for (var y = 0; y < 25; y++){for (var x = 0; x < 40; x++){foo.push('*')}foo.push('\n')}
  return foo.join('')
}





// save+load using localStorage

function save() {
	cache = { time: up };
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
		document.body.style.backgroundColor='#000';
		document.body.style.color='#fff';
	} else {
		document.body.style.backgroundColor='#fff';
		document.body.style.color='#000';
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
