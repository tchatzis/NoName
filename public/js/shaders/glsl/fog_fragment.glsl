uniform float time;
uniform float alpha;
uniform float speed;
uniform float contrast;
uniform float brightness;

varying vec2 vUv;

float hash( vec2 p, float scale)
{
	p = mod( p, scale );

	return fract( sin( dot( p, vec2( 27.16898, 38.90563 ) ) ) * 5151.5473453 );
}

float noise( vec2 p, float scale )
{
	vec2 f;

	p *= scale;
	f = fract( p );
    p = floor( p );

    f = f * f * ( 3.0 - 2.0 * f );

    float res = mix( mix( hash( p, 				 	  scale ),
						  hash( p + vec2( 1.0, 0.0 ), scale ), f.x ),
					 mix( hash( p + vec2( 0.0, 1.0 ), scale ),
						  hash( p + vec2( 1.0, 1.0 ), scale ), f.x ), f.y );
    return res;
}

float fbm( vec2 p )
{
	float f 	= 0.0;
	float scale = 10.0;
    float amp   = 0.6;

    p = mod( p, scale );

	for ( int i = 0; i < 16; i++ )
	{
		f += noise( p, scale ) * amp;
		amp *= 0.5;
		scale *= 2.0;
	}

	return min( f, 1.0 );
}

void main()
{
	vec2 p = vUv * 2.0 - 1.0;
		p.x = mod( p.x + 1.0, 2.0 ) - 1.0;

	vec2 q = vec2( 0.0 );
		q.x = fbm( p );
		q.y = fbm( p );

	vec2 r = vec2( 0.0 );
		r.x = fbm( p + 0.25 * q + time * speed );
		r.y = fbm( p + 0.23 * q + time * speed );

	float f = fbm( p + r );

	vec4 color = mix(
		vec4( 0, 0, 0, 1.0 ),
		vec4( 0.5, 0.5, 0.5, 1.0 ),
		clamp( length( r.x ) * 0.25, 0.0, 1.0 )
	);

	color = color * max( contrast, 0.0 ) + 0.5;
	color += brightness;
	color.a = alpha;

	gl_FragColor = color * vec4( 0.95 - abs( p.y ) );
}
