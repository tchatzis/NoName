var options = {};
    options.fern =
    {
        type: "fern",
        iterations: 10000,
        size: 0.05,
        spacing: 0.005,
        dimensions: new THREE.Vector3( 5, 5, 5 ),
        opaque: 0.5,
        hue: 0.66,
        uniforms:
        {
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: 0 } // -1: no movement, 0: start, 1: end
        }
    };

    options.tree =
    {
        type: "tree",
        depth: 5,
        branches: { minimum: 4, maximum: 8 },
        joint:
        {
            color: [ new THREE.Color( "tan" ) ],
            diameter: 1
        },
        leaf:
        {
            color: [ new THREE.Color( "olive" ), new THREE.Color( "darkolivegreen" ), new THREE.Color( "olivedrab" ) ],
            diameter: 1,
            length: 1,
            taper: 1,
            tilt: { angle: 0, variance: 0 }
        },
        stalk:
        {
            color: [ new THREE.Color( "tan" ) ],
            diameter: 1,
            length: 10,
            taper: 0.67,
            tilt: { angle: 90, variance: 50 }
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
    this.props[ name ].submenu = function( option )
    {
        option.parent = this.stage.props;
        option.name = option.type;

        var trees = new Trees();
            trees.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };