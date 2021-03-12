attribute float opaque;
attribute vec3 start;
attribute vec3 end;

varying vec3 vPosition;
varying float vLevel;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpaque;
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform float time;
uniform float duration;
uniform float phase;
uniform float amplitude;

void main()
{
	vPosition = position + start;
	if ( end.y > 0.0 )
	{
		float level = end.y * amplitude * clamp( duration - time, 0.0, duration );

		if ( phase == 0.0 )
		{
			vPosition.y += level;
		}
		else if ( phase == 1.0 )
		{
			vPosition.y *= level;
			vPosition.y += level / 2.0;
			vPosition.y += position.y;
		}
	}
	vLevel = vPosition.y;
	vColor = color;
	vNormal = normal;
	vView = cameraPosition;
	vOpaque = opaque;
	vUv = uv;

	vec4 worldPosition = modelMatrix * vec4( vPosition, 1.0 );

	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
