var options = null;

var prop = function( name )
{
    const dome =
    {
        name: name,
        parent: this.stage.persistent,
        color: new THREE.Color( 1, 1, 1 )
    };

    const args =
    {
        includes: { fragment: [ "noise", "random" ] },
        params:
        {
            side: THREE.FrontSide,
            transparent: true,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            alpha:      { value: 0.8 },
            time:       { value: 0 },
            scale:      { value: 2 },
            speed:      { value: 0.01 },
            brightness: { value: 0.3 }
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new this.presets.Dome( dome );
    this.props[ name ].shader.load( name, args );

    this.arrays.persistent[ "background" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.time.value", value: 0.01 } );

    return this.props[ name ];
};

export { prop, options };
