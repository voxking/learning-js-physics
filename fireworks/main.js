(function () {
"use strict";

const NUM_PARTICLES = 500;

class Particle {
	constructor() {
		this.position = vec2.create();
		this.velocity = vec2.create();
		this.mass     = 3.0;
		this.age      = 100 + ((Math.random() * 100)|0);
	}
}

let particles = window.particles = [];
let center = vec2.create();

function computeForce(particle) {
	return vec2.set(vec2.create(), 0, particle.mass * 9.81);
}

let canvas  = document.createElement("canvas");
let context = window.context = canvas.getContext("2d");

let fire = new Image();
fire.src = "fire.png";

canvas.height = canvas.width = 800;

let fpsText = document.createElement("output");
fpsText.classList.add("FPS");

document.body.appendChild(canvas);

document.body.appendChild(fpsText);

function update(dt) {
	let removed = [];
	for (let i = 0; i < particles.length; ++i) {
        let particle = particles[i];
        let force = computeForce(particle);
        let acceleration = vec2.set(vec2.create(), force[0] / particle.mass, force[1] / particle.mass);
        particle.velocity[0] += acceleration[0] * dt;
        particle.velocity[1] += acceleration[1] * dt;

        if (particle.position[1] > 800 && particle.velocity[1] > 0) {
        	particle.velocity[1] *= -0.25;
        	particle.velocity[0] *= 0.25;
        	particle.age = (particle.age * 0.3)| 0;
        }

        if (
        	(particle.position[0] > 800 && particle.velocity[0] > 0) ||
        	(particle.position[0] < 0 && particle.velocity[0] < 0)
        ) {
        	particle.velocity[0] *= -0.75;
        }

        particle.position[0] += particle.velocity[0] * dt;
        particle.position[1] += particle.velocity[1] * dt;
        particle.age--;
        if (particle.age <= 0) removed.push(i);
    }
    for (let i = 0; i < removed.length; i++) {
    	particles.splice(removed[i], 1);
    }
}

const THO = Math.PI * 2;

function render() {
	context.globalCompositeOperation = "lighter";
	for (let i = 0; i < particles.length; ++i) {
        let particle = particles[i];
		context.drawImage(fire, particle.position[0] - 3, particle.position[1] - 3);
    }
}

let last = 0;
function run(t) {
	let dt = (t - last) / 100;
	context.globalCompositeOperation = "source-over";
	context.fillRect(0, 0, 800, 800);
	update(dt);
	render();
	last = t;
	fpsText.value = (10/dt).toFixed(0);
	requestAnimationFrame(run, canvas);
}

requestAnimationFrame(run, canvas);

function fireworks(x, y) {
	for (let i = 0; i < NUM_PARTICLES; i++) {
		let particle = new Particle;
		vec2.set(particle.position, x, y);
		vec2.random(particle.velocity, 30 * Math.random())
		particles.push(particle);
	}
}

function randomFireworks() {
	for (var n = (Math.random()*5 + 1 |0); n >= 0 ; n--) {
		fireworks(Math.random() * 600 + 100, Math.random() * 300 + 100);
	}
}

setInterval(randomFireworks, 3000)

canvas.addEventListener("click", function (e) {
	let rect = canvas.getBoundingClientRect();
	let x = (e.clientX-rect.left)/(rect.right-rect.left)*canvas.width |0;
	let y = (e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.width |0;
	fireworks(x, y);
}, false);

}())