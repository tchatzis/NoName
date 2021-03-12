uniform vec3 color1;
uniform vec3 color2;
uniform float frequency;
uniform float noiseScale;
uniform float ringScale;
uniform float contrast;
uniform float time;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

void main()
{
	float n = simplex3d( vPosition );
	float ring = fract( frequency * vPosition.z + noiseScale * n * cos( time ) );
	ring *= contrast * ( 1.0 - ring );

	// Adjust ring smoothness and shape, and add some noise
	float lerp = pow( ring, ringScale ) + n;
	vec3 base = mix( color1, color2, lerp );

	gl_FragColor = vec4( base, 1.0 );
}
