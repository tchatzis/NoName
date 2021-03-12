const Emitter = function()
{
    var app = {};
    var scope = this;
    var path = {};

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.initial = args;
        scope.interval = 1000 / args.rate;

        if ( scope.hasOwnProperty( "Path" ) )
        {
            path = new scope.Path();
            new app.path.Set( null, path );
        }

        scope.particles = [];
        scope.pending = [];
        scope.particle();
        scope.now = Date.now();
        scope.running = true;
        scope.progress = new this.utils.Progress( { value: 0, limit: scope.initial.count } );
    };

    scope.particle = async function()
    {
        var args =
        {
            name: scope.name,
            parent: scope.group,
            size: path.object ? path.object.size : scope.size
        };

        var preset = new app.presets.Square( args );

        scope.geometry = scope.geometry || preset.mesh.geometry;

        scope.material = await app.shaders.load( "emitter",
        {
            includes: { vertex: [ "simplex3d" ], fragment: [ "grayscale" ] },
            params:
            {
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending
            },
            uniforms:
            {
                start:      { type: "float", value: scope.now },
                time:       { type: "float", value: 0 },
                map:        { type: 'sampler2D', value: scope.map },
                opacity:    { type: "float", value: scope.opacity }
            }
        } );

        var count = scope.count;
        var birth = [];
        var lifespan = [];

        for ( var c = 0; c < count; c++ )
        {
            birth.push( 0 );
            lifespan.push( ( Math.random() / 2 + 0.5 ) * scope.lifespan );
        }

        scope.geometry.setAttribute( "birth", new THREE.Float32BufferAttribute( birth, 1 ) );
        scope.geometry.setAttribute( "lifespan", new THREE.Float32BufferAttribute( lifespan, 1 ) );

        emit();
    };

    scope.reset = function()
    {
        scope.count = scope.initial.count;
        emit();
    };

    scope.stop = function()
    {
        scope.count = 0;
        scope.group.children = [];
        scope.running = false;

        if ( scope.onEmitterComplete )
        {
            scope.onEmitterComplete( scope );
            scope.onEmitterComplete = null;
        }
    };

    const emit = function()
    {
        if ( scope.running )
        {
            scope.count--;
            scope.progress.update( { label: scope.name, value: scope.initial.count - scope.count } );

            if ( scope.count > 0 )
            {
                var timeout = setTimeout( () =>
                {
                    emit();
                }, scope.interval + ( Math.random() * scope.noise ) );

                new Create( scope.initial.count - scope.count - 1, timeout );
            }
        }
    };

    const Create = function( id, timeout )
    {
        var lifespan = Math.round( app.utils.attributes.get( scope.geometry, "lifespan", id ) );
        var particle = new THREE.Mesh( scope.geometry, scope.material );
            particle.name = `particle_${ id }`;
            particle.userData.id = id;
            particle.userData.timeout = timeout;
            particle.userData.birth = Date.now();
            particle.userData.death = particle.userData.birth + lifespan;
            particle.userData.lifespan = lifespan;
            particle.layers.set( 1 );

        scope.group.add( particle );
        app.utils.attributes.set( scope.geometry, "birth", id, particle.userData.birth );

        if ( scope.hasOwnProperty( "Trajectory" ) )
        {
            var trajectory = new scope.Trajectory();
                trajectory.id = particle.name;
                trajectory.onTrajectoryComplete = remove;

            app.trajectory.Instance.call( this, particle, trajectory );
        }

        if ( scope.hasOwnProperty( "Path" ) )
        {
            path.index = id;
            path.parent = scope.group;

            new app.path.Emitter( particle, path );
        }

        new GarbageCollector( particle );
    };

    const GarbageCollector = function( particle )
    {
        if ( particle && Date.now() > particle.userData.death )
        {
            remove( particle );
        }
        else
        {
            setTimeout( () => new GarbageCollector( particle ), scope.interval );
        }
    };

    const remove = function( particle )
    {
        clearTimeout( particle.userData.timeout );
        scope.group.remove( particle );
        app.kill( app.arrays.functions, particle.name );

        if ( !scope.count )
            setTimeout( scope.stop, scope.lifespan );
    };
};