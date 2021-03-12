const Maze = function()
{
    var app = {};
    var scope = this;

    const front  = 0;
    const right  = 1;
    const top    = 2;
    const bottom = 3;
    const left   = 4;
    const back   = 5;

    // block constructor
    function Block( layer, position )
    {
        var black = new THREE.Color( 0, 0, 0 );
        var color = scope[ layer ].attributes.color.value;
        var alternate = scope[ layer ].attributes.alternate.value;

        if ( position )
        {
            let data = find( layer, position );

            Object.assign( this, data );
        }

        this.block = { open: [], openings: 0, shaftway: [], code: '0' };

        this.color = function( value )
        {
            value = value || alternate;

            var equals = function( a, b )
            {
                const axes = [ "r", "g", "b" ];

                for( var i = 0; i < axes.length; i++ )
                {
                    if ( a[ axes[ i ] ] !== b[ axes[ i ] ] )
                        return false;
                }

                return true;
            };

            this.instances.forEach( ( object, index ) =>
            {
                var values = app.utils.attributes.get( this.mesh.geometry, "color", object[ index ] );
                var current = new THREE.Color( ...values );

                if ( equals( current, color ) )
                    app.utils.attributes.set( this.mesh.geometry, "color", object[ index ], value );
            } );
        };

        this.functions =
        {
            floors: function()
            {
                if ( this.block.shaftway.includes( bottom ) )
                {
                    this.instances.forEach( ( object, index ) =>
                    {
                        var color = ( index === 4 ) ? black : alternate;

                        app.utils.attributes.set( this.mesh.geometry, "color", object[ index ], color );
                    } );
                }

                /*if ( this.block.shaftway.includes( top ) )
                {
                    this.instances.forEach( ( object, index ) =>
                    {
                        var color = new THREE.Color( 0.5, 0, 0.5 );

                        app.utils.attributes.set( this.mesh.geometry, "color", object[ index ], color );
                    } );
                }*/
            },

            walls: function()
            {
                var option = this.block.option.split( "" );
                    option = option.map( n => Number( n ) );

                this.instances.forEach( ( object, index ) =>
                {
                    if ( !option[ index ] )
                        app.utils.attributes.set( this.mesh.geometry, "color", object[ index ], black );
                } );
            }
        };

        this.layer = layer;
        this.name = layer;

        this.opacity = function( opacity )
        {
            this.instances.forEach( ( object, index ) =>
            {
                app.utils.attributes.set( this.mesh.geometry, "opaque", object[ index ], opacity );
            } );
        };

        this.solver =
        {
            passes: 0,
            occupied: false,
            scanned: false,
            solved: false
        };
    }

    // create and set the instance
    function blanks()
    {
        var h = scope.dimensions.x * scope.dimensions.y * scope.dimensions.z * scope.blanks.percent / 100;

        while ( h > 0 )
        {
            let vector = random();

            scope.layers.forEach( layer =>
            {
                let block = find( layer, vector );

                if ( !block.solver.occupied && !( block.name === "start" ) && !( block.name === "finish" ) )
                {
                    if ( scope.blanks.color )
                        block.color( scope.blanks.color );

                    if ( scope.blanks.color )
                        block.opacity( scope.blanks.opacity );

                    block.name = "blank";
                    block.solver.occupied = true;
                }
            } );

            h--;
        }
    }

    function callback( object )
    {
        console.log( "onPathAnimationComplete", object );
    }

    function camera( path )
    {
        var option =
        {
            category: "array",
            params: new Path.Plots( { type: "array", resolution: 100, array: extract( path ) } ),
            object: new Path.Object( { type: "box", size: 1, visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
            line:   new Path.Line  ( {                       visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
            animation: { animate: true, loop: false, direction: "forward", onPathAnimationComplete: callback, camera: new Path.Camera( { object: app.stage.camera, resolution: 100, axes: new THREE.Vector3( 0, 1, 0 ) } ) }
        };

        const cube =
        {
            name: scope.name,
            parent: app.stage.props,
            size: 1,
            segments: 1,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0, 0, 1 )
        };

        var prop = new app.presets.Cube( cube );
            prop.enhance( app.path.Instance, option );
    }

    // check for solution and set camera or restart
    function check()
    {
        if ( !scope.solutions.length )
            scope.init.call( app, scope );
        else
        {
            app.ui.debug.innerText = `${ scope.solutions.length } solved`;

            //app.stage.camera.position.copy( scope[ "walls" ].start.positions[ 4 ] );
            //app.stage.camera.lookAt( scope.solutions[ 0 ][ 1 ] );

            shaftways();
        }
    }

    function crawler( layer, time )
    {
        var solution = 0;

        var run = function()
        {
            var index = 1;
            var interval;
            var color = scope.walls.attributes.alternate.value;
            var path = scope.solutions[ solution ];

            camera( path );

            var crawl = function()
            {
                if ( index < path.length - 1 )
                {
                    let current = find( layer, path[ index ].position );
                        current.color( color );
                }
                else
                {
                    clearInterval( interval );
                    solution++;
                    if ( solution < scope.solutions.length )
                        run();
                }

                index++;
            };

            interval = setInterval( crawl, time );
        };

        run();
    }

    // set the instances
    function create( args )
    {
        var mesh = scope.instanced[ args.layer ].mesh;
        var attributes = scope[ args.layer ].attributes;
        var c = args.col * scope.factor;
        var r = args.row * scope.factor;
        var size = scope[ args.layer ].geometry.parameters;
        var spacing = scope[ args.layer ].spacing;
        var offset = new THREE.Vector3( ( scope.dimensions.x * scope.factor - ( size.width + spacing ) ) / 2, ( scope.dimensions.y - ( size.height + spacing ) ) / 2, ( scope.dimensions.z * scope.factor - ( size.depth + spacing ) ) / 2 );
        var i = 0;
        var key = new THREE.Vector3( args.col, args.stack, args.row );
        var value = { layer: args.layer, instances: [], positions: [], position: key };
        var array = args.block.option.split( "" );
            array = array.map( n => Number( n ) );

        Object.assign( value, new Block( args.layer ) );

        for ( let row = 0; row < scope.factor; row++ )
        {
            for ( let col = 0; col < scope.factor; col++ )
            {
                if ( array[ i ] )
                {
                    let x = c + col;
                    let y = args.stack;
                    let z = r + row;
                    let position = new THREE.Vector3( x, y, z );
                    let dummy = new THREE.Object3D();
                        dummy.position.copy( position ).sub( offset );
                        dummy.updateMatrix();
                    let instance = index( position );

                    value.instances.push( { [ i ]: instance } );
                    value.positions.push( dummy.position.clone() );

                    mesh.setMatrixAt( instance, dummy.matrix );
                    value.mesh = mesh;

                    app.utils.attributes.set( mesh.geometry, "start",    instance, dummy.position );
                    app.utils.attributes.set( mesh.geometry, "end",      instance, dummy.position );
                    app.utils.attributes.set( mesh.geometry, "rotation", instance, dummy.rotation );

                    if ( scope[ args.layer ].hasOwnProperty( "attributes" ) )
                    {
                        if ( attributes.hasOwnProperty( "color" ) )
                            app.utils.attributes.set( mesh.geometry, "color",     instance, attributes.color.value );
                        if ( scope[ args.layer ].attributes.hasOwnProperty( "alternate" ) )
                            app.utils.attributes.set( mesh.geometry, "alternate", instance, attributes.alternate.value );
                        if ( scope[ args.layer ].attributes.hasOwnProperty( "opaque" ) )
                            app.utils.attributes.set( mesh.geometry, "opaque",    instance, attributes.opaque.value );
                        if ( scope[ args.layer ].attributes.hasOwnProperty( "level" ) )
                            app.utils.attributes.set( mesh.geometry, "level",     instance, attributes.level.value );
                    }
                }

                i++;
            }

            scope[ args.layer ].map.set( key, value );
            scope[ args.layer ].keys.push( key );
        }
    }

    // find and set start and end blocks
    function endpoints( layer )
    {
        scope[ layer ].start = find( layer, new THREE.Vector3( 0, 0, 0 ) );
        scope[ layer ].start.name = "start";
        scope[ layer ].start.color( new THREE.Color( 0, 1, 0 ) );

        scope[ layer ].finish = find( layer, new THREE.Vector3( scope.dimensions.x - 1, scope.dimensions.y - 1, scope.dimensions.z - 1 ) );
        scope[ layer ].finish.name = "finish";
        scope[ layer ].finish.color( new THREE.Color( 1, 0, 0 ) );
    }

    // extract vertices from path
    function extract( path )
    {
        var vertices = [];

        for ( let p of path )
            vertices.push( p.positions[ 4 ] );

        return vertices;
    }

    // find the block in the weakmap
    function find( layer, vector )
    {
        for ( let v of scope[ layer ].keys )
        {
            if ( v.equals( vector ) )
                return scope[ layer ].map.get( v );
        }
    }

    // solve the maze
    function go()
    {
        blanks();
        solve( 0, scope[ "walls" ].start, [] );
        check();
    }

    // returns the index of item in maze
    function index ( vector )
    {
        return vector.y * scope.dimensions.x * scope.factor * scope.dimensions.z * scope.factor + vector.z * scope.dimensions.x * scope.factor + vector.x;
    }

    // layer initialization
    function layer( layer, callback )
    {
        scope[ layer ].map = new WeakMap();
        scope[ layer ].keys = [];
        scope[ layer ].group = new THREE.Group();
        scope[ layer ].group.name = `${ layer }_group`;
        scope[ layer ].onInstancedCallback = () =>
        {
            scope[ layer ].group.add( scope.instanced[ layer ].mesh );
            plot( layer );
            endpoints( layer );
        };
        scope[ layer ].onInstancedComplete = callback;
        scope[ layer ].count = scope.count;
        scope.instanced[ layer ] = new Instanced( app, scope[ layer ] );
        scope.group.add( scope[ layer ].group );
        scope.layers.push( layer );
    }

    // get the data from the blocks data
    function lookup( code )
    {
        var block = blocks();
        var options = block[ code.length ][ code ];

        return app.utils.item( Object.keys( options ) );
    }

    // sets bounds and direction for solver
    function movement( position )
    {
        const directions =
        {
            front:  { axis: "z", value: 1 },
            right:  { axis: "x", value: -1 },
            top:    { axis: "y", value: 1 },
            bottom: { axis: "y", value: -1 },
            left:   { axis: "x", value: 1 },
            back:   { axis: "z", value: -1 }
        };

        const bounds =
        [
            ( position.z === scope.dimensions.z - 1 )   ? 0 : directions.front.value,
            ( position.x === 0 )                        ? 0 : directions.right.value,
            ( position.y === scope.dimensions.y - 1 )   ? 0 : directions.top.value,
            ( position.y === 0 )                        ? 0 : directions.bottom.value,
            ( position.x === scope.dimensions.x - 1 )   ? 0 : directions.left.value,
            ( position.z === 0 )                        ? 0 : directions.back.value
        ];

        return { position: position, bounds: bounds, directions: directions };
    }

    // plot the entire blob
    function plot( layer )
    {
        for ( let stack = 0; stack < scope.dimensions.y; stack++ )
        {
            for ( let row = 0; row < scope.dimensions.z; row++ )
            {
                for ( let col = 0; col < scope.dimensions.x; col ++ )
                {
                    let args =
                    {
                        name: layer,
                        layer: layer,
                        block: { openings: 0, code: '0', option: '111111111' },
                        position: new THREE.Vector3( col, stack, row ),
                        col: col,
                        row: row,
                        stack: stack
                    };

                    create( args );
                }
            }
        }
    }

    // random vector for blanks
    function random()
    {
        var x = app.utils.random( 0, scope.dimensions.x - 1 );
        var y = app.utils.random( 0, scope.dimensions.y - 1 );
        var z = app.utils.random( 0, scope.dimensions.z - 1 );

        return new THREE.Vector3( x, y, z );
    }

    // open shaftways
    function shaftways()
    {
        var path = scope.solutions[ 0 ];

        for ( let walls of path )
        {
            let floors = find( "floors", walls.position );
                floors.block = walls.block;
                floors.functions[ "floors" ].call( floors );
        }
    }

    // 6-way looker
    function sniffer( iteration, current, path )
    {
        var move = movement( current.position );
        var offset = app.utils.random( 0, 6 );
        var openings = [];
        var shaftway = [];
        var o = offset + 6;

        while ( o > offset )
        {
            let d = o % 6;

            if ( move.bounds[ d ] )
            {
                let key = Object.keys( move.directions )[ d ];
                let axis = move.directions[ key ].axis;
                let vector = new THREE.Vector3().copy( move.position );
                    vector[ axis ] += move.bounds[ d ];
                let next = find( current.layer, vector );
                let previous = path[ path.length - 1 ];

                if ( !next.solver.occupied )
                {
                    if ( [ front, right, back, left ].includes( d ) )
                    {
                        openings.push( d );
                    }

                    if ( [ top, bottom ].includes( d ) )
                    {
                        shaftway.push( d );
                    }

                    if ( !next.solver.scanned )
                    {
                        if ( !previous || !current.position.equals( previous.position ) )
                            path.push( current );
                        solve( iteration++, next, [ ...path ] );
                    }
                }
            }

            o--;
        }

        return { openings: openings, shaftway: shaftway };
    }

    // solver
    function solve( iteration, current, path )
    {
        var solved = false;
        var openings = [];
        var shaftway = [];

        if ( !current.solver.scanned )
        {
            current.solver.scanned = true;

            let sniff = sniffer( iteration, current, path );
            openings = sniff.openings;
            shaftway = sniff.shaftway;

            current.block.openings = openings.length;
            current.block.open = openings;
            current.block.code = openings.sort().join( "" ) || openings.length.toString();
            current.block.shaftway = shaftway;
            current.block.option = lookup( current.block.code );
            current.functions[ current.layer ].call( current );
        }

        current.solver.iteration = iteration;
        current.solver.passes++;

        if ( scope[ current.layer ].finish.position.equals( current.position ) )
        {
            scope.solutions.push( path );
            solved = true;
            current.solver.solved = solved;
        }

        return solved;
    }

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;

        scope.solutions = [];
        scope.lights = [];
        scope.factor = 3;
        scope.instanced = {};
        scope.layers = [];

        scope.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value * scope.factor * scope.factor );

        layer( "floors", () => layer( "walls", go ) );

        scope.parent.add( scope.group );
    };

    scope.solve = function()
    {
        crawler( "floors", 10 );
    };
};