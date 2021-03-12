uniform float time;
uniform float speed;
uniform float scale;
uniform float brightness;
uniform float alpha;

varying vec3 vPosition;
varying vec2 vUv;

float fbm( vec2 p, float scale )
{
	float f = 0.0;
	float s = scale;
    float a = 0.6;

    p = mod( p, s );

	for ( int i = 0; i < 16; i++ )
	{
		f += noise( p, s ) * a;
		a *= 0.5;
		s *= 2.0;
	}

	return min( f, 1.0 );
}

void main()
{
	vec2 p = vUv * 2.0 - 1.0;
		p = mod( p + 1.0, 2.0 ) - 1.0;

	vec2 q = vec2( 0.0 );
		q.x = fbm( p - time * speed, scale );
		q.y = fbm( p - time * speed, scale );

	vec2 r = vec2( 0.0 );
		r.x = fbm( p + 0.25 * q, scale );
		r.y = fbm( p + 0.23 * q, scale );

	float f = fbm( p + r, scale );

	vec4 color = vec4( 0.529, 0.608, 0.622, 1.0 );

	color += r.y * pow( r.x * 2.5, 3.0 ) * brightness;
	color *= ( f * f * f + 0.6 * f * f + 0.5 * f );
	color *= vec4( 0.9 - abs( p.y ) );
	color += vec4( 0.529, 0.808, 0.922, 1.0 ) * brightness;
	color.a = alpha;

	gl_FragColor = clamp( color, 0.0, 1.0 );
}
