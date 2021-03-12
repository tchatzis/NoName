uniform bool billboard;

varying vec2 vUv;
varying vec3 vPosition;

void main()
{
	vUv = uv;
	vPosition = position;

	if ( billboard )
	{
		gl_Position = projectionMatrix * ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) + vec4( position, 0.0 ) );
	}
	else
	{
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
}
