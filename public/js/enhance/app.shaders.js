const Shaders = function()
{
    var scope = "shaders";
    var app = this;
        app[ scope ] = {};
    const pi = 3.1415926535897932384626433832795;
    const e = 2.71828;

    // reusable contents
    Object.defineProperty( app[ scope ], "billboard",
    {
        enumerable: false,
        value: `
        if ( billboard )
        {
            gl_Position = projectionMatrix * ( modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ) + vec4( position, 0.0 ) );
        }
        else
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`
    } );

    Object.defineProperty( app[ scope ], "cutoff",
    {
        enumerable: false,
        value: `
        float average( vec3 color )
        {
            return ( color.r + color.g + color.b ) / 3.0;
        }
        
        void cutoff( vec3 color, float threshold )
        {
            if ( average( color ) < threshold )
            {
                discard;
            }
        }`
    } );

    Object.defineProperty( app[ scope ], "fbm",
    {
        enumerable: false,
        value: `
        float fbm( vec2 pos ) 
        {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            
            for ( int i=0; i < 16; i++ ) 
            {
                v = (sin(v*1.07)) + ( a * noise(pos) );
                pos = rot * pos * 2.0 + shift;
                a *= 0.5;
            }
            
            return v;
        }`
    } );

    Object.defineProperty( app[ scope ], "fullscreen",
    {
        enumerable: false,
        value: `
        vec2 p = ( gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y );`
    } );

    Object.defineProperty( app[ scope ], "gaussian",
    {
        enumerable: false,
        value: `
        float gaussian( float x, float y, float spread )
        {
            float sigmaSquared = spread * spread;
            
            return ( 1.0 / sqrt( ${ pi } * 2.0 * sigmaSquared ) ) * pow( ${ e }, -( ( x * x ) + ( y * y ) ) / ( 2.0 * sigmaSquared ) );
        }`
    } );

    Object.defineProperty( app[ scope ], "grayscale",
    {
        enumerable: false,
        value: `
        vec3 Grayscale( vec4 inputColor )
        {
            float gray = dot( inputColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
            vec3 color = vec3( gray, gray, gray );
            return color;
        }
        
        vec4 GrayscaleAmount( vec4 inputColor, float amount )
        {
            inputColor.rgb = mix( inputColor.rgb, Grayscale( inputColor ), amount );
            
            return inputColor;
        }`
    } );

    Object.defineProperty( app[ scope ], "noise",
    {
        enumerable: false,
        value: `
        float hash( vec2 p, float scale )
        {
            p = mod( p, scale );
        
            return fract( sin( dot( p, vec2( 27.16898, 38.90563 ) ) ) * 5151.5473453 );
        }
        
        float noise( vec2 p, float scale )
        {
            vec2 f;
        
            p *= scale;
            f = fract( p );
            p = floor( p );
        
            f = f * f * ( 3.0 - 2.0 * f );
        
            float res = mix( mix( hash( p, 				 	  scale ),
                                  hash( p + vec2( 1.0, 0.0 ), scale ), f.x ),
                             mix( hash( p + vec2( 0.0, 1.0 ), scale ),
                                  hash( p + vec2( 1.0, 1.0 ), scale ), f.x ), f.y );
            return res;
        }`
    } );

    Object.defineProperty( app[ scope ], "noise4q",
    {
        enumerable: false,
        value: `
        vec4 hash4( vec4 n ) 
        { 
            return fract(sin(n)*1399763.5453123); 
        }

        float noise4q(vec4 x)
        {
            vec4 n3 = vec4(0,0.25,0.5,0.75);
            vec4 p2 = floor(x.wwww+n3);
            vec4 b = floor(x.xxxx+n3) + floor(x.yyyy+n3)*157.0 + floor(x.zzzz +n3)*113.0;
            vec4 p1 = b + fract(p2*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
            p2 = b + fract((p2+1.0)*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
            vec4 f1 = fract(x.xxxx+n3);
            vec4 f2 = fract(x.yyyy+n3);
            f1=f1*f1*(3.0-2.0*f1);
            f2=f2*f2*(3.0-2.0*f2);
            vec4 n1 = vec4(0,1.0,157.0,158.0);
            vec4 n2 = vec4(113.0,114.0,270.0,271.0);
            vec4 vs1 = mix(hash4(p1), hash4(n1.yyyy+p1), f1);
            vec4 vs2 = mix(hash4(n1.zzzz+p1), hash4(n1.wwww+p1), f1);
            vec4 vs3 = mix(hash4(p2), hash4(n1.yyyy+p2), f1);
            vec4 vs4 = mix(hash4(n1.zzzz+p2), hash4(n1.wwww+p2), f1);
            vs1 = mix(vs1, vs2, f2);
            vs3 = mix(vs3, vs4, f2);
            vs2 = mix(hash4(n2.xxxx+p1), hash4(n2.yyyy+p1), f1);
            vs4 = mix(hash4(n2.zzzz+p1), hash4(n2.wwww+p1), f1);
            vs2 = mix(vs2, vs4, f2);
            vs4 = mix(hash4(n2.xxxx+p2), hash4(n2.yyyy+p2), f1);
            vec4 vs5 = mix(hash4(n2.zzzz+p2), hash4(n2.wwww+p2), f1);
            vs4 = mix(vs4, vs5, f2);
            f1 = fract(x.zzzz+n3);
            f2 = fract(x.wwww+n3);
            f1=f1*f1*(3.0-2.0*f1);
            f2=f2*f2*(3.0-2.0*f2);
            vs1 = mix(vs1, vs2, f1);
            vs3 = mix(vs3, vs4, f1);
            vs1 = mix(vs1, vs3, f2);
            float r=dot(vs1,vec4(0.25));

            return r*r*(3.0-2.0*r);
        }`
    } );

    Object.defineProperty( app[ scope ], "normals",
    {
        enumerable: false,
        value: ` 
        #define GLSLIFY 1
        
        vec3 calculateNormal( vec3 position ) 
        {
            vec3 fdx = vec3(dFdx(position.x), dFdx(position.y), dFdx(position.z));
            vec3 fdy = vec3(dFdy(position.x), dFdy(position.y), dFdy(position.z));
            vec3 normal = normalize( cross( fdx, fdy ) );
        
            return normal;
        }`
    } );

    Object.defineProperty( app[ scope ], "random",
    {
        enumerable: false,
        value: ` 
        vec3 random3( vec3 c ) 
        {
            float j = 4096.0 * sin( dot( c, vec3( 17.0, 59.4, 15.0 ) ) );
            vec3 r;
            r.z = fract(512.0*j);
            j *= .125;
            r.x = fract(512.0*j);
            j *= .125;
            r.y = fract(512.0*j);
            return r - 0.5;
        }`
    } );

    Object.defineProperty( app[ scope ], "rotate",
    {
        enumerable: false,
        value: ` 
        mat3 rotationMatrix( float angle, vec3 axis ) 
        {
          float c = cos(angle);
          float s = sin(angle);
          float t = 1.0 - c;
          axis = normalize(axis);
          float x = axis.x, y = axis.y, z = axis.z;
          
          return mat3(
            t*x*x + c,    t*x*y + s*z,  t*x*z - s*y,
            t*x*y - s*z,  t*y*y + c,    t*y*z + s*x,
            t*x*z + s*y,  t*y*z - s*x,  t*z*z + c
          );
        }
        
        vec3 rotate( float angle, vec3 axis, vec3 position ) 
        {
            return rotationMatrix( angle, axis ) * position;
        }`
    } );

    Object.defineProperty( app[ scope ], "rotation",
    {
        enumerable: false,
        value: ` 
        mat4 rotationX( in float angle )
        {
            return mat4(
            1.0,		0,			  0,		0,
            0, 	cos(angle),	-sin(angle),		0,
            0, 	sin(angle),	 cos(angle),		0,
            0, 			0,			  0, 		1);
        }
        
        mat4 rotationY( in float angle )
        {
            return mat4(
            cos(angle),		0,		sin(angle),		0,
            0,				1.0,			 0,		0,
            -sin(angle),	0,		cos(angle),		0,
            0, 				0,				0,		1);
        }
        
        mat4 rotationZ( in float angle )
        {
            return mat4(
            cos(angle),		-sin(angle),	0,		0,
            sin(angle),		cos(angle),		0,		0,
            0,				0,				1,		0,
            0,				0,				0,		1);
        }
        `
    } );

    Object.defineProperty( app[ scope ], "simplex3d",
    {
        enumerable: false,
        value: `   
        float noise3D(vec3 p)
        {
            return fract(sin(dot(p ,vec3(12.9898,78.233,128.852))) * 43758.5453)*2.0-1.0;
        }
    
        /* 3d simplex noise */
        float simplex3d(vec3 p)
        {
            
            float f3 = 1.0/3.0;
            float s = (p.x+p.y+p.z)*f3;
            int i = int(floor(p.x+s));
            int j = int(floor(p.y+s));
            int k = int(floor(p.z+s));
            
            float g3 = 1.0/6.0;
            float t = float((i+j+k))*g3;
            float x0 = float(i)-t;
            float y0 = float(j)-t;
            float z0 = float(k)-t;
            x0 = p.x-x0;
            y0 = p.y-y0;
            z0 = p.z-z0;
            
            int i1,j1,k1;
            int i2,j2,k2;
            
            if(x0>=y0)
            {
                if(y0>=z0){ i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order
                else if(x0>=z0){ i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order
                else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }  // Z X Z order
            }
            else 
            { 
                if(y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order
                else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order
                else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order
            }
            
            float x1 = x0 - float(i1) + g3; 
            float y1 = y0 - float(j1) + g3;
            float z1 = z0 - float(k1) + g3;
            float x2 = x0 - float(i2) + 2.0*g3; 
            float y2 = y0 - float(j2) + 2.0*g3;
            float z2 = z0 - float(k2) + 2.0*g3;
            float x3 = x0 - 1.0 + 3.0*g3; 
            float y3 = y0 - 1.0 + 3.0*g3;
            float z3 = z0 - 1.0 + 3.0*g3;	
                         
            vec3 ijk0 = vec3(i,j,k);
            vec3 ijk1 = vec3(i+i1,j+j1,k+k1);	
            vec3 ijk2 = vec3(i+i2,j+j2,k+k2);
            vec3 ijk3 = vec3(i+1,j+1,k+1);	
                    
            vec3 gr0 = normalize(vec3(noise3D(ijk0),noise3D(ijk0*2.01),noise3D(ijk0*2.02)));
            vec3 gr1 = normalize(vec3(noise3D(ijk1),noise3D(ijk1*2.01),noise3D(ijk1*2.02)));
            vec3 gr2 = normalize(vec3(noise3D(ijk2),noise3D(ijk2*2.01),noise3D(ijk2*2.02)));
            vec3 gr3 = normalize(vec3(noise3D(ijk3),noise3D(ijk3*2.01),noise3D(ijk3*2.02)));
            
            float n0 = 0.0;
            float n1 = 0.0;
            float n2 = 0.0;
            float n3 = 0.0;
        
            float t0 = 0.5 - x0*x0 - y0*y0 - z0*z0;
            if(t0>=0.0)
            {
                t0*=t0;
                n0 = t0 * t0 * dot(gr0, vec3(x0, y0, z0));
            }
            float t1 = 0.5 - x1*x1 - y1*y1 - z1*z1;
            if(t1>=0.0)
            {
                t1*=t1;
                n1 = t1 * t1 * dot(gr1, vec3(x1, y1, z1));
            }
            float t2 = 0.5 - x2*x2 - y2*y2 - z2*z2;
            if(t2>=0.0)
            {
                t2 *= t2;
                n2 = t2 * t2 * dot(gr2, vec3(x2, y2, z2));
            }
            float t3 = 0.5 - x3*x3 - y3*y3 - z3*z3;
            if(t3>=0.0)
            {
                t3 *= t3;
                n3 = t3 * t3 * dot(gr3, vec3(x3, y3, z3));
            }
            return 96.0*(n0+n1+n2+n3);            
        }
    
        /* const matrices for 3d rotation */
        const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
        const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
        const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);
    
        /* directional artifacts can be reduced by rotating each octave */
        float simplex3d_fractal( vec3 m ) 
        {
            return 0.5333333*simplex3d( m*rot1 ) + 0.2666667*simplex3d( 2.0 * m * rot2 ) +0.1333333 * simplex3d( 4.0 * m * rot3 ) + 0.0666667*simplex3d( 8.0 * m );
        }`
    } );

    Object.defineProperty( app[ scope ], "translate",
    {
        enumerable: false,
        value: `
        mat4 translate( float x, float y, float z )
        {
            return mat4( 1.0, 0.0, 0.0, 0.0,
                         0.0, 1.0, 0.0, 0.0,
                         0.0, 0.0, 1.0, 0.0,
                         x,   y,   z,   1.0 );
        }`
    } );

    Object.defineProperty( app[ scope ], "turbulence",
    {
        enumerable: false,
        value: `
        ${ app[ scope ].noise }
                
        float turbulence( float p ) 
        {
            float w = 10.0;
            float t = -.5;
        
            for (float f = 1.0 ; f <= 10.0 ; f++ )
            {
                float power = pow( 2.0, f );
                t += noise( vec2( power * p, w ) ) / power;
            }
        
            return t;                
        }`
    } );

    Object.defineProperty( app[ scope ], "zero_circle",
    {
        enumerable: false,
        value: `
            float sphereZero(vec3 ray,vec3 pos,float r)
            {
                float b = dot(ray,pos);
                float c = dot(pos,pos) - b*b;
                float s=1.0;
                if ( c < r * r) s=0.0;
                return s;
            }
            
            void main() 
            {
                float zero=sphereZero(ray,pos,0.9);
                
                if (zero > 0.0) 
                {
                    vec4 s4=noiseSpace(ray,pos,100.0,mr,0.05,vec3(1.0,2.0,4.0),0.0);
                    s4.x=pow(s4.x,3.0);
                    gl_FragColor.xyz += mix(mix(vec3(1.0,0.0,0.0),vec3(0.0,0.0,1.0),s4.y*1.9),vec3(0.9,1.0,0.1),s4.w*0.75)*s4.x*pow(s4.z*2.5,3.0)*0.2 * zero;
                }
            }`
    } );


    // public methods
    Object.defineProperty( app[ scope ], "load",
    {
        enumerable: false,
        value: function( name, args )
        {
            var type = args.raw ? "RawShaderMaterial" : "ShaderMaterial";

            return new Promise( resolve =>
            {
                app[ scope ][ name ] = {};

                var url;
                var includes = { vertex: [], fragment: [] };
                var count = 0;

                [ "vertex", "fragment" ].forEach( ( type ) =>
                {
                    url = app.url + `js/shaders/glsl/${ name }_${ type }.glsl`.toLowerCase();
                    fetch( url )
                        .then( include( type ) )
                        .then( read => read.text() )
                        .then( code => create( type, code ) )
                        .then( () => { if ( count === 2 ) properties() } )
                        .then( () => { if ( count === 2 ) material() } )
                } );

                function include( type )
                {
                    if ( args.hasOwnProperty( "includes" ) )
                    {
                        if ( args.includes.hasOwnProperty( type ) )
                        {
                            args.includes[ type ].forEach( include =>
                            {
                                includes[ type ].push( app[ scope ][ include ] );
                            } );
                        }
                    }
                }

                function create( type, code )
                {
                    app[ scope ][ name ][ type ] = includes[ type ].length ? includes[ type ].join( '\n\n' ) + code : code;
                    count++;
                }

                // run once at end
                function properties()
                {
                    for( var prop in args )
                    {
                        if ( args.hasOwnProperty( prop ) )
                        {
                            switch ( prop )
                            {
                                case "includes":

                                break;

                                default:
                                    app[ scope ][ name ][ prop ] = {};
                                    Object.assign( app[ scope ][ name ][ prop ], args[ prop ] );
                                break;
                            }
                        }
                    }
                }

                function material()
                {
                    var material = new THREE[ type ](
                    {
                        vertexShader:   app[ scope ][ name ].vertex,
                        fragmentShader: app[ scope ][ name ].fragment,
                        uniforms: app[ scope ][ name ].uniforms
                    } );
                    Object.assign( material, app[ scope ][ name ].params );
                    material.name = name;
                    material.extensions.derivatives = true;

                    resolve( material );
                }
            } );
        }
    } );

    Object.defineProperty( app[ scope ], "material",
    {
        enumerable: false,
        value: function( name, args )
        {
            var shader = app[ scope ][ name ]();
    
            for( var prop in args )
            {
                if ( args.hasOwnProperty( prop ) )
                {
                    shader[ prop ] = {};
                    Object.assign( shader[ prop ], args[ prop ] );
                }
            }
    
            var material = new THREE.ShaderMaterial(
            {
                uniforms:       shader.uniforms,
                vertexShader:   shader.vertex,
                fragmentShader: shader.fragment
            } );
            Object.assign( material, shader.params );
            material.name = name;
            material.extensions.derivatives = true;

            return material;
        }
    } );

    Object.defineProperty( app[ scope ], "modify",
    {
        enumerable: false,
        value: function( name, args )
        {
            return new Promise( resolve =>
            {
                var url;
                var includes = { vertex: [], fragment: [] };
                var codes = { vertex: null, fragment: null };
                var attributes = [];
                var uniforms = [];
                var varyings = [];

                args.material.uniforms = {};
                args.material.extensions =
                {
                    derivatives: true
                };

                args.modify.forEach( ( type ) =>
                {
                    url = app.url + `js/shaders/chunks/${ name }_${ type }`.toLowerCase();
                    fetch( url )
                    .then( include( type ) )
                    .then( attribute() )
                    .then( uniform() )
                    .then( varying() )
                    .then( read => read.text() )
                    .then( code => create( type, code ) )
                } );

                function include( type )
                {
                    if ( args.hasOwnProperty( "includes" ) )
                    {
                        if ( args.includes.hasOwnProperty( type ) )
                        {
                            args.includes[ type ].forEach( include =>
                            {
                                includes[ type ].push( app[ scope ][ include ] );
                            } );
                        }
                    }
                }

                function attribute()
                {
                    if ( args.hasOwnProperty( "attributes" ) )
                    {
                        for ( var attribute in args.attributes )
                        {
                            if ( args.attributes.hasOwnProperty( attribute ) )
                            {
                                attributes.push( `attribute ${ args.attributes[ attribute ].type } ${ attribute };` );
                            }
                        }
                    }
                }

                function uniform()
                {
                    if ( args.hasOwnProperty( "uniforms" ) )
                    {
                        for ( var uniform in args.uniforms )
                        {
                            if ( args.uniforms.hasOwnProperty( uniform ) )
                            {
                                uniforms.push( `uniform ${ args.uniforms[ uniform ].type } ${ uniform };` );
                                args.material.uniforms[ uniform ] = args.uniforms[ uniform ];
                            }
                        }
                    }
                }

                function varying()
                {
                    if ( args.hasOwnProperty( "varyings" ) )
                    {
                        for ( var varying in args.varyings )
                        {
                            if ( args.varyings.hasOwnProperty( varying ) )
                            {
                                varyings.push( `varying ${ args.varyings[ varying ].type } ${ varying };` );
                            }
                        }
                    }
                }

                function create( type, code )
                {
                    codes[ type ] = code;
                    compiler()
                }

                function compiler()
                {
                    args.material.onBeforeCompile = shader =>
                    {
                        Object.assign( shader.uniforms, args.uniforms );

                        shader.fragmentShader = '#extension GL_OES_standard_derivatives : enable\n' + shader.fragmentShader;

                        [ "vertex", "fragment" ].forEach( type =>
                        {
                            if ( type === "vertex" )
                                shader[ `${ type }Shader` ] = attributes.length ? attributes.join( '\n' ) + '\n\n' + shader[ `${ type }Shader` ]           : shader[ `${ type }Shader` ];
                            shader[ `${ type }Shader` ] = uniforms.length ? uniforms.join( '\n' ) + '\n\n' + shader[ `${ type }Shader` ]                   : shader[ `${ type }Shader` ];
                            shader[ `${ type }Shader` ] = varyings.length ? varyings.join( '\n' ) + '\n\n' + shader[ `${ type }Shader` ]                   : shader[ `${ type }Shader` ];
                            shader[ `${ type }Shader` ] = includes[ type ].length ? includes[ type ].join( '\n\n' ) + '\n\n' + shader[ `${ type }Shader` ] : shader[ `${ type }Shader` ];
                            shader[ `${ type }Shader` ] = shader[ `${ type }Shader` ].replace( `#include <begin_${ type }>`, codes[ type ] );
                            args.material[ `${ type }Shader` ] = shader[ `${ type }Shader` ];
                        } );

                        args.update.forEach( uniform =>
                        {
                            args.material.uniforms[ uniform.name ].value += uniform.value;
                        } );
                    };
                }
        
                resolve( args.material );
            } );
        }
    } );

    // sample format required for synchronous materials
    app[ scope ].basic = function()
    {
        return {
            params: {},
            uniforms: {},
            vertex: `
            void main() 
            {           
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
            fragment: `
            void main() 
            {
                gl_FragColor = vec4( 1.0 );
            }`
        };
    };
};