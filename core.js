console.log('ready')
location.reload(true)

// globals

var up = 0, time = 0, running = false;

// elements

var body = document.getElementsByTagName("body")[0];

var button = document.createElement("button");
button.innerHTML = "Begin";
body.appendChild(button);
button.addEventListener("click", init);

var div = document.createElement("div");
body.appendChild(div);

var pre = document.createElement("pre");
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
	var seconds = Math.floor(up / 1000), cosy = Math.cos(up / 1400).toFixed(2);

	div.innerHTML = p(running) + " " + p(seconds) + p(cosy);
}

function p(content) {
	return "<p>" + content + "</p>";
}

//function roll() {}

init();
