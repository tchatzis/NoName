uniform vec3 glowColor;
uniform float opacity;
uniform float time;

varying float vIntensity;
varying vec3 vPosition;
varying vec2 vUv;

void main()
{
	float scale = 8.0;
	float m = noise( vec2( vPosition.x + time * 0.72, vPosition.y + time * 0.55 ), scale * 0.89 );
	float n = noise( vec2( vPosition.x + time * 0.57, vPosition.y + time * 0.63 ), scale * 0.98 );
	float o = m * n;

	vec4 glow = vec4( glowColor * vIntensity, opacity );
		glow.r += m;
		glow.g -= n;
		glow.b -= o;
		glow.a += pow( n, m );

	gl_FragColor = clamp( glow, 0.0, 1.0 );
}
