varying vec2 vUv;

void main()
{
	bool billboard = true;

	vUv = uv;

	if ( billboard )
	{
		gl_Position = projectionMatrix * ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) + vec4( position, 0.0 ) );
	}
	else
	{
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
}
