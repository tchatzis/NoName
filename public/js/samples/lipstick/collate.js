var options = {};

var prop = function( name )
{
    const plane =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        width: 4,
        height: 4,
        widthSegments: 1,
        heightSegments: 1
    };

    const args =
    {
        name: name,
        front: new THREE.Color( "blue" ),
        back: new THREE.Color( "green" )
    };

    this.props[ name ] = new this.presets.Plane( plane );
    this.props[ name ].enhance( this.lipstick.Collate, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.x", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };