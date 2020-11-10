precision mediump float;

varying vec2 vUV;
uniform sampler2D u_state;

void main() {
	float position = texture2D(u_state, vUV).r / 20.0 + 0.5;
	if (position > 1.0) position = 1.0;
	if (position < 0.0) position = 0.0;

	if (position < 0.5){
		position *= 2.0;
		//position = 0 -> blue
		//position = 1 -> magenta
		gl_FragColor = vec4((255.0*position)/255.0,(179.0*(1.0-position))/255.0,(150.0-54.0*position)/255.0,1.0);
	} else {
		position -= 0.5;
		position *= 2.0;
		//position = 0 -> magenta
		//position = 1 -> white
		gl_FragColor = vec4((255.0-(10.0*position))/255.0,(223.0*position)/255.0,(106.0+(67.0*position))/255.0,1.0);
	}
}