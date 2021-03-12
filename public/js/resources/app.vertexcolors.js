const VertexColors = function()
{
    var app = {};
    var scope = this;
    var components = [ "a", "b", "c" ];

    scope.init = function( target, args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );
        
        scope.target = target;
        scope.data = scope.target.userData.vertexFace = [];
        scope.function = args.gradient ? "gradient" : args.function;

        var faces = scope.target.geometry.faces.length;
        var vertices = scope.target.geometry.vertices.length;
        var index;
        if ( args.gradient ) scope.gradient = app.utils.gradient( { colors: args.gradient, debug: false } );

        while ( faces > 0 )
        {
            faces--;

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                index = scope.target.geometry.faces[ faces ][ components[ vertex ] ];

                scope.data[ index ] = faces;
                scope.target.geometry.faces[ faces ].vertexColors.push( new THREE.Color() );
            }
        }

        // used in normals
        scope.vertices = [];

        for ( var v = 0; v < vertices; v++ )
        {
            scope.vertices[ v ] = new THREE.Vector3();
        }
    };

    scope.set = function( name, value )
    {
        scope[ name ] = value;
    };

    scope.face = function( index )
    {
        scope.face0 = scope.target.geometry.faces[ scope.data[ index ] - 1 ];
        scope.face1 = scope.target.geometry.faces[ scope.data[ index ] ];

        vertexColors( scope.face0 );
        vertexColors( scope.face1 );
        vertexNormals( scope.face0 );
        vertexNormals( scope.face1 );
    };

    // color mode functions
    scope.functions = {};

    scope.functions[ "hsl" ] = function( color, value )
    {
        color.setHSL( scope.base.h + value * scope.influence.h, scope.base.s + value * scope.influence.s, scope.base.l + value * scope.influence.l );
    };

    scope.functions[ "gradient" ] = function( color, value )
    {
        var index = Math.floor( value * ( scope.gradient.length - 1 ) );
        color.copy( scope.gradient[ index ] );
    };

    var vertexColors = function( face )
    {
        if ( face )
        {
            face.vertexColors.forEach( ( color, i ) =>
            {
                var value = ( scope.target.geometry.vertices[ face[ components[ i ] ] ][ scope.axis ] + 0.5 * scope.range ) / scope.range;
                    value = app.utils.clamp( value, 0, 1 );
                scope.functions[ scope.function ].call( scope, color, value );
            } );
        }
    }.bind( scope );

    var vertexNormals = function( face )
    {
        if ( face )
        {
            var cb = new THREE.Vector3();
            var ab = new THREE.Vector3();
            var v = {};
                v.a = scope.target.geometry.vertices[ face.a ];
                v.b = scope.target.geometry.vertices[ face.b ];
                v.c = scope.target.geometry.vertices[ face.c ];

            cb.subVectors( v.c, v.b );
            ab.subVectors( v.a, v.b );
            cb.cross( ab );

            scope.vertices[ face.a ].add( cb );
            scope.vertices[ face.a ].normalize();
            face.vertexNormals[ 0 ].copy( scope.vertices[ face.a ] );

            scope.vertices[ face.b ].add( cb );
            scope.vertices[ face.b ].normalize();
            face.vertexNormals[ 1 ].copy( scope.vertices[ face.b ] );

            scope.vertices[ face.c ].add( cb );
            scope.vertices[ face.c ].normalize();
            face.vertexNormals[ 2 ].copy( scope.vertices[ face.c ] );
        }
    }.bind( scope );
};