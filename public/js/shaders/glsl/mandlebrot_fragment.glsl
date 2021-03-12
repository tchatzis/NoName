uniform float time;
uniform float opacity;
uniform float iterations;
uniform vec3 palette;
uniform vec3 pan;

varying vec2 vUv;

const float max_its = 512.0;

float mandelbrot( vec2 z )
{
	vec2 c = z;

	for( float i= -max_its; i < max_its; i++ )
	{
		if ( i > iterations ) break;

		if( dot( z, z ) > 4.0 ) return i;
		z = vec2( ( z.x * z.x - z.y * z.y ), 2.0 * z.x * z.y ) + c;
	}

	return normalize( max_its );
}

void main()
{
	float zoom = pow( 2.0, pan.z );
	vec2 p = ( ( vUv * 2.0 - 1.0 ) ) * zoom + pan.xy;
	float n = mandelbrot( p );
	float m = n / min( iterations, max_its );

	vec3 color = vec3( 0.0 );
		color += ( 1.0 + cos( n * 0.1 + palette ) ) * 0.5;

	gl_FragColor = vec4( color, opacity );
}