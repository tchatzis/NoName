var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 10,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 )
    };

    const args =
    {
        uniforms:
        {
            tCube: { value: null }
        }
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].shader.load( name, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );
    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.z", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };