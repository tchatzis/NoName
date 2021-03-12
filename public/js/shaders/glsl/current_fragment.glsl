varying vec2 vUv;

uniform float time;
uniform float power;

void main()
{
	vec3 p3 = vec3( vUv, time );
	vec2 uv = vUv * 2.0 - 1.0;

	float intensity = simplex3d_fractal( vec3( p3 * 4.0 ) );

	float t = clamp( ( -uv.x * uv.x * 0.2 ) + 0.2, 0.0, 1.0 );
	float y = abs( intensity * -t + uv.y );
	float g = pow( y, power );

	vec3 col = vec3( 1.00, 1.48, 1.78 );
	col = col * -g  + col;
	col = col * col * col * col;

	gl_FragColor = vec4( col, 1.0 );
}
