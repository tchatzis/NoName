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
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0
        },
        uniforms:
        {
            mRefractionRatio: { value: 1.02 },
            mFresnelBias:     { value: 0.1 },
            mFresnelPower:    { value: 3.0 },
            mFresnelScale:    { value: 1.0 },
            tCube:            { value: null },
            time:             { value: 0.0 }
        }
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].shader.load( name, args );

    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );
    this.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.z", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };