console.log('ready')

// globals

var up = 0, time = 0, running = false, luminosity;

// elements

var body = document.getElementsByTagName("body")[0];

var button = document.createElement("button");
button.innerHTML = "Begin";
button.addEventListener("click", init);

var div = document.createElement("div");

var pre = document.createElement("pre");

body.appendChild(button);
body.appendChild(div);
body.appendChild(pre);





// steps

function init() {
	time = Date.now();
	if (!running) {
		window.requestAnimationFrame(update)    
		running = true;
		button.innerHTML = "Pause";
	} else {
		window.cancelAnimationFrame(update)
		running = false;
		button.innerHTML = "Resume";
	}
}

function update() {
  if (running)
    window.requestAnimationFrame(update)
	tick()
	render()
}

function tick() {
	var del = 0,
    past = time;

	time = Date.now();
	del = time - past;
	up = up + del;
}

function render() {
	var seconds = Math.floor(up / 1000),
    beat1 = ((Math.sin(up / 1000)+1)/2).toFixed(2),
    beat2 = ((Math.sin(up / 250)+1)/2).toFixed(2),
    beat3 = ((Math.sin(up / 4000)+1)/2).toFixed(2);
    

	div.innerHTML = p('Running: '+running) + " " + p('Luminosity: '+luminosity)+ p('Seconds: '+seconds) + p(beat1) + p(beat2) + p(beat3);
  pre.innerHTML = linegen(beat1,beat2,beat3);
}

function p(content) {
	return "<p>" + content + "</p>";
}

//function roll() {}

init();



/*

var s = new AmbientLightSensor();
s.start();
s.onchange = event => alert(event.reading.illuminance); 
s.stop();

*/

window.addEventListener("devicelight", function (event) {
	luminosity = event.value;
	console.log(luminosity)
	
	//event.value is the lux value returned by the sensor on the device
	if (event.value < 100) {
		bodyBg.backgroundColor="#888";
	} else {
		bodyBg.backgroundColor="#fff";
	}

});



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










// scenes ---------------------

var scene = {}


scene.active = 0

scene.update = {}

scene.draw = {}

scene.updates = () => {
	if (typeof scene.update[scene.active] === "function" )
    scene.update[scene.active]()
}

scene.drawing = () => {
	if (typeof scene.draw[scene.active] === "function" )
    scene.draw[scene.active]()
}

scene.reset = () => {
  if (scene.active != 0)
	 scene.active = 0
}

scene.cycle = () => {
	if (scene.active < scene.draw.length)
    scene.active += 1
	 else
    scene.active = 0
}
