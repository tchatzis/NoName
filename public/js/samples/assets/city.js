var options = {};

var prop = function( name )
{
    var city =
    {
        name: name,
        parent: this.stage.props,
        scale: 1
    };

    this.props[ name ] = new City();
    this.props[ name ].init.call( this, city );
    this.props[ name ].add( { name: "water", color: new THREE.Color( 0x001133 ) } );
    this.props[ name ].add( { name: "ground", color: new THREE.Color( 0x001100 ), wireframe: false } );
    this.props[ name ].add( { name: "raycaster", color: new THREE.Color( 0xFF0000 ) } );

    return this.props[ name ];
};

export { prop, options };