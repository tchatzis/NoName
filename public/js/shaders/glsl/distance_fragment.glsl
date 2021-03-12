precision highp float;

uniform vec2 resolution;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 cameraWorldMatrix;
uniform mat4 cameraProjectionMatrixInverse;
uniform vec3 lightPos;
uniform float size;
uniform vec3 color;
uniform vec3 fogColor;
uniform float fogExp;
uniform float fogCoeff;
uniform float time;
uniform float far;
uniform vec3 background;
uniform vec3 interval;
uniform int shape;
uniform float inside;
uniform float ground;

const float EPS = 0.001;
const float OFFSET = 1.0 / EPS;

// utilities
float absolute( float speed )
{
    return ( ( sin( speed * time ) + 1.0 ) / 2.0 );
}

vec4 min4( vec4 d1, vec4 d2 )
{
    return ( d1.w < d2.w ) ? d1 : d2;
}

vec4 max4( vec4 d1, vec4 d2 )
{
    return ( d1.w > d2.w ) ? d1 : d2;
}

vec3 repeat( vec3 p )
{
    vec3 q = mod( p + 0.5 * interval, interval ) - 0.5 * interval;

    if ( abs( interval.x ) < EPS )
    {
        q.x = p.x;
    }

    if ( abs( interval.y ) < EPS )
    {
        q.y = p.y;
    }

    if ( abs( interval.z ) < EPS )
    {
        q.z = p.z;
    }

    return q;
}

// SDFs
float bounding( vec3 p )
{
    vec3 d = abs( p ) - size;
    vec3 q = abs( d + inside ) - inside;

    return min(
        min (
          length( max( vec3( d.x, q.y, q.z ), 0.0 ) ) + min( max( d.x, max( q.y, q.z ) ), 0.0 ),
          length( max( vec3( q.x, d.y, q.z ), 0.0 ) ) + min( max( q.x, max( d.y, q.z ) ), 0.0 )
        ),
        length( max( vec3( q.x, q.y, d.z ), 0.0 ) ) + min( max( q.x, max( q.y, d.z ) ), 0.0 )
    );
}

float box( vec3 p )
{
    vec3 d = abs( p ) - size;

    return min( max( d.x, max( d.y, d.z ) ), 0.0 ) + length( max( d, 0.0 ) );
}

float cone( vec3 p )
{
    vec2 c = vec2( 1.0 / inside, 1.0 );
    vec2 q = size * vec2( c.x / c.y, -1.0 );
    vec2 w = vec2( length( p.xz ), p.y );
    vec2 a = w - q * clamp( dot( w, q ) / dot( q, q ), 0.0, 1.0 );
    vec2 b = w - q * vec2( clamp( w.x / q.x, 0.0, 1.0 ), 1.0 );
    float k = sign( q.y );
    float d = min( dot( a, a ), dot( b, b ) );
    float s = max( k * ( w.x * q.y - w.y * q.x ), k * ( w.y - q.y ) );

    return sqrt( d ) * sign( s );
}

float cylinder( vec3 p )
{
    vec2 d = abs( vec2( length( p.xz ), p.y ) ) - vec2( inside, size * 0.5 );

    return min( max( d.x, d.y ), 0.0 ) + length( max( d, 0.0 ) );
}

float ellipsoid( vec3 p )
{
    float minor = min( 1.0 + EPS, size / inside );
    vec3 r = vec3( size, vec2( minor ) );

    float k0 = length( p / r );
    float k1 = length( p / ( r * r ) );

    return k0 * ( k0 - 1.0 ) / k1;
}

float sphere( vec3 p )
{
    return length( p ) - size * 0.5;
}

float torus( vec3 p )
{
    return length( vec2( length( p.xz ) - inside * 0.5, p.y ) ) - size * 0.5;
}

float octahedron( vec3 p )
{
  p = abs( p );

  return ( p.x + p.y + p.z - size ) * 0.57735027;
}

float plane( vec3 p )
{
    vec3 n = normalize( vec3( 0.0, 1.0, 0.0 ) );

    return dot( p, n ) - ground;
}

float pyramid( vec3 p )
{
    float m2 = inside * inside + 0.25;

    p.xz = abs( p.xz );
    p.xz = ( p.z > p.x ) ? p.zx : p.xz;
    p.xz -= size * 0.5;

    vec3 q = vec3( p.z, inside * p.y - 0.5 * p.x, inside * p.x + 0.5 * p.y );

    float s = max( -q.x, 0.0 );
    float t = clamp( ( q.y - 0.5 * p.z ) / ( m2 + 0.25 ), 0.0, 1.0 );

    float a = m2 * ( q.x + s ) * ( q.x + s ) + q.y * q.y;
    float b = m2 * ( q.x + 0.5 * t ) * ( q.x + 0.5 * t ) + ( q.y - m2 * t ) * ( q.y - m2 * t );
    float d2 = min( q.y, -q.x * m2 - q.y * 0.5 ) > 0.0 ? 0.0 : min( a, b );

    return sqrt( ( d2 + q.z * q.z ) / m2 ) * sign( max( q.z, -p.y ) );
}

