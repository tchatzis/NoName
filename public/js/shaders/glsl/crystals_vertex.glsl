uniform float time;
uniform vec3 scale;

varying vec3 vNoise;

void main()
{
	vNoise = vec3( 0, 0, 0 );
	vNoise.x = simplex3d( vec3( position.xy, time ) );
	vNoise.y = simplex3d( vec3( position.yz, time ) );
	vNoise.z = simplex3d( vec3( position.zx, time ) );

	vec3 rotation = vec3( 0.0, 0.0, 0.0 );
	rotation.x = sin( time ) * ( vNoise.z + vNoise.y );
	rotation.y = cos( time ) * ( vNoise.x + vNoise.z );
	rotation.z = sin( time ) * ( vNoise.y + vNoise.x );

	vec3 displacement = vec3( 0.0, 0.0, 0.0 );
	displacement.x = ( vNoise.x + rotation.x ) * scale.x;
	displacement.y = ( vNoise.y + rotation.y ) * scale.y;
	displacement.z = ( vNoise.z + rotation.z ) * scale.z;

	vec3 p = position + displacement;

	vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );

	gl_Position = projectionMatrix * mvPosition;
}
