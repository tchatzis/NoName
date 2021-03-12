varying vec2 vUv;
varying vec3 vPosition;
varying float vLifespan;
varying float vDecay;
varying vec3 vDistance;

uniform sampler2D map;
uniform float time;
uniform vec2 resolution;
uniform float saturation;

void main()
{
	float elapsed = time / vLifespan;
	float remaining = clamp( 1.0 - elapsed, 0.0, 1.0 ) * vDecay;
	float opacity = clamp( 0.2 * remaining, 0.0, 1.0 );

	vec4 color = texture2D( map, vUv );
		color = GrayscaleAmount( color, sqrt( elapsed * ( 1.0 - saturation ) ) );

	gl_FragColor = vec4( color.rgb, opacity );
}