varying vec2 vUv;
varying float vElapsed;

uniform sampler2D map;
uniform float time;
uniform float opacity;

void main()
{
	vec4 diffuse = texture2D( map, vec2( 0.3, 0.3 ) );
	vec4 color = texture2D( map, vUv ) + diffuse;
		color += GrayscaleAmount( color, vElapsed );

	if ( vElapsed > 1.0 )
		discard;

	gl_FragColor = vec4( color.rgb, opacity );
}