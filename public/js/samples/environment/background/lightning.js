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
        includes: { fragment: [ "simplex3d" ] },
        params:
        {
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            time:       { value: 0 },
            offset:     { value: 0 },
            noise:      { value: 2 },
            amount:     { value: 0.08 },
            spread:     { value: 3 },
            power:      { value: 0.15 },
            zoom:       { value: 1 },
            pos:        { value: 0 },
            clouds:     { value: 0.75 },
            decay:      { value: 10 },
            alpha:      { value: 1 },
            palette:    { value: new THREE.Vector3( 0.4, 0.55, 0.75 ) }
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new this.presets.Dome( dome );
    this.props[ name ].shader.load( name, args );

    var update = function()
    {
        if ( this.props[ name ].mesh.material.uniforms )
        {
            this.props[ name ].mesh.material.uniforms.time.value = 0;
            this.props[ name ].mesh.material.uniforms.offset.value = Math.random() * 2 + 1;
            this.props[ name ].mesh.material.uniforms.pos.value = Math.random() * 0.5 + 0.25;
            this.props[ name ].mesh.material.uniforms.decay.value = Math.random() * 8 + 2;
        }

        this.kill( this.arrays.persistent[ "background" ], name );
        this.arrays.persistent[ "background" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.time.value", value: 0.01 } );

        setTimeout( update, Math.random() * 2000 + 1000 );
    }.bind( this );

    update();

    return this.props[ name ];
};

export { prop, options };