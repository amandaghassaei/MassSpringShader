import { GPGPU } from 'webgl-gpgpu';
import MicroModal from 'micromodal';
const simShaderSource = require('./kernels/SimShader.glsl');
const renderShaderSource = require('./kernels/RenderShader.glsl');
const interactionShaderSource = require('./kernels/InteractionShader.glsl');

// Init help modal.
MicroModal.init();

const canvas = document.getElementById('glcanvas')  as HTMLCanvasElement;
const gpgpu = new GPGPU(null, canvas, (message: string) => {
	// Show error modal.
	MicroModal.show('modal-2');
	const errorEl = document.getElementById('glErrorMsg');
	if (errorEl) errorEl.innerHTML =`Error: ${message}`;
	const coverImg = document.getElementById('coverImg');
	if (coverImg) coverImg.style.display = 'block';
});

// Init programs.
const sim = gpgpu.initProgram('sim', simShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
	{
		name: 'u_pxSize',
		value: [1 / canvas.clientWidth, 1 / canvas.clientHeight],
		dataType: 'FLOAT',
	},
]);
const render = gpgpu.initProgram('render', renderShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);
const interaction = gpgpu.initProgram('interaction', interactionShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);

// Init state.
const state = gpgpu.initDataLayer('state', {
	width: canvas.clientWidth,
	height: canvas.clientHeight,
	type: 'float16',
	numChannels: 3,
}, true, 2);

// Set up interactions.
const TOUCH_RADIUS = 10;
canvas.addEventListener('mousemove', (e: MouseEvent) => {
	gpgpu.stepCircle(interaction, [e.clientX, e.clientY], TOUCH_RADIUS, [state], state);
});
canvas.addEventListener('touchmove', (e: TouchEvent) => {
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++) {
		const touch = e.touches[i];
		gpgpu.stepCircle(interaction, [touch.pageX, touch.pageY], TOUCH_RADIUS, [state], state);
	}
});
// Disable other gestures.
document.addEventListener('gesturestart', disableZoom);
document.addEventListener('gesturechange', disableZoom); 
document.addEventListener('gestureend', disableZoom);
function disableZoom(e: Event) {
	e.preventDefault();
	const scale = 'scale(1)';
	// @ts-ignore
	document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
	// @ts-ignore
	document.body.style.msTransform =   scale;       // IE 9
	document.body.style.transform = scale;
}

// Add resize listener.
onResize();
window.addEventListener('resize', onResize);
function onResize() {
	// Re-init textures at new size.
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	state.resize(width, height);
	sim.setUniform('u_pxSize', [1 / width, 1 / height], 'FLOAT');
	gpgpu.onResize(canvas);
}

// Start render loop.
window.requestAnimationFrame(step);
function step() {
	// Compute simulation.
	// Ony step the interior px, we can leave the boundary static at zero.
	gpgpu.stepNonBoundary(sim, [state], state);
	// Render current state.
	gpgpu.step(render, [state]);
	// Start a new render cycle.
	window.requestAnimationFrame(step);
}