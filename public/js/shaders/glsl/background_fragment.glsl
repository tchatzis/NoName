varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D map;
uniform float opacity;

void main()
{
	gl_FragColor = texture2D( map, vUv ) * opacity;
}