// SDF selection
float map( vec3 p )
{
    float b;

    if ( shape == 0 )
    {
        b = bounding( repeat( p ) );
    }
    else if ( shape == 1 )
    {
        b = box( repeat( p ) );
    }
    else if ( shape == 2 )
    {
        b = cylinder( repeat( p ) );
    }
    else if ( shape == 3 )
    {
        b = ellipsoid( repeat( p ) );
    }
    else if ( shape == 4 )
    {
        b = sphere( repeat( p ) );
    }
    else if ( shape == 5 )
    {
        b = torus( repeat( p ) );
    }
    else if ( shape == 6 )
    {
        b = cone( repeat( p ) );
    }
    else if ( shape == 7 )
    {
        b = pyramid( repeat( p ) );
    }
    else if ( shape == 8 )
    {
        b = octahedron( repeat( p ) );
    }
    else if ( shape == 9 )
    {
        b = plane( p );
    }

    return b;
}

// materials
vec3 checks( vec3 p )
{
	float u = 1.0 - floor( mod( p.x, 2.0 ) );
	float v = 1.0 - floor( mod( p.z, 2.0 ) );
    float c = ( u == 1.0 && v < 1.0 ) || ( u < 1.0 && v == 1.0 ) ? 0.1 : 1.0;

    return color * c;
}

vec3 hsl( vec3 p )
{
	vec3 c = vec3( ( p.x + p.z ) / 9.0, 1.0, 1.0 );
    vec4 k = vec4( 1.0, 1.0 / 3.0, 2.0 / 3.0, 3.0 );
	vec3 a = abs( fract( c.xxx + k.xyz ) * 6.0 - k.www );

	return c.z * mix( k.xxx, clamp( a - k.xxx, 0.0, 1.0 ), c.y );
}

vec3 none( vec3 p )
{
    return color;
}

vec3 panels( vec3 p )
{
    return color * fract( p );
}

vec3 radial( vec3 p )
{
    vec3 outColor;
    outColor.b = absolute( 1.0 ) / sqrt( length( p ) );

    return outColor;
}

// scene functions
vec4 scene( vec3 p )
{
    vec4 result = vec4( background, far );

    result = min4( result, vec4( checks( p ), map( p ) ) );
    result = min4( result, vec4( radial( p ), plane( p ) ) );

    return result;
}

// lighting, shading
vec3 getFog( vec3 outColor, float dist )
{
    float fogAmount = ( 1.0 - exp( -dist * fogExp ) ) * fogCoeff;

    return clamp( mix( outColor, fogColor, fogAmount ), 0.0, 1.0 );
}

vec3 getNormal( vec3 p )
{
	return normalize( vec3 (
	    scene( p + vec3( EPS, 0.0, 0.0 ) ).w - scene( p + vec3( -EPS, 0.0, 0.0 ) ).w,
	    scene( p + vec3( 0.0, EPS, 0.0 ) ).w - scene( p + vec3( 0.0, -EPS, 0.0 ) ).w,
	    scene( p + vec3( 0.0, 0.0, EPS ) ).w - scene( p + vec3( 0.0, 0.0, -EPS ) ).w
	) );
}

float getShadow( vec3 ray, vec3 pos )
{
	float h = 0.0;
	float c = 0.0;
	float r = 1.0;
	float shadowCoef = 0.5;

	for ( int t = 0; t < 50; t++ )
    {
		h = scene( pos + ray * c ).w;

		if ( h < EPS ) return shadowCoef;

		c += h;
        r = min( r, h * 16.0 / c );
	}

	return 1.0 - shadowCoef + r * shadowCoef;
}

// raymarching algorithm
vec3 raymarch( vec3 origin, vec3 ray, out vec3 pos, out vec3 normal, out bool hit )
{
    pos = origin;

    float dist;
    float depth = 0.0;
    vec4 data;
    vec3 outColor;
    vec3 lightDir = normalize( lightPos - pos );

    for ( int i = 0; i < 64; i++ )
    {
		data = scene( pos );
        dist = data.a;
		depth += dist;
		pos = origin + depth * ray;

		if ( abs( dist ) < EPS ) break;
	}

	if ( abs( dist ) < EPS )
    {
		normal = getNormal( pos );

		float diffuse = clamp( dot( lightDir, normal ), 0.1, 1.0 );
		float specular = pow( clamp( dot( reflect( lightDir, normal ), ray ), 0.0, 1.0 ), 10.0 );
		float shadow = getShadow( pos + normal * OFFSET, lightDir );

		outColor = ( data.rgb * diffuse + vec3( 0.8 ) * specular ) * max( 0.5, shadow );

		hit = true;
	}
    else
    {
		outColor = background;
	}

    return getFog( outColor, dist );
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