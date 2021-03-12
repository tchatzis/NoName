varying vec2 vUv;

uniform float spread;
uniform sampler2D texture;
uniform float h;
uniform float w;
uniform float time;

void main()
{
	vec4 sum = vec4( 0.0 );

	for ( float x = -4.0; x <= 4.0; ++x )
	{
		for ( float y = -4.0; y <= 4.0; ++y )
		{
			float gauss = gaussian( x, y, spread );
			sum += texture2D( texture, vec2( vUv.x + x * w * time, vUv.y + y * h * time ) ) * gauss;
		}
	}

	float i = 8.0;

	gl_FragColor = sum / i;
}