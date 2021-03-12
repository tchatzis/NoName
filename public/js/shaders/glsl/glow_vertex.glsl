uniform vec3 viewVector;
uniform float c;
uniform float power;

varying float vIntensity;
varying vec3 vPosition;
varying vec2 vUv;

void main()
{
	vPosition = position;
	vUv = uv;

	vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );

	vIntensity = pow( c + dot( vNormal, vNormel ), power );

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
