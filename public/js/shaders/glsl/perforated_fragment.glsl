varying vec3 vPosition;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying float vOpacity;
varying vec2 vUv;

uniform vec3 light;
uniform vec3 diffuseColor;
uniform vec3 specularColor;

void main()
{
	vec3 lightDir = normalize( light - vPosition );
	vec3 viewDir = normalize( vView - vPosition );
	vec3 reflectDir = reflect( -lightDir, vNormal );

	float ambient = 0.3;
	float specularStrength = 1.0;
	float spec = pow( max( dot( viewDir, reflectDir ), 0.0 ), 32.0 );
	float diff = max( dot( vNormal, lightDir ), 0.0 );
	float threshold = 0.01;

	vec3 specular = specularStrength * spec * specularColor;
	vec3 diffuse = diff * diffuseColor;

	vec2 uv = vUv * 2.0 - 1.0;
	float distance = sqrt( uv.x * uv.x + uv.y * uv.y );

	vec3 color = vColor;

	color *= pow( distance, 32.0 );

	if ( color == vec3( 0.0 ) )
		discard;

	gl_FragColor = vec4( color * ( specular + diffuse + ambient ), vOpacity );
}

