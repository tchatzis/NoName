varying vec2 vUv;

uniform float time;
uniform float power;
uniform vec3 color;

void main()
{
	vec3 p3 = vec3( vUv, time );
	vec2 uv = vUv * 2.0 - 1.0;

	float intensity = simplex3d_fractal( vec3( p3 * 4.0 ) );

	float t = clamp( ( -uv.x * uv.x * 0.2 ) + 0.2, 0.0, 1.0 );
	float y = abs( intensity * -t + uv.y );
	float g = pow( y, power );

	float s = clamp( ( -uv.y * uv.y * 0.2 ) + 0.2, 0.0, 1.0 );
	float x = abs( intensity * -s + uv.x );
	float h = pow( x, power );

	vec3 col = color * 2.0;
	col = col * -( h - g );
	col = col * col * col * col;

	gl_FragColor = vec4( col, 1.0 );
}
