var options = {};

var prop = function( name )
{
    options.crystals =
    {
        type: "crystals",
        includes: { vertex: [ "simplex3d" ] },
        params:
        {
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            time: { value: 0.0 },
            scale: { value: new THREE.Vector3( 1, 1, 1 ) },
            brightness: { value: 2 }
        },
        layer: 1
    };

    options.kaleidoscope =
    {
        type: "glow",
        includes: { fragment: [ "noise" ] },
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.NormalBlending
        },
        uniforms:
        {
            viewVector: { value: this.stage.camera.position },
            c:          { value: 0.5 },
            power:      { value: 3.2 },
            glowColor:  { value: new THREE.Color( 0x006633 ) },
            opacity:    { value: 1 },
            time:       { value: 0.0 }
        },
        layer: 0
    };

    options.plasma =
    {
        type: "glow",
        includes: { fragment: [ "noise" ] },
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.NormalBlending
        },
        uniforms:
        {
            viewVector: { value: this.stage.camera.position },
            c:          { value: 0.2 },
            power:      { value: 3.0 },
            glowColor:  { value: new THREE.Color( 0x00ff66 ) },
            opacity:    { value: 0.1 },
            time:       { value: 0.0 }
        },
        layer: 1
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.props[ name ].group;

        const sphere =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0x000000 ),
            radius: 4,
            widthSegments: 128,
            heightSegments: 128,
            phiStart: 0,
            phiLength:  Math.PI * 2,
            thetaStart: 0,
            thetaLength: Math.PI * 2
        };

        var prop = new this.presets.Sphere( sphere );
            prop.shader.load( option.type, option );
            prop.mesh.layers.set( option.layer );

        this.arrays.animations.push( { name: name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };