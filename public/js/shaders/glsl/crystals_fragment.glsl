uniform float brightness;

varying vec3 vNoise;

void main()
{
	float r = vNoise.x + 0.2;
	float g = vNoise.x + 0.1;
	float b = vNoise.x;

	gl_FragColor = vec4( r, g, b, vNoise.z ) * brightness;
}
