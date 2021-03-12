const callback = function( object )
{
    console.log( "onTrajectoryComplete", object );
};

var options = {};

    options.accelerate =
    {
        a: 9.8,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.circle =
    {
        a: 4,
        speed: 5,
        onTrajectoryComplete: callback
    };

    options.eight =
    {
        a: 2,
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.ellipse =
    {
        a: 6,
        b: 3,
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.helix =
    {
        a: 2,
        b: 1,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.hyperbola =
    {
        a: 1,
        b: 3,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.infinity =
    {
        a: 4,
        b: 3,
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.knot =
    {
        a: 2,
        b: 3,
        c: 4,
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.inverse =
    {
        a: 4,
        b: 3,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.parabola =
    {
        a: 1,
        b: 3,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.projectile =
    {
        a: Math.PI / 3,
        b: 1,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.smootherstep =
    {
        a: 2,
        b: 0.1,
        c: 0.1,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 0.5,
        onTrajectoryComplete: callback
    };

    options.smoothstep =
    {
        a: 2,
        b: 0.1,
        c: 0.1,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 0.5,
        onTrajectoryComplete: callback
    };

    options.spiral =
    {
        a: 2,
        b: 0.1,
        c: 0.1,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 5,
        onTrajectoryComplete: callback
    };

    options.translate =
    {
        x: 0,
        y: 20,
        z: 50,
        limit: new THREE.Vector3( Infinity, Infinity, -100 ),
        speed: 1,
        onTrajectoryComplete: callback
    };

    options.trefoil =
    {
        a: 2,
        b: 2,
        c: 2,
        speed: 2,
        onTrajectoryComplete: callback
    };

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        this.props[ name ].clear();

        option.name = name;
        option.type = key;
        
        const rounded =
        {
            name: name,
            parent: this.stage.props,
            width: 2,
            height: 1,
            depth: 1,
            radius: 0.2,
            smoothness: 3,
            segments: 1,
            position: new THREE.Vector3( 0, 0, 0 )
        };

        var prop = new this.presets.Rounded( rounded );
            prop.enhance( this.trajectory.Plot, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };