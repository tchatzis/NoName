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
        includes: { fragment: [ "noise" ] },
        params:
        {
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            alpha:      { value: 0.7 },
            time:       { value: 0 },
            scale:      { value: 2 },
            speed:      { value: 0.025 },
            brightness: { value: 0.1 }
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new this.presets.Dome( dome );
    this.props[ name ].shader.load( name, args )

    this.props[ name ].animate = function()
    {
        this.arrays.persistent[ "background" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    this.props[ name ].animate();

    return this.props[ name ];
};

export { prop, options };
