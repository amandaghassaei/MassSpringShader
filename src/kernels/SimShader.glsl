precision mediump float;

#define K 2.0
#define D 1.0
#define DT 1.0
#define MASS 10.0

varying vec2 uv;
uniform sampler2D u_state; // position, velocity, externalForces = r, g, b
uniform vec2 u_pxSize;

void main() {

	vec3 currentState = texture2D(u_state, uv).xyz;
	float currentPosition = currentState.x;
	float currentVelocity = currentState.y;
	float fTotal = currentState.z;

	// Get interactions with N, S, E, W neighbors.
	for (int i = -1; i <= 1; i += 2) {
		for (int j = -1; j <= 1; j += 2) {
			// Calculate uv coordinate of neighbor px.
			vec2 neighborUV = uv + vec2(u_pxSize.x * float(i), u_pxSize.y * float(j));
			// Apply spring damper constraint.
			vec2 neighborState = texture2D(u_state, neighborUV).xy;
			float deltaP =  neighborState.x - currentPosition;
			float deltaV = neighborState.y - currentVelocity;
			fTotal += K * deltaP + D * deltaV;
		}
	}

	float acceleration = fTotal / MASS;
	float velocity = acceleration * DT + currentVelocity;
	float position = velocity * DT + currentPosition;

	gl_FragColor = vec4(position, velocity, 0, 0);
}