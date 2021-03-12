var options =
{
    menger:
    {
        color: new THREE.Color( 0x999999 ),
        dimensions: { x: 3, y: 3, z: 3 },
        iterations: 3,
        size: 1,
        spacing: 0.01,
        opaque: 1
    },
    ripple:
    {
        color: new THREE.Color( 0x996600 ),
        dimensions: { x: 100, y: 1, z: 100 },
        uniforms:
        {
            wavelength: { value: 5 },
            time:       { value: 0 },
            phase:      { value: 4 }, // speed
            amplitude:  { value: 3 },
            brightness: { value: 2 }
        },
        iterations: 1,
        size: 1,
        spacing: 0.01,
        opaque: 0.8
    },
    trajectory:
    {
        color: new THREE.Color( 0x999999 ),
        dimensions: { x: 1, y: 1, z: 1 },
        params: 
        {
            type: "knot",
            a: 2,
            b: 3,
            c: 4,
            speed: 1
        },
        size: 0.5,
        spacing: 0.01,
        opaque: 1
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
        option.parent = this.stage.props;
        option.name = key;
        option.type = key;
        
        var voxels = new Voxels();
            voxels.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };
