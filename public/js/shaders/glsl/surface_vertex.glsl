uniform float amplitude;
uniform float frequency;
uniform float time;
uniform float scale;

attribute vec3 color;

varying vec3 vColor;

void main()
{
	vec3 pos = position;

	pos.y += noise( vec2( pos.x * 0.17 + time, pos.z * 0.23 - time ), scale );
	pos.y += noise( vec2( pos.x * 0.22 - time, pos.z * 0.18 + time ), scale * 1.12 );
	pos.y *= amplitude;
	pos.y -= amplitude;

	vColor = color - abs( atan( pos.y / uv.x ) + atan( pos.y / uv.y ) ) * 0.25 + 0.25;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
