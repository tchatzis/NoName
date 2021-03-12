var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 2,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 )
    };

    const args =
    {
        name: name,
        loop: false,
        src: [ "/images/videos/MVI_0037.MOV",
            "/images/videos/MVI_0038.MOV",
            "/images/videos/MVI_0041.MOV",
            "/images/videos/MVI_0043.MOV",
            "/images/videos/peanut.mp4",
            "/images/videos/fly_in.mp4" ]
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.lipstick.VideoCube, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );
    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.z", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };