uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main()
{
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	vec3 worldNormal = normalize( normalMatrix * normal );
	vec3 viewDirection = normalize( cameraPosition - worldPosition.xyz );

	vReflect = reflect( viewDirection, worldNormal );
	vRefract[0] = refract( viewDirection, worldNormal, mRefractionRatio );
	vRefract[1] = refract( viewDirection, worldNormal, mRefractionRatio * 0.99 );
	vRefract[2] = refract( viewDirection, worldNormal, mRefractionRatio * 0.98 );
	vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( viewDirection, worldNormal ), mFresnelPower );

	gl_Position = projectionMatrix * mvPosition;
}