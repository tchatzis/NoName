var options = {};

var prop = function( name )
{
    options.array =
    {
        type: "path",
        geometry: null,
        size: 0.5,
        count: 1000,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 100,
        // attributes
        lifespan: 20000,
        // uniforms
        map: new this.textures.Sprite( sprites[ "violet" ] ).texture,
        opacity: 1,
        noise: 50,
        Path: function()
        {
            this.name = name;
            this.category = "array";
            this.params = new Path.Plots ( { type: "array", count: 1, resolution: 10, array: [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 2, 0 ),  new THREE.Vector3( 4, 2, 0 ), new THREE.Vector3( 4, 2, 3 ), new THREE.Vector3( 0, 2, 3 ), new THREE.Vector3( 0, 0, 3 ), new THREE.Vector3( 5, 0, 0 ) ] } );
            this.object = new Path.Object( { size: 0.01, visible: true,  color: new THREE.Color( 0x0000ff ), opaque: 0.5 } );
            this.line   = new Path.Line  ( {             visible: false, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } );
            this.animation = { animate: true, loop: true, direction: "forward", onPathAnimationComplete: null };
        }
    };

    options.helix =
    {
        type: "helix",
        geometry: null,
        size: 0.05,
        count: 2000,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 100,
        // attributes
        lifespan: 10000,
        noise: 10,
        // uniforms
        map: new this.textures.Sprite( sprites[ "fire" ] ).texture,
        opacity: 0.5,
        // id and callback added inside emitter for every particle
        Trajectory: function()
        {
            this.type = "helix";
            this.a = 2;
            this.b = 0.1;
            this.limit = new THREE.Vector3( Infinity, Infinity, -100 );
            this.speed = 8;
        }
    };

    options.parabola =
    {
        type: "parabola",
        geometry: null,
        size: 0.1,
        count: 500,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 500,
        // attributes
        lifespan: 2000,
        noise: 0,
        // uniforms
        map: new this.textures.Sprite( sprites[ "violet" ] ).texture,
        opacity: 0.5,
        onEmitterComplete: ( emitter ) => { console.log( "onEmitterComplete", emitter ) },
        // id and callback added inside emitter for every particle
        Trajectory: function()
        {
            this.type = "parabola";
            this.a = 4;
            this.b = 1;
            this.limit = new THREE.Vector3( Infinity, Infinity, -100 );
            this.speed = 1;
        }
    };

    options.grid =
    {
        type: "path",
        geometry: new THREE.SphereBufferGeometry(),
        size: 0.1,
        count: 1000,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 100,
        // attributes
        lifespan: 20000,
        // uniforms
        map: new this.textures.Sprite( sprites[ "cyan" ] ).texture,
        opacity: 1,
        noise: 100,
        Path: function()
        {
            this.name = name;
            this.category = "plot";
            this.params = new Path.Plots ( { type: "grid", count: 16 } );
            this.object = new Path.Object( { size: 0.3, visible: true,  color: new THREE.Color( 0x0000ff ), opaque: 0.5 } );
            this.line   = new Path.Line  ( {            visible: false, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } );
            this.animation = { animate: true, loop: true, direction: "forward", onPathAnimationComplete: null };
        }
    };

    options.lattice =
    {
        type: "path",
        geometry: null,
        size: 0.5,
        count: 1000,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 100,
        // attributes
        lifespan: 20000,
        // uniforms
        map: new this.textures.Sprite( sprites[ "cold" ] ).texture,
        opacity: 1,
        noise: 50,
        Path: function()
        {
            this.name = name;
            this.category = "organic";
            this.params = new Path.Plots ( { type: "lattice", count: 2, resolution: 1 } );
            this.object = new Path.Object( { size: 0.01, visible: true,  color: new THREE.Color( 0x0000ff ), opaque: 0.5 } );
            this.line   = new Path.Line  ( {             visible: false, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } );
            this.animation = { animate: true, loop: true, direction: "forward", onPathAnimationComplete: null };
        }
    };

    options.trefoil =
    {
        type: "trefoil",
        geometry: new THREE.SphereBufferGeometry( 0.2 ),
        size: 0.01,
        count: 500,
        axis: new THREE.Vector3( 1, 1, 1 ),
        rate: 30,
        // attributes
        lifespan: 20000,
        noise: 0,
        // uniforms
        map: new this.textures.Sprite( sprites[ "green" ] ).texture,
        opacity: 0.5,
        // id and callback added inside emitter for every particle
        Trajectory: function()
        {
            this.type = "trefoil";
            this.a = 2;
            this.b = 2;
            this.c = 2;
            this.speed = 4;
        }
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        this.props[ name ].clear();

        option.name = key;
        option.parent = this.stage.props;

        this.emitter = new Emitter();
        this.emitter.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };