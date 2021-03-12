attribute float opaque;
attribute vec3 start;
attribute vec3 end;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpaque;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDistance;

uniform float time;
uniform float wavelength;
uniform float phase;
uniform float amplitude;

void main()
{
	float distance = sqrt( start.x * start.x + start.z * start.z ) / wavelength;
	float y = sin( time * phase - distance ) * amplitude;
	vec3 offset = vec3( start.x, y, start.z );

	vPosition = position + offset;
	vColor = color;
	vNormal = normal;
	vView = cameraPosition;
	vOpaque = opaque;
	vUv = uv;
	vDistance = distance;

	vec4 worldPosition = modelMatrix * vec4( vPosition, 1.0 );

	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
