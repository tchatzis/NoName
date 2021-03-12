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
        parent: this.stage.scene,
        near: 0.1,
        far: this.stage.world * 2,
        resolution: 256,
        color: new THREE.Color( 0xFFFFFF )
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.lipstick.CubeCamera, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );
    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.z", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };