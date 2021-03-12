varying vec2 vUv;
varying vec3 vColor;

attribute vec3 color;

void main()
{
	vUv = uv;
	vColor = color;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
