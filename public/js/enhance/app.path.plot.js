Path.Plot = function()
{
    var scope = "plot";
    var app = this;
        app[ scope ] = {};
    var vertices = [];
    var curves = [];
    var params = {};
    var axes = [ "x", "y", "z" ];

    // curve helpers
    const set =
    {
        reset: function()
        {
            curves = [];
            vertices = [];
        },
        count: function()
        {
            while ( params.count % 3 )
            {
                params.count++;
            }
        },
        controls: function()
        {
            var point;
            var controls = [];

            for ( var v = 0; v < params.count; v++ )
            {
                point = new THREE.Vector3();

                axes.forEach( axis =>
                {
                    point[ axis ] = app.utils.random( params.bounds.min[ axis ], params.bounds.max[ axis ] );
                } );

                controls.push( point );
            }

            controls.push( controls[ 0 ] );

            return controls;
        },
        array: function( controls )
        {
            curves = [ ...controls ];
        },
        vertices: function( controls )
        {
            var vertices;

            for ( var c = 0; c < controls.length - 1; c += 3 )
            {
                vertices = [];
                vertices[ 0 ] = controls[ c     ];
                vertices[ 1 ] = controls[ c + 1 ];
                vertices[ 2 ] = controls[ c + 2 ];
                vertices[ 3 ] = controls[ c + 3 ];
                curves.push( vertices );
            }

            return vertices;
        }
    };

    app[ scope ].init = function( args )
    {
        Object.assign( params, args );

        app[ scope ][ params.type ]();

        return vertices;
    };

    app[ scope ].array = function()
    {
        params.array.forEach( ( vector, index ) =>
        {
            vertices.push( vector );

            if ( index )
            {
                for ( let i = 1; i < params.resolution; i++ )
                {
                    let distance = i / params.resolution;
                    let previous = params.array[ index - 1 ];
                    let current = params.array[ index ];
                    let vector = new THREE.Vector3();
                        vector.lerpVectors( previous, current, distance );

                    vertices.push( vector );
                }
            }
        } );
        
        vertices.push( params.array[ 0 ] );
    };

    app[ scope ].bezier = function()
    {
        set.reset();
        set.count();
        set.vertices( set.controls() );

        for ( var i = 0; i < curves.length; i++ )
        {
            let curve = new THREE.CubicBezierCurve3( ...curves[ i ] );
            let points = [ ...curve.getPoints( params.resolution ) ];
                points.pop();

            vertices = vertices.concat( points );
        }

        vertices.push( vertices[ 0 ] );
    };

    app[ scope ].catmull = function()
    {
        set.reset();
        set.count();
        set.array( set.controls() );

        var curve = new THREE.CatmullRomCurve3( curves );

        vertices.push( ...curve.getPoints( params.resolution ) );
    };

    app[ scope ].grid = function()
    {
        set.reset();

        var _axis;
        var point;
        var last_axis;

        // check if bounds is zero
        const check = function ( axis )
        {
            if ( ( params.bounds.min[ axis ] || params.bounds.max[ axis ] ) === 0 )
            {
                return 0;
            }
            else
            {
                return app.utils.random( params.bounds.min[ axis ], params.bounds.max[ axis ] );
            }
        };

        // pick a new axis
        const axis = function()
        {
            var axes = [ "x", "y", "z" ];
            var index = axes.indexOf( last_axis );

            if ( index > -1 )
                axes.splice( index, 1 );

            var _axis = app.utils.item( axes );
            last_axis = _axis;

            return _axis;
        };

        // set first point
        vertices.push( new THREE.Vector3() );

        // leave one axis unchanged
        for ( var v = 1; v < params.count; v++ )
        {
            _axis = axis();
            point = new THREE.Vector3();

            // new value : unchanged values from last point
            [ "x", "y", "z" ].forEach( axis =>
            {
                point[ axis ] = _axis === axis ? check( axis ) : vertices[ v - 1 ][ axis ];
            } );

            vertices.push( point );
        }

        // bring values back to start position
        const reconcile = function()
        {
            var axes = [ "x", "y", "z" ];
            var index = axes.indexOf( last_axis );

            if ( index > -1 )
            {
                let axis = axes.splice( index, 1 );
                axes.push( axis );
            }

            axes.forEach( axis =>
            {
                var v = vertices.length;
                point = new THREE.Vector3().copy( vertices[ v - 1 ] );
                point[ axis ] = vertices[ 0 ][ axis ];
                vertices.push( point );
            } );
        }.bind( this );

        reconcile();
    };

    app[ scope ].random = function()
    {
        set.reset();

        var axes = [ "x", "y", "z" ];
        var point;

        for ( var v = 0; v < params.count; v++ )
        {
            point = new THREE.Vector3();

            axes.forEach( axis =>
            {
                point[ axis ] = app.utils.random( params.bounds.min[ axis ], params.bounds.max[ axis ] );
            } );

            vertices.push( point );
        }

        vertices.push( vertices[ 0 ] );
    };
};