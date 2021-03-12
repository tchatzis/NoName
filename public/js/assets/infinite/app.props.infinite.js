const Infinite = function()
{
    var mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.98, 0.98, 0.98 ), new THREE.MeshStandardMaterial() );
    var scope = this;

    const axes = [ "x", "y", "z" ];

    const Cell = function()
    {
        this.index = {};
        this.position = {};
    };

    const map =
    {
        x: () => { return {} },
        y: () => { return scope.z },
        z: () => { return scope.x }
    };

    scope.prepend = function( args )
    {
        args.dir = "neg";
        args.value = map[ args.axis ].call();

        scope[ args.axis ].unshift( args.value );
        scope.counter[ args.axis ][ args.dir ]--;
        scope.populate( args );
    };

    scope.append = function( args )
    {
        args.dir = "pos";
        args.value = map[ args.axis ];

        scope[ args.axis ].push( args.value );
        scope.counter[ args.axis ][ args.dir ]++;
        scope.populate( args );
    };

    scope.remove = function( args )
    {
        //scope.populate( args );
    };

    scope.reset = function()
    {
        scope.x = [ {} ];
        scope.z = [ scope.x ];
        scope.y = [ scope.z ];
        scope.i = [];

        scope.counter =
        {
            x: { pos: 0, neg: 0, cur: 0 },
            y: { pos: 0, neg: 0, cur: 0 },
            z: { pos: 0, neg: 0, cur: 0 }
        };

        scope.group.children = [];

        scope.populate( { axis: "y", dir: "cur" } );
    };

    scope.init = function( args )
    {
        Object.assign( scope, args );
        scope.app = this;
        scope.group = new THREE.Group();
        scope.app.stage.scene.add( scope.group );
        scope.reset();

        //scope.arrays.functions.push( { scope: scope, function: scope.update, args: {} } );
    };

    scope.find = function( index )
    {
        var exists = function( item )
        {
            return ( item.x === index.x && item.y === index.y && item.z === index.z );
        };

        return scope.i.find( exists );
    };

    scope.populate = function( args )
    {
        scope.counter[ args.axis ].cur = scope.counter[ args.axis ][ args.dir ];

        const Update = function( args )
        {
            this.x = function( params )
            {
                scope.x.forEach( ( cell, x ) =>
                {
                    params.x = x;
                    cell = new Cell();

                    axes.forEach( axis =>
                    {
                        cell.index[ axis ] = params[ axis ];
                        cell.position[ axis ] = params[ axis ];
                    } );

                    cell.data =
                    {
                        axis: args.axis,
                        dir: args.dir,
                        value: scope.counter[ args.axis ][ args.dir ]
                    };

                    //console.log( args.axis, scope.counter[ args.axis ][ args.dir ], cell.position, cell.index );

                    if ( !scope.find( cell.index ) )
                    {
                        var clone = mesh.clone();
                        clone.position.copy( cell.position );
                        clone.userData = cell.data;

                        scope.i.push( cell.index );
                        scope.x[ x ] = cell;
                        scope.group.add( clone );
                    }
                } );

                return scope.x;
            };

            this.z = function( params )
            {
                scope.z.forEach( ( col, z ) =>
                {
                    scope.z[ z ] = this.x( { y: params.y, z: z } );
                } );

                return scope.z;
            };

            this.y = function( params )
            {
                scope.y.forEach( ( row, y ) =>
                {
                    scope.y[ y ] = this.z( { y: y } );
                } );

                return scope.y;
            }
        };

        var update = new Update( args );
        update.y();
    };

    scope.outline = function()
    {
        scope.app.utils.outline( { object: scope.group, color: "yellow", name: "helper" } );
    };

    scope.center = function()
    {
        scope.app.utils.center( scope.group );
        scope.outline();
    };

    scope.update = function()
    {

    };
};
/*
var infinite =
{
    max: 5

};

var hat = function()
{
    var v = this.gamepad.values;

    if ( v.hat.x.value === -1 )
    {
        this.props.dimensions.prepend( { axis: "x" } );
    }

    if ( v.hat.x.value === 1 )
    {
        this.props.dimensions.append( { axis: "x" } );
    }

    if ( v.hat.y.value === -1 )
    {
        this.props.dimensions.prepend( { axis: "y" } );
    }

    if ( v.hat.y.value === 1 )
    {
        this.props.dimensions.append( { axis: "y" } );
    }

    if ( v.button[ 3 ] )
    {
        this.props.dimensions.reset();
    }

    if ( v.button[ 6 ] )
    {
        this.props.dimensions.prepend( { axis: "z" } );
    }

    if ( v.button[ 4 ] )
    {
        this.props.dimensions.append( { axis: "z" } );
    }

}.bind( this );
this.arrays.gamepad.push( { function: hat, args: null } );

this.props.infinite = new Infinite();
this.props.infinite.init.call( this, infinite );
*/