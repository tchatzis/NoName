in vec3 P;

in vec3 iNearPositionVert;
in vec3 iFarPositionVert;

out vec3 vertexPosition;
out vec3 near;
out vec3 far;

void main()
{
	vertexPosition = P;
	near = iNearPositionVert;
	far = iFarPositionVert;

	gl_Position = vec4(P, 1);
}
