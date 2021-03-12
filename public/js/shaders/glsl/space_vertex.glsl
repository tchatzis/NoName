varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

uniform bool billboard;

void main()
{
	vPosition = position;
	vUv = uv;
	vNormal = normal;

	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	if ( billboard )
	{
		gl_Position = projectionMatrix * ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) + vec4( position, 0.0 ) );
	}
	else
	{
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
}
