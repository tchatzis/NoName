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
        heightSegments: 1,
        vertical: true
    };

    const args =
    {
        name: name,
        loop: true,
        src: "/images/videos/peanut.mp4"
    };

    this.props[ name ] = new this.presets.Plane( plane );
    this.props[ name ].enhance( this.lipstick.Video, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };