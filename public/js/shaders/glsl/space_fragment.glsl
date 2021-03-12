uniform float time;
uniform float speed;
uniform float scale;
uniform float brightness;
uniform float alpha;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

float fbm( vec2 p, float scale )
{
	float f = 0.0;
	float s = scale;
    float a = 0.5;

    p = mod( p, s );

	for ( int i = 0; i < 8; i++ )
	{
		f += noise( p, s ) * a;
		a *= 0.6;
		s *= 2.0;
	}

	return min( f, 1.0 );
}

vec3 PointLight( vec2 pos, vec2 p, vec3 col, float intensity )
{
	float d = distance( p, pos );

	return clamp( col * inversesqrt( d ) * intensity, 0.0, 1.0 );
}

void main()
{
	vec2 p = vUv * 2.0 - 1.0;
		p = mod( p + 1.0, 2.0 ) - 1.0;

	vec2 q = vec2( 0.0 );
		q.x = fbm( p + time * speed, scale );
		q.y = fbm( p + time * speed, scale );

	vec4 r = vec4( 0.0 );
		r.x = fbm( p + 0.19 * q, scale );
		r.y = fbm( p + 0.27 * q, scale );
		r.z = fbm( p + 0.33 * q, scale );

	float delta = ( sin( time ) + 1.0 ) / 2.0;
	float m1 = delta;
	float m2 = fbm( p + r.xy, scale );
	float m3 = fbm( p + r.xz, scale );


	vec3 starColor = vec3( 1.0, 1.0, 0.8 );
	vec4 color = vec4( 0.0 );
		color.rgb += mix( vec3( r.x, r.y * 0.5, 0.0 ), vec3( 0.0, r.y * 0.2, r.z ), m1 ) * brightness; // transition background orange to cyan
		color.rgb *= r.x * pow( r.y * 2.0, 4.0 ); // create clouds
		color.rgb += PointLight( r.xy, vec2( 0.5 ), vec3( delta * 0.5, 0.2, 0.2 ), ( delta * 0.117 ) + 0.5 ); // add colored highlights
		color.rgb += PointLight( r.yz, vec2( m2, m3 ), vec3( 0.1, 0.1, 0.05 ), 0.5 ); // yellow fissures

		// stars
		color.rgb += PointLight( vec2( sin( time ) * 0.5 - 0.5, sin( time ) * 0.2 - 0.3 ), p, starColor, 0.07 );
		color.rgb += PointLight( vec2( -0.7, 0.2 ), p, starColor, 0.03 );
		color.rgb += PointLight( vec2( 0.5, -0.1 ), p, starColor, 0.05 );
		color.rgb += PointLight( vec2( 0.7, -0.3 ), p, starColor, 0.03 );
		color.a = alpha;

	gl_FragColor = color * vec4( 0.5 - abs( p.y ) );
}
