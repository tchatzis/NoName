varying vec2 vUv;
varying vec3 vPosition;
varying float vLifespan;

uniform float time;
uniform vec3 spin;
uniform vec3 scalex;
uniform vec3 scaley;
uniform vec3 scalez;

attribute float lifespan;
attribute vec3 offset;

vec3 spinner( vec3 object )
{
    vec3 angle = spin * time * lifespan;
    vec4 rotated = vec4( object, 1.0 );
        rotated *= rotationX( angle.x ) * rotationY( angle.y ) * rotationZ( angle.z );

    return rotated.xyz;
}

void main()
{
	vec2 origin = vec2( 0.0 );

    vUv = uv;
	vLifespan = lifespan;

    vPosition = vec3( 1.0 );
    // spin particles
    vPosition *= spinner( position );
    // spin group
    vPosition += spinner( offset );
    // group length
    vPosition.y += distance( vec2( offset.x, offset.z ), origin ) * scaley.y;
    // spread
    vPosition.xz *= scaley.xz;
    // sway
    vPosition.x += noise( vec2( vPosition.x + time * scalex.x, vPosition.y - time * scalex.y ), scalex.z ) - 0.5;
    vPosition.z += noise( vec2( vPosition.z + time * scalez.x, vPosition.y - time * scalez.y ), scalez.z ) - 0.5;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
