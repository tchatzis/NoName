varying vec2 vUv;
varying vec3 vPosition;
varying float vLifespan;
varying float vDecay;
varying vec3 vDistance;

uniform float time;
uniform vec3 taper;
uniform vec3 rotation;
uniform vec3 spin;

attribute vec3 offset;
attribute float lifespan;
attribute float decay;

void main()
{
	float elapsed = time / lifespan;

	vUv = uv;
	vLifespan = lifespan;
	vDecay = decay;
	vDistance = offset * elapsed;

	vec3 mPosition = vec3( 0.0 );

	// model
	if ( spin.x != 0.0 || spin.y != 0.0 || spin.z != 0.0 )
	{
		float inc = time * lifespan / 10.0;

		vec4 rotated = vec4( position, 1.0 );
			rotated *= rotationX( spin.x * inc ) * rotationY( spin.y * inc ) * rotationZ( spin.z * inc );

		mPosition = rotated.xyz;
	}
	else
	{
		mPosition = position;
	}

	// group
	vec3 angle = vec3( time ) * rotation * random3( vec3( lifespan ) );
	vec4 iRotation = vec4( vDistance, 1.0 ) * rotationX( angle.x ) * rotationY( angle.y ) * rotationZ( angle.z );
	vec3 iPosition = mPosition + vDistance;
		iPosition += iRotation.xyz;

	float taperAmount = 0.0;

	if ( taper.x > 0.0 )
	{
		taperAmount = pow( iPosition.x, taper.x );
		iPosition.y *= taperAmount;
		iPosition.z *= taperAmount;
	}

	if ( taper.y > 0.0 )
	{
		taperAmount = pow( iPosition.y, taper.y );
		iPosition.x *= taperAmount;
		iPosition.z *= taperAmount;
	}

	if ( taper.z > 0.0 )
	{
		taperAmount = pow( iPosition.z, taper.z );
		iPosition.x *= taperAmount;
		iPosition.y *= taperAmount;
	}

	gl_Position = projectionMatrix * modelViewMatrix * vec4( iPosition, 1.0 );
}
