attribute float opaque;
attribute vec3 start;
attribute vec3 end;
attribute vec3 rotation;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpaque;
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform float time;
uniform float duration;
uniform float phase;

mat4 rotationX( float angle )
{
	return mat4(	1.0,		0,			0,			0,
			 		0, 	cos(angle),	-sin(angle),		0,
					0, 	sin(angle),	 cos(angle),		0,
					0, 			0,			  0, 		1);
}

mat4 rotationY( float angle )
{
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}

mat4 rotationZ( float angle )
{
	return mat4(	cos(angle),		-sin(angle),	0,	0,
			 		sin(angle),		cos(angle),		0,	0,
							0,				0,		1,	0,
							0,				0,		0,	1);
}

void main()
{
	vec3 offset = start + ( end - start ) * smoothstep( 0.0, 1.0, phase - sin( time / duration ) );

	if ( rotation.x != 0.0 || rotation.y != 0.0 || rotation.z != 0.0 )
	{
		vec4 rotated = vec4( position, 1.0 );
			rotated *= rotationX( rotation.x ) * rotationY( rotation.y ) * rotationZ( rotation.z );

		vPosition = rotated.xyz + offset;
	}
	else
	{
		vPosition = position + offset;
	}

	vColor = color;
	vNormal = normal;
	vView = cameraPosition;
	vOpaque = opaque;
	vUv = uv;

	vec4 worldPosition = modelMatrix * vec4( vPosition, 1.0 );

	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
