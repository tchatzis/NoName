var shapes =
{
    "bounding": 0,
    "box": 1,
    "cylinder": 2,
    "ellipsoid": 3,
    "sphere": 4,
    "torus": 5,
    "cone": 6,
    "pyramid": 7,
    "octahedron": 8,
    "plane": 9
};

var options = {};

var prop = function( name )
{
    options.demo =
    {
        type: "raymarching",
        raw: true,
        includes: {},
        params: {},
        uniforms:
        {
            resolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            cameraWorldMatrix: { value: this.stage.camera.matrixWorld },
            cameraProjectionMatrixInverse: { value: new THREE.Matrix4().getInverse( this.stage.camera.projectionMatrix ) },
            lightDir: { value: new THREE.Vector3( -0.5, 0.5, 0.9 ) }
        }
    };

    options.tiling =
    {
        type: "distance",
        raw: true,
        includes: {},
        params: {},
        uniforms:
        {
            resolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            cameraWorldMatrix: { value: this.stage.camera.matrixWorld },
            cameraProjectionMatrixInverse: { value: new THREE.Matrix4().getInverse( this.stage.camera.projectionMatrix ) },
            size: { value: 1 },
            color: { value: new THREE.Color( 1, 1, 1 ) },
            fogColor: { value: new THREE.Color( 0, 0, 0 ) },
            fogExp: { value: 0.5 },
            fogCoeff: { value: 0.12 },
            time: { value: 0 },
            lightPos: { value: this.stage.lights.directional.position },
            far: { value: this.stage.camera.far },
            background: { value: new THREE.Color( 0, 0, 0 ) },
            shape: { value: 4 },
            inside: { value: 1 },
            interval: { value: new THREE.Vector3( 2, 2, 2 ) },
            ground: { value: -1 }
        }
    };

    options.mandlebox =
    {
        type: "mandlebox",
        raw: true,
        includes: {},
        params: {},
        uniforms:
        {
            resolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            cameraWorldMatrix: { value: this.stage.camera.matrixWorld },
            cameraProjectionMatrixInverse: { value: new THREE.Matrix4().getInverse( this.stage.camera.projectionMatrix ) },
            size: { value: 0.5 },
            scale: { value: 3 },
            color1: { value: new THREE.Color().setHSL( 0.6, 0.33, 0.28 ) },
            color2: { value: new THREE.Color().setHSL( 0.14, 0.13, 0.5 ) },
            color3: { value: new THREE.Color().setHSL( 0.08, 1, 0.67 ) },
            fogColor: { value: new THREE.Color( 0, 0, 0 ) },
            fogExp: { value: 0.5 },
            fogCoeff: { value: 0.12 },
            time: { value: 0 },
            lightPos: { value: this.stage.lights.directional.position },
            far: { value: this.stage.camera.far },
            background: { value: new THREE.Color( 0, 0, 0 ) },
            limits: { value: new THREE.Vector2( 0, 1 ) }
        }
    };

    options.mandlebulb =
    {
        type: "mandlebulb",
        raw: true,
        includes: {},
        params: {},
        uniforms:
        {
            resolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            cameraWorldMatrix: { value: this.stage.camera.matrixWorld },
            cameraProjectionMatrixInverse: { value: new THREE.Matrix4().getInverse( this.stage.camera.projectionMatrix ) },
            scale: { value: 4 },
            color1: { value: new THREE.Color().setHSL( 0.6, 0.33, 0.28 ) },
            color2: { value: new THREE.Color().setHSL( 0.14, 0.13, 0.5 ) },
            color3: { value: new THREE.Color().setHSL( 0.08, 1, 0.67 ) },
            fogColor: { value: new THREE.Color( 0, 0, 0 ) },
            fogExp: { value: 0.5 },
            fogCoeff: { value: 0.12 },
            time: { value: 0 },
            lightPos: { value: this.stage.lights.directional.position },
            far: { value: this.stage.camera.far },
            background: { value: new THREE.Color( 0, 0, 0 ) },
            limits: { value: new THREE.Vector2( 4, 1 ) }
        }
    };
    
    const group =
    {
        name: name,
        parent: this.stage.props
    };
    
    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        this.props[ name ].clear();

        option.parent = this.props[ name ].group;
        option.name = key;

        const plane =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFFFF ),
            width: 20,
            height: 20,
            widthSegments: 20,
            heightSegments: 20,
            vertical: true
        };

        var load = async function()
        {
            var prop = new this.presets.Plane( plane );
                prop.mesh.frustumCulled = false;

            await prop.shader.load( option.type, option );

            //var fps = new Widget()
            //    fps.init.call( this, { title: "fps", parent: this.ui.widget, target: new Widget.FPS( { value: this.utils.fps, samples: 30, history: 30 } ) } );

            // use uniform.object.value for uniform objects
            // and use the uniform.object for scalars - float, integer, select

            //var camera = new Widget();
            //    camera.init.call( this, { title: "camera", parent: this.ui.widget, target: new Widget.Values( { value: this.stage.camera.position, increments: 0.01 } ) } );

            /*if ( option.uniforms.hasOwnProperty( "color1" ) )
            {
                let color1 = new Widget();
                    color1.init.call( this, { title: "color 1", parent: this.ui.widget, target: new Widget.HSL( { value: option.uniforms.color1.value } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "color2" ) )
            {
                let color2 = new Widget();
                    color2.init.call( this, { title: "color 2", parent: this.ui.widget, target: new Widget.HSL( { value: option.uniforms.color2.value } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "color3" ) )
            {
                let color3 = new Widget();
                    color3.init.call( this, { title: "color 3", parent: this.ui.widget, target: new Widget.HSL( { value: option.uniforms.color3.value } ) } );
            }*/

            /*if ( option.uniforms.hasOwnProperty( "interval" ) )
            {
                // the .value object must be used for uniforms
                let interval = new Widget();
                    interval.init.call( this, { title: "repeat", parent: this.ui.widget, target: new Widget.UpDown( { value: option.uniforms.interval.value, min: 0, max: 10, increments: 1 } ) } );
            }*/

            /*if ( option.uniforms.hasOwnProperty( "fogColor" ) )
            {
                let fog = new Widget();
                    fog.init.call( this, { title: "fog color", parent: this.ui.widget, target: option.uniforms.fogColor.value } );
            }

            if ( option.uniforms.hasOwnProperty( "fogExp" ) )
            {
                let exp = new Widget()
                    exp.init.call( this, { title: "fog exp", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.fogExp, min: 0, max: 8, increments: 0.01 } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "fogCoeff" ) )
            {
                let coeff = new Widget()
                    coeff.init.call( this, { title: "fog coeff", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.fogCoeff, min: 0, max: 4, increments: 0.01 } ) } );
            }*/

            if ( option.uniforms.hasOwnProperty( "shape" ) )
            {
                let shape = new Widget();
                    shape.init.call( this, { title: "shape", parent: this.ui.widget, target: new Widget.Option( { value: "sphere", object: option.uniforms.shape, options: shapes } ) } );
                //let select = new Widget();
                //    select.init.call( this, { title: "shape", parent: this.ui.widget, target: new Widget.Select( { value: "sphere", key: "value", object: option.uniforms.shape, options: shapes } ) } );

            }

            /*if ( option.uniforms.hasOwnProperty( "limits" ) )
            {
                // the .value object must be used for uniforms
                let limits = new Widget();
                    limits.init.call( this, { title: "limits", parent: this.ui.widget, target: new Widget.UpDown( { value: option.uniforms.limits.value, min: 0, max: 3, increments: 0.01 } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "inside" ) )
            {
                let inside = new Widget()
                    inside.init.call( this, { title: "inside", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.inside, min: 0, max: 16, increments: 0.01 } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "size" ) )
            {
                let size = new Widget()
                    size.init.call( this, { title: "size", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.size, min: 0.01, max: 1.5, increments: 0.01 } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "scale" ) )
            {
                let scale = new Widget()
                    scale.init.call( this, { title: "scale", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.scale, min: 1, max: 10, increments: 0.01 } ) } );
            }

            if ( option.uniforms.hasOwnProperty( "ground" ) )
            {
                let ground = new Widget()
                    ground.init.call( this, { title: "floor", parent: this.ui.widget, target: new Widget.Float( { value: option.uniforms.ground, min: -10, max: 0, increments: 0.01 } ) } );
            }*/

            if ( option.uniforms.hasOwnProperty( "time" ) )
            {
                this.arrays.animations.push( { name: name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );
            }
        }.bind( this );

        load();

    }.bind( this );

    return this.props[ name ];
};

export { prop, options };