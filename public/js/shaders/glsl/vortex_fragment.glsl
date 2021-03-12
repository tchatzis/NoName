varying vec2 vUv;
varying vec3 vPosition;
varying float vLifespan;

uniform sampler2D map;
uniform float time;

void main()
{
	float elapsed = time / vLifespan;
    float opacity = 1.0 - clamp( elapsed, 0.0, 1.0 );

	vec4 color = texture2D( map, vUv );

	gl_FragColor = vec4( color.rgb, opacity );
}