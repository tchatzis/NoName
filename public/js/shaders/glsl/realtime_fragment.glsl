varying vec3 vPosition;
varying float vLevel;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpaque;
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform vec3 lightPosition;
uniform vec3 diffuseColor;
uniform vec3 specularColor;

void main()
{
	vec3 lightDir = normalize( lightPosition - vPosition );

	vec2 uv = vUv;
	float distance = sqrt( uv.x * uv.x + uv.y * uv.y );

	vec3 color = vColor;
		color *= clamp( pow( distance, 0.05 ), 0.0, 1.0 );
		color.r = pow( vLevel, 2.0 ) / 20.0;
		color.g -= color.r / 8.0;
		color.b -= vLevel;

	float c = 0.5 + max( 0.0, dot( vNormal, lightDir ) ) * 0.5;

	if ( vColor == vec3( 0.0 ) )
		discard;

	gl_FragColor = vec4( color * c, vOpaque );
}
