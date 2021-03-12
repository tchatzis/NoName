varying vec2 vUv;
varying float vElapsed;
varying vec3 vPosition;

uniform float start;
uniform float time;

attribute float birth;
attribute float lifespan;

void main()
{
	float t = time / 1000.0;

	vUv = uv;
	vElapsed = time / ( birth - start + lifespan );
	vPosition = position;

	gl_Position = projectionMatrix * ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) + vec4( vPosition, 0.0 ) );
}
