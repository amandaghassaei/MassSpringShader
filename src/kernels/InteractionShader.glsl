precision mediump float;

varying vec2 uv;
uniform sampler2D u_state;

void main() {
	vec2 currentState = texture2D(u_state, uv).xy;
	// Add external force to current px.
	gl_FragColor = vec4(currentState, -5.0, 0);
}