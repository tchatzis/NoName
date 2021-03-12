varying vec3 vPosition;
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
	vec3 viewDir = normalize( vView - vPosition );
	vec3 reflectDir = reflect( -lightDir, vNormal );

	float intensity = 1.0 / pow( distance( vView, vPosition ), 2.0 );
	float ambient = 0.3;
	float specularStrength = 1.0;
	float spec = pow( max( dot( viewDir, reflectDir ), 0.0 ), 32.0 );
	float diff = max( dot( vNormal, lightDir ), 0.0 );
	float head = max( dot( vNormal, viewDir ), 0.0 );

	vec3 specular = specularStrength * spec * specularColor;
	vec3 diffuse = diff * diffuseColor;
	vec3 headlight = head * vec3( 0.1 ) * intensity;

	vec2 uv = vUv;
	float distance = sqrt( uv.x * uv.x + uv.y * uv.y );

	vec3 color = vColor;
	    color *= clamp( pow( distance, 0.03 ), 0.0, 1.0 );

    float c = 0.5 + diff * 0.5;

	if ( vColor == vec3( 0.0 ) )
		discard;

	gl_FragColor = vec4( ( color * c ) * ( specular + diffuse + ambient + headlight ), vOpaque );
}
