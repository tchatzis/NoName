varying vec2 vUv;
varying vec3 vColor;

uniform sampler2D map0;
uniform float opacity0;
uniform sampler2D map1;
uniform float opacity1;

void main()
{
	gl_FragColor = ( texture2D( map0, vUv ) + vec4( vColor, opacity0 ) + texture2D( map1, vUv ) + vec4( vColor, opacity1 ) ) / 3.0;
}