var options = {};

var prop = function( name )
{
    options.fire =
    {
        type: "fire",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 10000,
        decay: 0.5,
        tick: 0.05,
        axis: new THREE.Vector3( -1, 4, -1 ),
        taper: new THREE.Vector3( 0, 0.2, 0 ),
        spin: new THREE.Vector3( 0, 0.1, 0 ),
        rotation: new THREE.Vector3( 0, 0, 0 ),
        saturation: 0.7,
        map: new this.textures.Sprite( sprites[ "fire" ] ).texture
    };

    options.fountain =
    {
        type: "fountain",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 20000,
        decay: 2,
        tick: 0.05,
        axis: new THREE.Vector3( -0.2, 2, -0.2 ),
        taper: new THREE.Vector3( 0, 2, 0 ),
        spin: new THREE.Vector3( 0.1, 0.12, 0.09 ),
        rotation: new THREE.Vector3( 0.1, 0, 0.1 ),
        saturation: 0.5,
        map: new this.textures.Sprite( sprites[ "cold" ] ).texture
    };

    options.into =
    {
        type: "into",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 10000,
        decay: 10,
        tick: 0.05,
        axis: new THREE.Vector3( -0.1, -0.1, 4.5 ),
        taper: new THREE.Vector3( 0, 0, 0 ),
        spin: new THREE.Vector3( 0, 0, 0 ),
        rotation: new THREE.Vector3( 0, 0.01, 1 ),
        saturation: 1,
        map: new this.textures.Sprite( sprites[ "violet" ] ).texture
    };

    options.laser =
    {
        type: "laser",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 20000,
        lifespan: 10000,
        decay: 10,
        tick: 0.1,
        axis: new THREE.Vector3( 10, -0.01, -0.01 ),
        taper: new THREE.Vector3( 0, 0, 0 ),
        spin: new THREE.Vector3( 0, 0, 0 ),
        rotation: new THREE.Vector3( 0, 0, 0 ),
        saturation: 1,
        map: new this.textures.Sprite( sprites[ "beam" ] ).texture
    };

    options.nuclear =
    {
        type: "nuclear",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 10000,
        decay: 2,
        tick: 0.025,
        axis: new THREE.Vector3( -3, 2, -3 ),
        taper: new THREE.Vector3( 0, 0.1, 0 ),
        spin: new THREE.Vector3( 0.5, 0.4, 0.7 ),
        rotation: new THREE.Vector3( 0, 1, 0 ),
        saturation: 0.3,
        map: new this.textures.Sprite( sprites[ "fire" ] ).texture
    };

    options.radial =
    {
        type: "radial",
        parent: this.stage.scene,
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        count: 10000,
        lifespan: 20000,
        decay: 4,
        tick: 0.1,
        axis: new THREE.Vector3( -5, 0.1, -5 ),
        taper: new THREE.Vector3( 0, 0, 0 ),
        spin: new THREE.Vector3( 0, 0.1, 0 ),
        rotation: new THREE.Vector3( 0.1, 0.1, 0 ),
        saturation: 0.8,
        map: new this.textures.Sprite( sprites[ "cyan" ] ).texture
    };

    options.splash =
    {
        type: "smoke",
        geometry: new THREE.PlaneBufferGeometry( 0.03, 0.03 ),
        count: 10000,
        lifespan: 2000,
        decay: 5,
        tick: 0.1,
        axis: new THREE.Vector3( -1, 4, -1 ),
        taper: new THREE.Vector3( 0, 0.1, 0 ),
        spin: new THREE.Vector3( 0, 1, 0 ),
        rotation: new THREE.Vector3( 0, 5, 0 ),
        saturation: 0.2,
        map: new this.textures.Sprite( sprites[ "smoke" ] ).texture
    };

    options.starburst =
    {
        type: "starburst",
        geometry: new THREE.PlaneBufferGeometry( 0.1, 0.1 ),
        size: 1,
        count: 10000,
        lifespan: 10000,
        decay: 10,
        tick: 0.05,
        axis: new THREE.Vector3( -3, 0, -3 ),
        taper: new THREE.Vector3( 0, 0, 1 ),
        spin: new THREE.Vector3( 0, 0, 0 ),
        rotation: new THREE.Vector3( 0, 0, 1 ),
        saturation: 1,
        map: new this.textures.Sprite( sprites[ "green" ] ).texture
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
        option.shader = "exploder";
        option.layer = 1;

        var exploder = new Exploder();
            exploder.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };