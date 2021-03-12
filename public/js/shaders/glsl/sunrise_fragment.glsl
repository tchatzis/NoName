varying vec2 vUv;

uniform vec2 resolution;
uniform vec3 sunPosition;

vec3 getSky(vec2 uv)
{
	float atmosphere = sqrt(1.0-uv.y);
	vec3 skyColor = vec3(0.2,0.4,0.8);

	float scatter = pow( sunPosition.y, 1.0 / 15.0 );
	scatter = 1.0 - clamp( scatter, 0.8, 1.0 );

	vec3 scatterColor = mix( vec3(1.0),vec3( 0.6, 0.3, 0.0 ) * 1.5, scatter );
	return mix( skyColor, vec3( scatterColor ), atmosphere / 1.5 );
}

vec3 getSun(vec2 uv)
{
	float sun = 1.0 - distance( uv, sunPosition.xy );
	sun = clamp(sun,0.0,1.0);

	float glow = sun;
	glow = clamp(glow,0.0,1.0);

	sun = pow(sun,100.0);
	sun *= 100.0;
	sun = clamp(sun,0.0,1.0);

	glow = pow(glow,6.0) * 1.0;
	glow = pow(glow,(uv.y));
	glow = clamp(glow,0.0,1.0);

	sun *= pow(dot(uv.y, uv.y), 1.0 / 1.65);

	glow *= pow(dot(uv.y, uv.y), 1.0 / 2.0);

	sun += glow;

	vec3 sunColor = vec3(1.0,0.6,0.05) * sun;

	return vec3(sunColor);
}

void main()
{
	vec2 uv = vUv * 2.0 - 1.0;
	vec3 sky = getSky( uv );
	vec3 sun = getSun( uv );

	gl_FragColor = vec4( sky + sun, 1.0 );
}