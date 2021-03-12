var options = {};

var prop = function( name )
{
    options.snake =
    {
        type: "snake",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 10000,
        tick: 0.01,
        axis: new THREE.Vector3( -0.5, 0, -0.5 ),
        spin: new THREE.Vector3( 1, 1, 1 ),
        scalex: new THREE.Vector3( 0.67, 0.93, 2.88 ),
        scaley: new THREE.Vector3( 0.1, 10, 0.1 ),
        scalez: new THREE.Vector3( 0.66, 0.92, 2.88 ),
        map: new this.textures.Sprite( sprites[ "green" ] ).texture
    };

    options.tornado =
    {
        type: "tornado",
        geometry: new THREE.PlaneBufferGeometry( 0.05, 0.05 ),
        count: 10000,
        lifespan: 10000,
        tick: 0.01,
        axis: new THREE.Vector3( -0.5, 0, -0.5 ),
        spin: new THREE.Vector3( 0, 1, 0 ),
        scalex: new THREE.Vector3( 0.67, 1.93, 0.88 ),
        scaley: new THREE.Vector3( 1, 10, 1 ),
        scalez: new THREE.Vector3( 0.55, 1.92, 0.85 ),
        map: new this.textures.Sprite( sprites[ "smoke" ] ).texture
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option )
    {
        option.name = option.type;
        option.parent = this.stage.props;
        option.shader = "vortex";
        option.layer = 0;

        var exploder = new Exploder();
            exploder.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };