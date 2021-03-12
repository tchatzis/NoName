const Grid = function()
{
    var app = {};
    var scope = this;
    var properties = [ "sides" ];

    // set up grid
    // add row
    const Row = function()
    {
        if ( scope.row === scope.rows )
            scope.rows++;

        scope.table[ scope.row ] = [];
        scope.table[ scope.row ] = new Columns( scope.row ).data;
        scope.row++;
    };

    // called from Row()
    const Columns = function( row )
    {
        var col;

        for ( col = 0; col < scope.cols; col++ )
        {
            scope.table[ row ][ col ] = {};
        }

        for ( col = 0; col < scope.cols; col++ )
        {
            scope.table[ row ][ col ] = new Cell( row, col ).data;
        }

        this.data = scope.table[ row ];
    };

    // called from Column()
    const Cell = function( row, col )
    {
        var cell = {};
            cell.edges = [];
            cell.coordinate = { row: row, col: col };

        properties.forEach( ( prop ) =>
        {
            cell[ prop ] = [];

            for ( var e = 0; e < scope.edges; e++ )
            {
                cell[ prop ].push( Math.round( Math.random() ) );
            }
        } );

        this.data = cell;
    };

    // add grid column
    const Column = function()
    {
        for ( var row = 0; row < scope.rows; row++ )
        {
            scope.table[ row ][ scope.cols ] = new Cell( row, scope.cols ).data;
        }

        scope.cols++;
    };

    // called from match();
    const setEdges = function( start )
    {
        var edges;
        var prev, next = {};
        var last =
        {
            row: scope.rows - 1,
            col: scope.cols - 1
        };

        for ( var row = start.row; row < scope.rows; row++ )
        {
            edges = [];

            for ( var col = start.col; col < scope.cols; col++ )
            {
                prev =
                {
                    row: row === 0 ? last.row : row - 1,
                    col: col === 0 ? last.col : col - 1
                };

                next =
                {
                    row: row === last.row ? 0 : row + 1,
                    col: col === last.col ? 0 : col + 1
                };

                edges =
                [
                    { row: row, col: col, name: "top",   edge: 0, opp: 2, neighbor: scope.table[ prev.row ][ col ] },
                    { row: row, col: col, name: "right", edge: 1, opp: 3, neighbor: scope.table[ row ][ next.col ] },
                    { row: row, col: col, name: "bottom",edge: 2, opp: 0, neighbor: scope.table[ next.row ][ col ] },
                    { row: row, col: col, name: "left",  edge: 3, opp: 1, neighbor: scope.table[ row ][ prev.col ] }
                ];

                scope.table[ row ][ col ].edges = edges;
            }
        }
    };

    // outputs
    // called from match()
    const draw = ( function()
    {
        const cube = function( args )
        {
            args.name = `grid_group_${ args.row }_${ args.col }`;
            args.factor = 3;
            args.size = scope.size;
            args.spacing = scope.spacing || 0;
            args.height = scope.height;

            output[ scope.type ].call( scope, args );
        };

        const html = function( args )
        {
            args.colors = scope.colors;

            new Offscreen( { callback: output[ scope.type ], data: args } );
        };

        const plane = function( args )
        {
            args.colors = scope.colors;

            new Offscreen( { callback: output[ scope.type ], data: args } );
        };

        return {
            cube: cube,
            html: html,
            plane: plane
        };

    } )();

    // called from draw
    const output = ( function()
    {
        const cube = function( args )
        {
            const exists = scope.group.getObjectByName( args.name, false );

            if ( !exists )
            {
                var cube = new Cube( args );
                    cube.init.call( app, scope );
            }
        };

        const html = function( args )
        {
            args.colors = scope.colors;
            args.cols = scope.cols;
            args.rows = scope.rows;
            
            var html = new Html( args );
                html.init();

            scope.group.body.appendChild( html.div );
        };

        const plane = function( args )
        {
            args.name = `grid_group_mesh_${ args.data.row }_${ args.data.col }`;
            args.rows = scope.rows;
            args.cols = scope.cols;
            args.size = scope.size;
            args.envMap = scope.parent.background;

            const exists = scope.group.getObjectByName( args.name, false );

            if ( !exists )
            {
                var plane = new Surface( args );
                    plane.init();

                scope.group.add( plane.group );
            }
        };

        return {
            cube: cube,
            html: html,
            plane: plane
        };
    } )();

    // match the openings
    const match = function( which )
    {
        var cell, edge, opp, neighbor;
        var coordinate = {};
        var start =
        {
            row: which === "row" ? Math.max( scope.rows - 2, 0 ) : 0,
            col: which === "col" ? Math.max( scope.cols - 2, 0 ) : 0
        };

        setEdges( start );

        for ( var row = start.row; row < scope.rows; row++ )
        {
            for ( var col = start.col; col < scope.cols; col++ )
            {
                cell = scope.table[ row ][ col ];

                for ( var e = 0; e < scope.edges; e++ )
                {
                    edge =       cell.edges[ e ].edge;
                    opp =        cell.edges[ e ].opp;
                    neighbor =   cell.edges[ e ].neighbor;
                    coordinate =
                    {
                        row: cell.edges[ e ].neighbor.coordinate.row,
                        col: cell.edges[ e ].neighbor.coordinate.col
                    };

                    properties.forEach( ( prop ) =>
                    {
                        neighbor[ prop ][ opp ] = scope.table[ row ][ col ][ prop ][ edge ];
                    } );
                }

                draw[ scope.type ].call( scope, { row: row, col: col, sides: cell.sides } );
            }
        }
    };

    // build, match and center the grid
    const plot = function()
    {
        scope.instanced.set();
        scope.mesh = scope.instanced.mesh;
        scope.group.add( scope.mesh );

        for ( var row = 0; row < scope.rows; row++ )
        {
            new Row();
        }

        match();

        scope.mesh.instanceMatrix.needsUpdate = true;
    };

    // public methods
    // starts here
    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.table = [];
        scope.rows = scope.dimensions.z / 3;
        scope.cols = scope.dimensions.x / 3;
        scope.row = 0;
        scope.col = 0;
        scope.edges = 4;
        scope.initial = args;
        scope.group = new THREE.Group();
        scope.group.name = "mesh";
        scope.parent.add( scope.group );

        scope.onInstancedComplete = plot;
        scope.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value );
        scope.instanced = new Instanced( app, scope );
    };

    scope.add = ( function()
    {
        return {
            row: function()
            {
                new Row();
                match( "row" );
            },

            col: function()
            {
                new Column();
                match( "col" );
            }
        };
    } )();
};