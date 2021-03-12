var options = {};

var prop = function( name )
{
    const plane =
    {
        name: name,
        parent: this.stage.persistent,
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 0.5, 0.5, 0.5 ),
        width: 10,
        height: 5,
        widthSegments: 200,
        heightSegments: 200
    };

    const args =
    {
        name: name,
        app: this,
        map: this.assets.displacements[ "bump_map_3" ],
        scale: 0.5,
        bias: 0
    };
    
    

    this.props[ name ] = new this.presets.Plane( plane );
    this.props[ name ].enhance( this.lipstick.displacement, args );

    return this.props[ name ];
};

export { prop, options };