varying vec2 vUv;

uniform bool skyBox;

void main()
{
	vUv = uv;

	mat4 view = modelViewMatrix;

	if ( skyBox )
	{
		view = mat4( mat3( modelViewMatrix ) );
	}

	gl_Position = projectionMatrix * view * vec4( position, 1.0 );
	//gl_Position.z = gl_Position.w;
}
