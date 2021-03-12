uniform sampler2D tDiffuse;
uniform vec2 resolution;

void main()
{
	vec4 color = texture2D( tDiffuse, gl_FragCoord.xy / resolution );

	gl_FragColor = color;
}
