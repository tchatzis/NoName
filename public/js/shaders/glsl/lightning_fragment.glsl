uniform float time;
uniform float offset;
uniform vec3  palette;
uniform float noise;
uniform float amount;
uniform float spread;
uniform float power;
uniform float zoom;
uniform float pos;
uniform float clouds;
uniform float decay;
uniform float alpha;

varying vec2 vUv;

vec3 exponent( vec3 v, float e )
{
	return vec3( pow( v.x, e ), pow( v.y, e ), pow( v.z, e ) );
}

void main()
{
	vec2 p = ( vUv * 2.0 - 1.0 + vec2( pos, 0.0 ) ) * zoom;
		p.x = mod( p.x + 1.0, 2.0 ) - 1.0;

	float uAlpha = alpha;
	float intensity = simplex3d_fractal( vec3( p, time * offset ) * noise );
	float y = abs( intensity * amount + p.x / spread );

	vec3 color = vec3( 1.0 );
		color += palette;
		color *= ( 1.0 - pow( y, power ) );
		color = exponent( color, 3.0 );
		color += p.y * clouds;

		uAlpha -= time * decay;

	gl_FragColor = vec4( color, clamp( uAlpha, 0.0, 1.0 ) );
}
