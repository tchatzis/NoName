uniform float alpha;
uniform float time;
uniform float speed;
uniform float scale;
uniform vec3 waterColor;
uniform sampler2D tDiffuse;
uniform float reflection;

varying vec4 vUv;
varying vec3 vCamera;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;

float blendOverlay( float base, float blend )
{
    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend )
{
    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

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
	p = mod( p, scale );

    f = f * f * ( 3.0 - 2.0 * f );

    float res = mix( mix( hash( p, 				 	  scale ),
						  hash( p + vec2( 1.0, 0.0 ), scale ), f.x ),
					 mix( hash( p + vec2( 0.0, 1.0 ), scale ),
						  hash( p + vec2( 1.0, 1.0 ), scale ), f.x ), f.y );
    return res;
}

float fbm( vec2 p )
{
	float f = 0.0;
	float s = scale;
    float a = 0.6;

    p = mod( p, s );

	for ( int i = 0; i < 4; i++ )
	{
		f += noise( p, s ) * a;
		a *= 0.5;
		s *= 2.0;
	}

	return min( f, 1.0 );
}

float round( float n )
{
	return sign( n ) * ( abs( n ) + 0.5 );
}

void main()
{
	float m = 2.0;
	vec2 p = vUv.xy / scale * m - m / 2.0;
		p = mod( p + m / 2.0, m ) - m / 2.0;

	vec2 q = vec2( 0.0 );
		q.x = fbm( p + time * speed ) * 0.37;
		q.y = fbm( p + time * speed ) * 0.23;

	vec2 r = vec2( 0.0 );
		r.x = fbm( p + q );
		r.y = fbm( p + q );

	vec4 base = texture2DProj( tDiffuse, vUv );
	vec3 diffuseLight = vec3( 0.1, 0.1, 0.1 );

	vec3 color = vec3( 0.0 );
		color = mix( color, waterColor, clamp( length( r.x ), 0.0, 1.0 ) );
		color = mix( color, waterColor, clamp( length( r.y ), 0.0, 1.0 ) );
		color = mix( diffuseLight + vColor, blendOverlay( base.rgb, color ), reflection );

	gl_FragColor = vec4( color, alpha );
}
