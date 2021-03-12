uniform float time;
uniform float threshold;

varying vec3 vPosition;
varying vec2 vUv;

// body of a star
float noiseSpere(vec3 ray,vec3 pos,float r,mat3 mr,float zoom,vec3 subnoise,float anim)
{
	float b = dot(ray,pos);
	float c = dot(pos,pos) - b*b;

	vec3 r1=vec3(0.0);

	float s=0.0;
	float d=0.03125;
	float d2=zoom/(d*d);
	float ar=5.0;

	for (int i=0;i<3;i++) {
		float rq=r*r;
		if(c <rq)
		{
			float l1=sqrt(rq-c);
			r1= ray*(b-l1)-pos;
			r1=r1*mr;
			s+=abs(noise4q(vec4(r1*d2+subnoise*ar,anim*ar))*d);
		}
		ar-=2.0;
		d*=4.0;
		d2*=0.0625;
		r=r-r*0.02;
	}
	return s;
}

// glow ring
float ring(vec3 ray,vec3 pos,float r,float size)
{
	float b = dot(ray,pos);
	float c = dot(pos,pos) - b*b;

	float s=max(0.0,(1.0-size*abs(r-sqrt(c))));

	return s;
}

// rays of a star
float ringRayNoise(vec3 ray,vec3 pos,float r,float size,mat3 mr,float anim)
{
	float b = dot(ray,pos);
	vec3 pr=ray*b-pos;

	float c=length(pr);

	pr*=mr;

	pr=normalize(pr);

	float s=max(0.0,(1.0-size*abs(r-c)));

	float nd=noise4q(vec4(pr*1.0,-anim+c))*2.0;
	nd=pow(nd,2.0);
	float n=0.4;
	float ns=1.0;
	if (c>r) {
		n=noise4q(vec4(pr*10.0,-anim+c));
		ns=noise4q(vec4(pr*50.0,-anim*2.5+c*2.0))*2.0;
	}
	n=n*n*nd*ns;

	return pow(s,4.0)+s*s*n;
}

vec4 noiseSpace(vec3 ray,vec3 pos,float r,mat3 mr,float zoom,vec3 subnoise,float anim)
{
	float b = dot(ray,pos);
	float c = dot(pos,pos) - b*b;

	vec3 r1=vec3(0.0);

	float s=0.0;
	float d=0.0625*1.5;
	float d2=zoom/d;

	float rq=r*r;
	float l1=sqrt(abs(rq-c));
	r1= (ray*(b-l1)-pos)*mr;

	r1*=d2;
	s+=abs(noise4q(vec4(r1+subnoise,anim))*d);
	s+=abs(noise4q(vec4(r1*0.5+subnoise,anim))*d*2.0);
	s+=abs(noise4q(vec4(r1*0.25+subnoise,anim))*d*4.0);
	//return s;
	return vec4(s*2.0,abs(noise4q(vec4(r1*0.1+subnoise,anim))),abs(noise4q(vec4(r1*0.1+subnoise*6.0,anim))),abs(noise4q(vec4(r1*0.1+subnoise*13.0,anim))));
}

float sphereZero(vec3 ray,vec3 pos,float r)
{
	float b = dot(ray,pos);
	float c = dot(pos,pos) - b*b;
	float s=1.0;
	if (c<r*r) s=0.0;
	return s;
}

void main()
{
	vec2 p = vUv * 3.0 - 1.5;

	vec2 rotate = vec2( time, time );

	vec2 sins=sin(rotate);
	vec2 coss=cos(rotate);

	mat3 mr=mat3(vec3(coss.x,0.0,sins.x),vec3(0.0,1.0,0.0),vec3(-sins.x,0.0,coss.x));
	mr=mat3(vec3(1.0,0.0,0.0),vec3(0.0,coss.y,sins.y),vec3(0.0,-sins.y,coss.y))*mr;

	mat3 imr=mat3(vec3(coss.x,0.0,-sins.x),vec3(0.0,1.0,0.0),vec3(sins.x,0.0,coss.x));
	imr=imr*mat3(vec3(1.0,0.0,0.0),vec3(0.0,coss.y,-sins.y),vec3(0.0,sins.y,coss.y));

	vec3 ray = normalize(vec3(p,2.0));
	vec3 pos = vec3(0.0,0.0,3.0);

	float s1=noiseSpere(ray,pos,1.0,mr,0.5,vec3(0.0),time);
	s1=pow(min(1.0,s1*2.4),2.0);

	float s2=noiseSpere(ray,pos,1.0,mr,4.0,vec3(83.23,34.34,67.453),time);
	s2=min(1.0,s2*2.2);

	gl_FragColor = vec4( mix(vec3(1.0,1.0,0.0),vec3(1.0),pow(s1,60.0))*s1, 1.0 );
	gl_FragColor += vec4( mix(mix(vec3(1.0,0.0,0.0),vec3(1.0,0.0,1.0),pow(s2,2.0)),vec3(1.0),pow(s2,10.0))*s2, 1.0 );

	gl_FragColor.xyz -= vec3(ring(ray,pos,1.03,11.0))*2.0;
	gl_FragColor = max( vec4(0.0), gl_FragColor );

	float s3=ringRayNoise(ray,pos,0.96,1.0,mr,time);
	gl_FragColor.xyz += mix(vec3(1.0,0.6,0.1),vec3(1.0,0.95,1.0),pow(s3,3.0))*s3;

	if ( threshold > 0.0 )
	{
		cutoff( gl_FragColor.rgb, threshold );
	}

	gl_FragColor = max( vec4(0.0), gl_FragColor );
	gl_FragColor = min( vec4(1.0), gl_FragColor );
}
