var options =
{
    calico:
    {
        type: "calico",
        mod: 2,
        rem: 0,
        s: 0.7,
        l: 0.7
    },
    checkers:
    {
        type: "checkers",
        color: new THREE.Color( 0x000000 )
    },
    horizontal:
    {
        type: "stripes",
        color: new THREE.Color( 0x000000 ),
        orientation: "h"
    },
    steps:
    {
        type: "pattern",
        mod: 6,
        rem: 3,
        color: new THREE.Color( 0x000000 )
    },
    seven:
    {
        type: "pattern",
        mod: 7,
        rem: 2,
        color: new THREE.Color( 0x000000 )
    },
    vertical:
    {
        type: "stripes",
        color: new THREE.Color( 0x000000 ),
        orientation: "v"
    },
    zig:
    {
        type: "pattern",
        mod: 3,
        rem: 1,
        color: new THREE.Color( 0x000000 )
    },
};

var prop = function( name )
{
    this.props[ name ] = new this.presets.Group( { name: name, parent: this.stage.persistent } );
    this.props[ name ].submenu = function( option, key )
    {
        const plane =
        {
            name: name,
            parent: this.stage.persistent,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFFFF ),
            width: 20,
            height: 20,
            widthSegments: 20,
            heightSegments: 20
        };
        
        option.name = key;

        var solid = new this.presets.Plane( plane );
            solid.enhance( this.lipstick.pattern, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };