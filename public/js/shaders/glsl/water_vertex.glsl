uniform mat4 textureMatrix;
uniform float time;
uniform float amplitude;
uniform vec4 frequency;
uniform vec2 mix;

varying vec4 vUv;
varying vec3 vCamera;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;

void main()
{
    vUv = textureMatrix * vec4( position, 1.0 );
    vCamera = cameraPosition;
    vPosition = position;
    vNormal = normal;

    vec3 pos = position;
    pos.z -= amplitude;
	pos.z *= noise( vec2( pos.x * frequency.x - time, pos.y * frequency.y - time ), mix.x );
	pos.z *= noise( vec2( pos.x * frequency.z + time, pos.y * frequency.w + time ), mix.y );
	pos.z *= amplitude;

	vColor = vec3( 0.0 ) - abs( atan( pos.z / uv.x ) + atan( pos.z / uv.y ) ) * 0.1;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
