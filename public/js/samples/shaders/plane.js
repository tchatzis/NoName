var options = {};

var prop = function( name )
{
    options.blur =
    {
        includes: { fragment: [ "gaussian" ] },
        params:
        {
            side: THREE.DoubleSide

        },
        uniforms:
        {
            spread:     { value: 6.0 },
            h:          { value: 1.0 / window.innerHeight },
            w:          { value: 1.0 / window.innerWidth },
            time:       { value: 0 },
            texture:    { value: this.assets.textures[ "radial" ].texture }
        }
    };

    options.current =
    {
        includes: { fragment: [ "simplex3d" ] },
        uniforms:
        {
            opacity:    { value: 0.5 },
            time:       { value: 0 },
            power:      { value: 0.2 }
        }
    };

    options.layers =
    {
        uniforms:
        {
            opacity0: 0.2,
            map0: { value: this.assets.textures[ "mosaic" ].texture },
            opacity1: 0.2,
            map1: { value: this.assets.textures[ "aliens" ].texture }
        }
    };

    options.mandlebrot =
    {
        params:
        {
            side: THREE.FrontSide,
            transparent: true
        },
        uniforms:
        {
            time: { value: 0 },
            iterations: { value: 128 },
            opacity: { value: 1 },
            palette: { value: new THREE.Vector3( 2.5, 3.6, 5 ) }, // not a color
            pan:     { value: new THREE.Vector3( -1.365, -0.022, 0 ) } //-.745,.186
        }
    };

    options.mirror =
    {
        uniforms:
        {
            tDiffuse: { value: null },
            color: { value: new THREE.Color( 0xFFFFFF ) },
            textureMatrix: { value: new THREE.Matrix4() }
        }
    };

    options.sun =
    {
        includes: { fragment: [ "noise4q", "cutoff" ] },
        uniforms:
        {
            time: { value: 0 },
            threshold: { value: 0 },
            billboard: { value: true }
        }
    };

    options.texture =
    {
        includes: {},
        params:
        {
            side: THREE.DoubleSide
        },
        uniforms:
        {
            texture: { value: this.assets.textures[ "mosaic" ].texture }
        }
    };

    options.xcurrent =
    {
        includes: { fragment: [ "simplex3d" ] },
        params:
        {
            side: THREE.DoubleSide
        },
        uniforms:
        {
            opacity:    { value: 0.5 },
            time:       { value: 0 },
            power:      { value: 0.2 },
            color:      { value: new THREE.Color( 0.0, 0.7, 0.0 ) },
            skyBox:     { value: false }
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

        option.type = key;

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

        var prop = new this.presets.Plane( plane );
            prop.shader.load( key, option );

        if ( option.uniforms.palette )
        {
            let pan = new Widget();
                pan.init.call( this, { title: "palette", parent: this.ui.widget, target: option.uniforms.palette.value } );
        }

        if ( option.uniforms.pan )
        {
            let pan = new Widget();
                pan.init.call( this, { title: "pan", parent: this.ui.widget, target: option.uniforms.pan.value, increment: new THREE.Vector3( 0.0001, 0.0001, 0.01 ) } );
        }

        this.arrays.animations.push( { name: name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };