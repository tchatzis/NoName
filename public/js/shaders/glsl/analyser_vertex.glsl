attribute float opaque;
attribute vec3 start;
attribute vec3 end;
attribute float level;
attribute vec3 alternate;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpaque;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vLevel;
varying vec3 vAlternate;

void main()
{
	vPosition = position + start;
	vColor = color;
	vNormal = normal;
	vView = cameraPosition;
	vOpaque = opaque;
	vUv = uv;
	vLevel = level;
	vAlternate = alternate;

	vec4 worldPosition = modelMatrix * vec4( vPosition, 1.0 );

	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
