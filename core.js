console.log('ready')

// globals

var up = 0, time = 0, running = false;

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
		window.requestAnimationFrame(update);
		running = true;
		button.innerHTML = "Pause";
	} else {
		window.cancelAnimationFrame(update);
		running = false;
		button.innerHTML = "Resume";
	}
}

function update() {
	tick();
	render();
	if (running) window.requestAnimationFrame(update);
}

function tick() {
	var del = 0, past = time;

	time = Date.now();
	del = time - past;
	up = up + del;
}

function render() {
	var seconds = Math.floor(up / 1000),
    cos1 = Math.cos(up / 1400).toFixed(2),
    cos2 = Math.cos(up / 350).toFixed(2),
    cos3 = Math.cos(up / 5600).toFixed(2);
    

	div.innerHTML = p(running) + " " + p(seconds) + p(cos1) + p(cos2) + p(cos3);
}

function p(content) {
	return "<p>" + content + "</p>";
}

//function roll() {}

init();
