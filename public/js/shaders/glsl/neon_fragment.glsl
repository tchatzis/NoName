uniform vec3 color;
uniform float time;

varying vec2 vUv;

void main()
{
	float f = 2.0;
	vec2 uv = f * vUv - f / 2.0;

	float delta = abs( sin( time ) ) * 60.0 + 60.0;
	float opacity = noise( vec2( delta, time ) * uv, 2.0 );
	opacity = 0.3 + 0.5 * opacity;

	gl_FragColor = vec4( color, opacity );
}
