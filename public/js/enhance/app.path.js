const Path = function()
{
    var scope = "path";
    var app = this;
        app[ scope ] = {};
        app[ scope ].running = false;

    const Create = function( target, args )
    {
        var points =
        {
            vertices: [],
            lengths: [],
            curves: []
        };

        // agnostic array of vertices
        this.array = function()
        {
            this.vertices = points.vertices = app.plot.init( args.params );

            execute.call( this );
        };

        // get points from app.path.organic
        this.organic = function()
        {
            app.organic.paths = app.organic.init( args.params );
            app.organic.paths.forEach( ( vertices, index ) =>
            {
                this.vertices = points.vertices = vertices;

                if ( app.organic.paths.length === args.params.structures && args.params.structures === ( index + 1 ) )
                    execute.call( this );
            } );
         };

        // get points from app.path.plot
        this.plot = function()
        {
            this.vertices = points.vertices = app.plot.init( args.params );

            execute.call( this );
        };

        // get points from app.trajectory
        this.trajectory = function()
        {
            this.vertices = points.vertices = app.trajectory.path( args.params );

            execute.call( this );
        };

        this.save = function()
        {
            app[ scope ].points = points;
        };
            
        // internal functions
        function execute()
        {
            length.call( this );
            lines.call( this );
            animate.call( this );
        }

        function animate()
        {
            if ( target && args.animation.animate )
                this.animate.call( this, args );
            else
                this.next = () => {};
        }

        function length()
        {
            points.lengths = [];

            var length = 0;
            var from, to;
            var l;
            var count = points.vertices.length;

            for ( var v = 0; v < count; v++ )
            {
                from = v;
                to = v + 1;

                if ( to === count ) to = 0;

                l = points.vertices[ from ].distanceTo( points.vertices[ to ] );

                points.lengths.push( l );
                length += l;
            }

            points.length = length;
        }

        function lines()
        {
            if ( args.line && args.line.visible )
            {
                var material = new THREE.LineBasicMaterial( { color: args.line.color } );
                var geometry = new THREE.BufferGeometry();
                    geometry.setFromPoints( points.vertices );

                this.mesh = new THREE.Line( geometry, material );
                this.mesh.name = "line";

                args.parent.add( this.mesh );
            }
        }

        // animator
        this.animate = function()
        {   
            var count = 0;
            var distance = 0;
            var data = points.vertices.length ? points : app[ scope ].points;
            var v = data.vertices.length;
            var reverse = [ ...data.lengths ].reverse();
                reverse.push( reverse.shift() );
            var direction = args.animation.direction;
            var array   = direction === "forward" ? [ ...data.vertices ] : [ ...data.vertices ].reverse();
            var lengths = direction === "forward" ? [ ...data.lengths ]  : reverse;
            var speed = args.animation.speed || 50;
                speed = Math.min( speed, 50 );
                speed = Math.max( speed, 1 );
            var resolution = args.animation.camera ? args.animation.camera.resolution : 1;
            var threshold = 0.75;

            this.move = function( index, length, current, next, following )
            {
                if ( current.equals( next ) )
                {
                    this.stop();

                    return;
                }

                distance += length < 1 ? length : 1 / ( length * resolution );

                var size = args.object.size;
                var position = new THREE.Vector3();
                    position.lerpVectors( current, next, distance );
                var lookat = new THREE.Vector3();

                if ( distance < threshold )
                    lookat.lerpVectors( current, next, distance + length );
                else
                    lookat.lerpVectors( next, following, distance - threshold );

                target.position.copy( position );
                target.scale.set( size, size, size );
                target.lookAt( lookat );

                app.ui.debug.innerText = app[ scope ].running;

                if ( args.animation.camera )
                {
                    args.animation.camera.object.position.copy( target.position );
                    args.animation.camera.object.rotation.set( target.rotation.x * args.animation.camera.axes.x, target.rotation.y * args.animation.camera.axes.y, target.rotation.z * args.animation.camera.axes.z );
                    args.animation.camera.object.translateY( args.animation.camera.offset );
                    if ( direction === "forward" )
                        args.animation.camera.object.rotateY( Math.PI );
                }

                if ( distance < 1 )
                {
                    if ( app[ scope ].running )
                        this.timeout = setTimeout( () => this.move( index, length, current, next, following ), 1000 / speed );
                    else
                        this.stop();
                }
                else
                {
                    distance = 0;
                    index++;
                    this.next( index );
                }
            };

            this.next = function( index )
            {
                index = index % v;

                var _index = ( index + 1 ) % v;
                var __index = ( index + 2 ) % v;
                var current = array[ index ];
                var length = lengths[ index ];
                var next = array[ _index ];
                var following = array[ __index ];

                if ( count < v - 1 )
                {
                    count++;

                    if ( target.parent )
                        this.move( index, length, current, next, following );
                }
                else
                {
                    if ( args.animation.onPathAnimationComplete )
                        args.animation.onPathAnimationComplete( target );

                    if ( args.animation.loop )
                        this.loop();
                }
            };

            this.loop = function()
            {
                count = 0;
                distance = 0;

                this.next( 0 );
            };

            this.stop = function()
            {
                count = 0;
                distance = 0;
                clearTimeout( this.timeout );
            };
        };
    };

    app[ scope ].Define = function( target )
    {
        const preset = this;
        const unsorted = [];

        this.define = { target: target };
        this.define.blob = null;
        this.define.instructions = [];

        this.define.Instruction = function( args )
        {
            Object.assign( args.target, { name: target.uuid } );

            if ( preset.define.blob && args.blob )
                Object.assign( args.blob, { name: preset.define.blob.group.uuid } );

            unsorted.push( args );
            unsorted.sort( ( a, b ) => a.sequence - b.sequence );

            preset.define.instructions = [ ...unsorted ];
        };

        this.define.run = function( index )
        {
            var i = index || 0;
            var length = preset.define.instructions.length;
            var delay = preset.define.instructions[ i ].delay || 0;
            var cont = !!preset.define.instructions[ i ].continuous;

            const run = function()
            {
                var instruction = preset.define.instructions[ i ];
                var keys = 0;
                var completed = 0;

                app.ui.debug.innerHTML = `sequence ${ i }`;

                // wait for all of the callbacks to complete
                async function complete()
                {
                    completed++;

                    if ( keys === completed )
                    {
                        app.controls.active.beam = false;
                        i++;

                        if ( i < length )
                            setTimeout( run, delay * 1000 );
                    }
                }

                // copies last value to from
                function continuous( key )
                {
                    if ( cont )
                        instruction[ key ].from = app.utils.path( target, instruction[ key ].attribute );

                    //console.log( instruction[ key ].attribute, instruction[ key ].from, instruction[ key ].to );

                    return instruction[ key ].from;
                }

                for ( let key in instruction )
                {
                    if ( instruction.hasOwnProperty( key ) )
                    {
                        switch ( key )
                        {
                            case "beam":
                                if ( preset.define.blob && preset.define.blob.raycaster )
                                {
                                    app.controls.active.beam = instruction[ key ].active;
                                    preset.define.blob.raycaster.far = instruction[ key ].far;
                                }
                            break;

                            case "blob":
                                keys++;
                                instruction[ key ].onPathInstructionComplete = complete;
                                continuous( key );
                                app[ scope ].Lerp( preset.define.blob.group, instruction[ key ] );
                            break;

                            case "target":
                                keys++;
                                instruction[ key ].onPathInstructionComplete = complete;
                                continuous( key );
                                app[ scope ].Lerp( target, instruction[ key ] );
                            break;
                        }
                    }
                }
            };

            setTimeout( run, delay * 1000 );
        };
    };

    // hook for app.props.emitter
    // this.Set() the vertices once in app.props.emitter.init()
    // directly access animation function
    app[ scope ].Emitter = function( target, args )
    {
        app[ scope ].running = true;

        Create.call( this, target, args );
        this.animate.call( this );
        this.next( args.index );
    };

    app[ scope ].Lerp = function( target, args )
    {
        var d = args.to - args.from;
        var s, f;
        var interval;
        var time = 1 / app.utils.fps;

        const lerp = function()
        {
            if ( app.ready )
            {
                if ( !s )
                {
                    s = Date.now();
                    f = args.time * 1000;
                }

                var n = Date.now();
                var e = ( n - s ) / f;
                var value = e < 1 ? e * d + args.from : args.to;

                app.utils.path( target, args.attribute, value );
                target.visible = true;

                if ( e > 1 )
                {
                    clearInterval( interval );
                    if ( args.onLerpComplete ) args.onLerpComplete( target );
                    if ( args.onPathInstructionComplete ) args.onPathInstructionComplete( target );
                }
            }
        };

        interval = setInterval( lerp, time );
    };

    app[ scope ].Instance = function( target, args )
    {
        app[ scope ].running = true;

        this.path = new Create( target, args );
        this.path[ args.category ]();
        this.path.next( 0 );
    };
    
    app[ scope ].Set = function( target, args )
    {
        app[ scope ].running = false;

        this.path = new Create( target, args );
        this.path[ args.category ]( args.array );
        this.path.save();
    };
};