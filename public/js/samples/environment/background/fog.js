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
            transparent: true,
            blending: THREE.AdditiveBlending
        },
        uniforms:
        {
            alpha:      { value: 0.7 },
            speed:      { value: 0.2 },
            time:       { value: 0 },
            contrast:   { value: 1.2 },
            brightness: { value: 0.2 }
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new this.presets.Dome( dome );
    this.props[ name ].shader.load( name, args )
        /*.then( () =>
        {
            var rtt =
            {
                name: name,
                material: this.props[ name ].mesh.material.clone(),
                height: 1024,
                width: 1024,
                destination: "background"
            };

            this.props[ name ].enhance( this.lipstick.Quad, rtt );

            var geometry = new THREE.PlaneGeometry( 4, 4 );
            var material = new THREE.MeshBasicMaterial();
                material.map = this.props[ name ].texture;
            var mesh = new THREE.Mesh( geometry, material );

            this.props[ name ].group.add( mesh );
        } );*/

    this.props[ name ].animate = function()
    {
        this.arrays.persistent[ "background" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    this.props[ name ].animate();

    return this.props[ name ];
};

export { prop, options };