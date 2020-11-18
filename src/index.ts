import { GLCompute } from 'glcompute';
import MicroModal from 'micromodal';
const simShaderSource = require('./kernels/SimShader.glsl');
const renderShaderSource = require('./kernels/RenderShader.glsl');
const interactionShaderSource = require('./kernels/InteractionShader.glsl');

// Init help modal.
MicroModal.init();

const canvas = document.getElementById('glcanvas')  as HTMLCanvasElement;
const glcompute = new GLCompute(null, canvas, { antialias: true }, (message: string) => {
	// Show error modal.
	MicroModal.show('modal-2');
	const errorEl = document.getElementById('glErrorMsg');
	if (errorEl) errorEl.innerHTML =`Error: ${message}`;
	const coverImg = document.getElementById('coverImg');
	if (coverImg) coverImg.style.display = 'block';
});

// Init programs.
const sim = glcompute.initProgram('sim', simShaderSource, [
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
const render = glcompute.initProgram('render', renderShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);
const interaction = glcompute.initProgram('interaction', interactionShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);

// Init state.
const state = glcompute.initDataLayer('state', {
	dimensions: [ canvas.clientWidth, canvas.clientHeight ],
	type: 'float16',
	numComponents: 3,
}, true, 2);

// Set up interactions.
const TOUCH_RADIUS = 10;
canvas.addEventListener('mousemove', (e: MouseEvent) => {
	glcompute.stepCircle(interaction, [e.clientX, canvas.clientHeight - e.clientY], TOUCH_RADIUS, [state], state);
});
canvas.addEventListener('touchmove', (e: TouchEvent) => {
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++) {
		const touch = e.touches[i];
		glcompute.stepCircle(interaction, [touch.pageX, canvas.clientHeight - touch.pageY], TOUCH_RADIUS, [state], state);
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
	state.resize([width, height]);
	sim.setUniform('u_pxSize', [1 / width, 1 / height], 'FLOAT');
	glcompute.onResize(canvas);
}

// Start render loop.
window.requestAnimationFrame(step);
function step() {
	// Compute simulation.
	// Ony step the interior px, we can leave the boundary static at zero.
	glcompute.stepNonBoundary(sim, [state], state);
	// Render current state.
	glcompute.step(render, [state]);
	// Start a new render cycle.
	window.requestAnimationFrame(step);
}