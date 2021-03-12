attribute float opacity;
attribute vec3 start;
attribute vec3 end;

varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpacity;
varying vec2 vUv;

uniform float time;
uniform float duration;
uniform float phase;

void main()
{
	vec3 offset = start + ( end - start ) * smoothstep( 0.0, 1.0, phase - sin( time / duration ) );

	vPosition = position + offset;
	vColor = color;
	vNormal = normal;
	vView = cameraPosition;
	vOpacity = opacity;
	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
