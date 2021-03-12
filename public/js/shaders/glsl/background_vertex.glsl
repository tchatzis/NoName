varying vec2 vUv;
varying vec3 vPosition;

void main()
{
	vUv = uv;
	vPosition = position;

	mat4 view = mat4( mat3( modelViewMatrix ) );

	gl_Position = projectionMatrix * view * vec4( position, 1.0 );
	//gl_Position.z = gl_Position.w;
}
