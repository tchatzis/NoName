const Patterns = function()
{
    var scope = "patterns";
    var app = this;
        app[ scope ] = {};

    app[ scope ].boolean = function( target, args )
    {
        var geometry = target.geometry;
        var colors = [ target.material.color, args.color ];
        var index = 0;
        var width = geometry.parameters.widthSegments;
        var height = geometry.parameters.heightSegments;
        var face = geometry.faces.length;
        var w, h;

        while ( face > 0 )
        {
            face--;

            w = Math.floor( face / 2 ) % width;
            h = Math.floor( face / 2 / height );

            index = ( ( w % 2 ) && ( h % 2 ) && ( h % 2 ) === args.mod ) ? 0 : 1;

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                geometry.faces[ face ].vertexColors.push( colors[ index ] );
            }
        }

        target.material.vertexColors = THREE.VertexColors;
    };

    app[ scope ].calico = function( target, args )
    {
        var geometry = target.geometry;
        var hex;
        var face = geometry.faces.length;

        while ( face > 0 )
        {
            face--;

            if ( face % args.mod === args.rem )
                hex = new THREE.Color().setHSL( Math.random(), args.s, args.l );

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                geometry.faces[ face ].vertexColors.push( hex );
            }
        }

        target.material.vertexColors = THREE.VertexColors;
    };

    app[ scope ].checkers = function( target, args )
    {
        var geometry = target.geometry;
        var colors = [ target.material.color, args.color ];
        var index = 0;
        var width = geometry.parameters.widthSegments;
        var height = geometry.parameters.heightSegments;
        var face = geometry.faces.length;
        var w, h;

        while ( face > 0 )
        {
            face--;

            w = Math.floor( face / 2 ) % width;
            h = Math.floor( face / 2 / height );

            index = ( ( w % 2 ) === ( h % 2 ) ) ? 0 : 1;

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                geometry.faces[ face ].vertexColors.push( colors[ index ] );
            }
        }

        target.material.vertexColors = THREE.VertexColors;
    };
    
    app[ scope ].pattern = function( target, args )
    {
        var geometry = target.geometry;
        var colors = [ target.material.color, args.color ];
        var index = 0;
        var width = geometry.parameters.widthSegments;
        var height = geometry.parameters.heightSegments;
        var face = geometry.faces.length;
        var w, h;

        while ( face > 0 )
        {
            face--;

            w = Math.floor( face / 2 ) % width;
            h = Math.floor( face / 2 / height );

            if ( face % args.mod === args.rem )
                index = !( w % 2 ) ? 0 : 1;

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                geometry.faces[ face ].vertexColors.push( colors[ index ] );
            }
        }

        target.material.vertexColors = THREE.VertexColors;
    };
    
    app[ scope ].stripes = function( target, args )
    {
        var geometry = target.geometry;
        var colors = [ target.material.color, args.color ];
        var index = 0;
        var width = geometry.parameters.widthSegments;
        var height = geometry.parameters.heightSegments;
        var face = geometry.faces.length;
        var o = {};

        while ( face > 0 )
        {
            face--;

            o.v = Math.floor( face / 2 ) % width;
            o.h = Math.floor( face / 2 / height );

            index = !( o[ args.orientation ] % 2 ) ? 0 : 1;

            for ( var vertex = 0; vertex < 3; vertex++ )
            {
                geometry.faces[ face ].vertexColors.push( colors[ index ] );
            }
        }

        target.material.vertexColors = THREE.VertexColors;
    };
    
}