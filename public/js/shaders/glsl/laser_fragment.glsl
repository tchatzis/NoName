uniform vec3 color;
uniform vec2 resolution;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

void main()
{
	float f = 2.0;
	vec2 uv = f * vUv - f / 2.0;
	float scale = 32.0;
	float m = noise( vec2( vPosition.x + time * 0.72, vPosition.y + time * 5.55 ), scale * 0.89 );
	float n = noise( vec2( vPosition.x + time * 0.57, vPosition.y + time * 6.63 ), scale * 0.98 );
	float o = m * n;
	float opacity = 1.0 / ( 1.0 - uv.y );

	vec3 vColor = color;
		vColor *= pow( n, m );

	gl_FragColor = vec4( vColor, opacity );
}
