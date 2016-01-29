(function () {
"use strict";

const NUM_RIGID_BODIES = 100;

class BoxShape {
	constructor() {
		this.width  = 10.0,
		this.height = 10.0,
		this.mass   = 10.0;
	}

	get moI() {
		let w = this.width,
			h = this.height,
			m = this.mass;
		return m * (w * w + h * h) / 12;
	}
}

class RigidBody {
	constructor() {
		this.position  = vec2.create();
		this.velocity  = vec2.create();
		this.angle     = 0.0;
		this.aVelocity = 0.0;
		this.force     = vec2.create();
		this.torque    = 0.0;
		this.shape     = new BoxShape();
	}

	computeForceAndTorque() {
		vec2.set(this.force, 0, 100);
		let r = vec2.set(vec2.create(), this.shape.width / 2, this.shape.height / 2);
		this.torque = r[0] * this.force[1] - r[1] * this.force[0];
	}
}

let rBodies = window.rBodies = [];

let canvas  = document.createElement("canvas");
let context = window.context = canvas.getContext("2d");

canvas.height = canvas.width = 800;

let fpsText = document.createElement("output");
fpsText.classList.add("FPS");

document.body.appendChild(canvas);
document.body.appendChild(fpsText);

function update(dt) {
	for (let i = 0; i < rBodies.length; ++i) {
		let rBody = rBodies[i];
		rBody.computeForceAndTorque();
		let acceleration = vec2.set(vec2.create(), rBody.force[0] / rBody.shape.mass, rBody.force[1] / rBody.shape.mass);
		rBody.velocity[0] += acceleration[0] * dt;
		rBody.velocity[1] += acceleration[1] * dt;
		let aVelocity = rBody.torque / rBody.shape.moI;
		rBody.aVelocity += aVelocity * dt;

		if (
			(rBody.position[1] > 800 && rBody.velocity[1] > 0)
		) {
			rBody.velocity[1] *= -0.75;
			// rBody.aVelocity *= -2;
		}

		if (
			(rBody.position[0] > 800 && rBody.velocity[0] > 0) ||
			(rBody.position[0] < 0 && rBody.velocity[0] < 0)
		) {
			rBody.velocity[0] *= -0.5;
			// rBody.aVelocity *= -2;
		}

		rBody.position[0] += rBody.velocity[0] * dt;
		rBody.position[1] += rBody.velocity[1] * dt;
		rBody.angle += rBody.aVelocity * dt;
	}
}

function render() {
	for (let i = 0; i < rBodies.length; ++i) {
		let rBody = rBodies[i];

		let w = rBody.shape.width;
		let h = rBody.shape.height;

		context.save();

		context.translate(rBody.position[0], rBody.position[1]);

		context.rotate(rBody.angle);

		context.strokeRect(-w/2, -h/2, w, h);

		context.restore();
	}
}

const PI2 = Math.PI * 2;

function randomizeRigidBody(rBody) {
	vec2.set(rBody.position, 100 + Math.random() * 600, 100 + Math.random() * 600);
	vec2.random(rBody.velocity, 10 + 30 * Math.random())
	rBody.angle = Math.random() * PI2;
	rBody.shape.width = 10 + Math.random() * 20;
	rBody.shape.height = 10 + Math.random() * 20;
}

context.strokeStyle = "hsl(163, 100%, 50%)";

let last = 0;
function run(t) {
	let dt = (t - last) / 100;
	context.fillRect(0, 0, 800, 800);
	update(dt / 2);
	render();
	last = t;
	fpsText.value = (10/dt).toFixed(0);
	requestAnimationFrame(run, canvas);
}

requestAnimationFrame(run, canvas);

let instruction = document.createElement("footer");
instruction.textContent = "Click to start the simulation";
document.body.appendChild(instruction);

let clicked = false;
canvas.addEventListener("click", function (e) {
	if (!clicked) {
		instruction.hidden = true;
		clicked = true;
		for (let i = 0; i < NUM_RIGID_BODIES; ++i) {
			let rBody = new RigidBody;
			randomizeRigidBody(rBody);
			rBodies.push(rBody);
		}
	}
}, false);

}())