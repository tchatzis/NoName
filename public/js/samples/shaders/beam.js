var options = {};

    options.Laser =
    {
        includes: { fragment: [ "noise" ] },
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0
        },
        uniforms:
        {
            color:      { value: new THREE.Color( 0x00ff33 ) },
            time:       { value: 0.0 },
            resolution: { value: { x: 16, y: 16 } },
            billboard:  { value: true }
        }
    };

    options.Neon =
    {
        includes: { fragment: [ "noise" ] },
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0
        },
        uniforms:
        {
            color:      { value: new THREE.Color( 0xff6600 ) },
            time:       { value: 0.0 },
            billboard:  { value: true }
        }
    };

var prop = function( name )
{
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
        option.type = key;

        const beam =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFFFF ),
            width: 0.1,
            height: 100,
            widthSegments: 20,
            heightSegments: 20,
            vertical: true
        };

        var prop = new this.presets.Plane( beam );
            prop.shader.load( key, option );
            //prop.mesh.layers.set( 1 );

        this.arrays.animations.push( { name: name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };