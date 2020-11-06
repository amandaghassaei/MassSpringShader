import { GPGPU } from 'webgl-gpgpu';
const simShaderSource = require('./kernels/SimShader.glsl');
const renderShaderSource = require('./kernels/RenderShader.glsl');
const interactionShaderSource = require('./kernels/InteractionShader.glsl');

const canvas = document.getElementById('glcanvas')  as HTMLCanvasElement;
const gpgpu = new GPGPU(null, canvas);

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
window.onmousemove = (e: MouseEvent) => {
	gpgpu.stepCircle('interaction', [e.clientX, e.clientY], TOUCH_RADIUS, ['currentState'], 'lastState');
};
window.ontouchmove = (e: TouchEvent) => {
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++) {
		const touch = e.touches[i];
		gpgpu.stepCircle('interaction', [touch.pageX, touch.pageY], TOUCH_RADIUS, ['currentState'], 'lastState');
	}
};
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

window.addEventListener('resize', onResize);
onResize();
window.requestAnimationFrame(step);

function onResize() {
	// Re-init textures at new size.
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	gpgpu.initTexture('currentState', width, height, 'float16', 3, true, undefined, true);
	gpgpu.initTexture('lastState', width, height, 'float16', 3, true, undefined, true);
	gpgpu.setProgramUniform('sim', 'u_pxSize', [1 / width, 1 / height], 'FLOAT');
	gpgpu.onResize(canvas);
}

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