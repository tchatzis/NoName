precision highp float;

uniform vec2 resolution;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 cameraWorldMatrix;
uniform mat4 cameraProjectionMatrixInverse;
uniform vec3 lightPos;
uniform float size;
uniform float scale;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 fogColor;
uniform float fogExp;
uniform float fogCoeff;
uniform float time;
uniform float far;
uniform vec3 background;
uniform vec2 limits;

const float EPS = 0.0001;
const float OFFSET = 1.0 / EPS;

float occlusion( vec3 p, vec3 n, float d )
{
    float ao = 1.0;
    float w = 250.0;
    float dist = 2.0 * EPS;

    for ( int i = 0; i < 5; i++ )
    {
        ao -= ( dist - d ) * w;
        w *= 0.5;
        dist = dist * 2.0 - EPS;
    }

    return clamp( ao, 0.0, 1.0 );
}

float mandlebox( vec3 p, out vec3 outColor )
{
    const int iters = 6;
    float MR2 = size; // minimum radius
    vec4 s = vec4( vec3( -scale ), scale ) / MR2;
    float C1 = abs( 1.0 + scale );
    float C2 = pow( scale, float( 1 - iters ) );
    vec4 vector = vec4( p.xyz, 1.0 );
    vec4 p0 = vec4( p.xyz, 1.0 );
    float r2;
    float trap = 1.0;
    vec2 c;

    for ( int i = 0; i < iters; i++ )
    {
        vector.xyz = clamp( vector.xyz, -1.0, 1.0 ) * 2.0 - vector.xyz;
        r2 = dot( vector.xyz, vector.xyz );
        vector *= clamp( max( MR2 / r2, MR2 ), limits.x, limits.y );
        vector = vector * s + p0;

        c = clamp( vec2( 0.33 * sin( time ) * log( r2 ) - 1.0, sqrt( trap ) ), 0.0, 1.0 );
        outColor = mix( mix( color1, color2, c.y ), color3, c.x );

        trap = min( trap, r2 );
    }

    return ( length( vector.xyz ) - C1 ) / vector.w - C2;
}

vec4 scene( vec3 p )
{
    vec3 col = vec3( 0.0 );
    float dist = mandlebox( p, col );

    return vec4( col, dist );
}

vec3 getFog( vec3 outColor, float dist )
{
    float fogAmount = ( 1.0 - exp( -dist * fogExp ) ) * fogCoeff;

    return mix( outColor, fogColor, fogAmount );
}

vec3 getNormal( vec3 p )
{
	return normalize( vec3 (
	    scene( p + vec3( EPS, 0.0, 0.0 ) ).w - scene( p + vec3( -EPS, 0.0, 0.0 ) ).w,
	    scene( p + vec3( 0.0, EPS, 0.0 ) ).w - scene( p + vec3( 0.0, -EPS, 0.0 ) ).w,
	    scene( p + vec3( 0.0, 0.0, EPS ) ).w - scene( p + vec3( 0.0, 0.0, -EPS ) ).w
	) );
}

vec3 raymarch( vec3 origin, vec3 ray, out vec3 pos, out vec3 normal, out bool hit )
{
	float dist;
	float depth = 0.0;
    vec4 data;
    vec3 outColor;
    vec3 lightDir = normalize( lightPos - pos );

	pos = origin;

	for ( int i = 0; i < 64; i++ )
    {
		data = scene( pos );
        dist = data.a;
		depth += dist;
		pos = origin + depth * ray;

		if ( abs( dist ) < EPS ) break;
        if ( abs( dist ) > far ) break;
	}

	if ( abs( dist ) < EPS )
    {
		normal = getNormal( pos );
		float diffuse = clamp( dot( lightDir, normal ), 0.1, 1.0 );
		float specular = pow( clamp( dot( reflect( lightDir, normal ), ray ), 0.0, 1.0 ), 10.0 );

        outColor = data.rgb * diffuse + vec3( 0.5 ) * specular;
        outColor = mix( background, outColor, occlusion( pos, normal, dist ) );

		hit = true;
	}
    else
    {
        outColor = vec3( 0.0 );
	}

	return getFog( outColor, depth );
}

void main()
{
    vec2 screenPos = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution;
    vec4 ndcRay = vec4( screenPos.xy, 1.0, 1.0 );
    vec3 ray = normalize( ( cameraWorldMatrix * cameraProjectionMatrixInverse * ndcRay ).xyz );
	vec3 origin = cameraPosition;
    vec3 pos, normal;
    vec3 outColor = background;
	bool hit;
    float alpha = 1.0;

    const int iterations = 3;

    for ( int i = 0; i < iterations; i++ )
    {
		outColor += alpha * raymarch( origin, ray, pos, normal, hit );

		alpha *= 0.3;
		ray = normalize( reflect( ray, normal ) );
		origin = pos + normal * OFFSET;

		if ( !hit ) break;
	}



	gl_FragColor = vec4( outColor, 1.0 );
}