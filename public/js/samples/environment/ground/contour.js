var options =
{
    carton:
    {
        type: "mounds",
        amplitude: 1,
        noiseScale: 64
    },
    mounds:
    {
        type: "mounds",
        amplitude: 1,
        noiseScale: 16
    },
    noise:
    {
        type: "noise",
        amplitude: 1,
        noiseScale: 0.01,
        seed: () => Math.random()
    },
    ripple:
    {
        type: "ripple",
        amplitude: 1,
        noiseScale: 1
    }
};

var prop = function( name )
{
    const pattern =
    {
        type: "pattern",
        mod: 3,
        rem: 1,
        color: new THREE.Color( 0x000000 )
    };

    this.props[ name ] = new this.presets.Group( { name: name, parent: this.stage.persistent } );
    this.props[ name ].submenu = function( option, key )
    {
        option.name = key;

        const plane =
        {
            name: name,
            parent: this.stage.persistent,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0x0FFFF00 ), // base color
            width: 20,
            height: 20,
            widthSegments: 100,
            heightSegments: 100
        };

        var solid = new this.presets.Solid( plane );
            solid.enhance( this.lipstick.pattern, pattern );
            solid.enhance( this.lipstick.contour, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };