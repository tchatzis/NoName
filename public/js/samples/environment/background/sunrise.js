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
        params:
        {
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
            sunPosition: { value: new THREE.Vector3( 0, 0, 0 ) }
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new this.presets.Dome( dome );
    this.props[ name ].group.rotateY( Math.PI / 2 );
    this.props[ name ].shader.load( name, args );

    this.props[ name ].animate = function()
    {
        this.arrays.persistent[ "background" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.sunPosition.value.y", value: 0.001 } );
    }.bind( this );

    this.props[ name ].animate();   

    return this.props[ name ];
};

export { prop, options };