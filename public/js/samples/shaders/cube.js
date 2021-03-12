var options = {};

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
            iterations: { value: 256 },
            opacity: { value: 1 },
            palette: { value: new THREE.Color( 2.5, 3.6, 5 ) }, // not a color
            pan:     { value: new THREE.Vector3( -0.745,.186, -10 ) }
        }
    };

    options.wood =
    {
        includes: { fragment: [ "simplex3d" ] },
        uniforms:
        {
            color1: { value: new THREE.Color( 0.5411764705882353, 0.23137254901960785, 0.11764705882352941 ) },
            color2: { value: new THREE.Color( 0.7843137254901961, 0.5411764705882353, 0.4196078431372549 ) },
            frequency: { value: 2 },
            noiseScale: { value: 4 },
            ringScale: { value: 0.6 },
            contrast: { value: 4 },
            time: { value: 0 }
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

        const cube =
        {
            name: name,
            parent: this.stage.props,
            size: 10,
            segments: 1,
            position: new THREE.Vector3( 0, 0, 0 )
        };

        var prop = new this.presets.Cube( cube );
            prop.shader.load( key, option );
        
        this.arrays.animations.push( { name: name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );
        this.arrays.animations.push( { name: name, object: prop.mesh, path: "rotation.x", value: 0.01 } );
        this.arrays.animations.push( { name: name, object: prop.mesh, path: "rotation.y", value: 0.01 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };