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
gpgpu.initProgram('sim', simShaderSource, [
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
gpgpu.initProgram('render', renderShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);
gpgpu.initProgram('interaction', interactionShaderSource, [
	{
		name: 'u_state',
		value: 0,
		dataType: 'INT',
	},
]);

// Set up interactions.
const TOUCH_RADIUS = 10;
canvas.addEventListener('mousemove', (e: MouseEvent) => {
	gpgpu.stepCircle('interaction', [e.clientX, e.clientY], TOUCH_RADIUS, ['currentState'], 'lastState');
});
canvas.addEventListener('touchmove', (e: TouchEvent) => {
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++) {
		const touch = e.touches[i];
		gpgpu.stepCircle('interaction', [touch.pageX, touch.pageY], TOUCH_RADIUS, ['currentState'], 'lastState');
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
	gpgpu.initTexture('currentState', width, height, 'float16', 3, true, undefined, true);
	gpgpu.initTexture('lastState', width, height, 'float16', 3, true, undefined, true);
	gpgpu.setProgramUniform('sim', 'u_pxSize', [1 / width, 1 / height], 'FLOAT');
	gpgpu.onResize(canvas);
}

// Start render loop.
window.requestAnimationFrame(step);
function step() {
	// Compute simulation.
	gpgpu.stepNonBoundary('sim', ['lastState'], 'currentState');
	// Render current state.
	gpgpu.step('render', ['currentState']);
	// Toggle textures.
	gpgpu.swapTextures('currentState', 'lastState');
	// Start a new render cycle.
	window.requestAnimationFrame(step);
}