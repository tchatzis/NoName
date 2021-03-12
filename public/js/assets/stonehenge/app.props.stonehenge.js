const Stonehenge = function()
{
    var app = {};
    var scope = this;

    const side = function()
    {
        var side = 0;
        var code, rows;

        for ( var l = 0; l < scope.message.length; l++ )
        {
            code = scope.message[ l ].code;
            rows = code.length;

            for ( var row = 0; row < rows; row++ )
            {
                side = Math.max( side, code[ row ].length );
            }
        }

        return side;
    };

    const build = function()
    {
        var code, letter, rows, cols, pane, angle, value, object;
        var x = 0;
        var y = 0;
        var z = 0;

        const length = scope.message.length;
        const apothem = this.utils.apothem( side(), length );
        
        scope.apothem = apothem.apothem;
        scope.radius = apothem.radius;

        for ( var l = 0; l < length; l++ )
        {
            code = scope.message[ l ].code;
            letter = scope.message[ l ].letter;
            rows = code.length;
            pane = new THREE.Group();
            pane.name = letter;
            angle = ( l / length ) * Math.PI * 2;

            for ( var row = 0; row < rows; row++ )
            {
                cols = code[ row ].length;
                y = rows / 2 - row - 0.5;

                for ( var col = 0; col < cols; col++ )
                {
                    value = code[ row ][ col ];

                    if ( value )
                    {
                        x = cols / 2 - col - 0.5;
                        object = scope.object.clone();
                        object.position.set( x, y, z );
                        object.scale.setScalar( 0.9 );
                        pane.add( object );
                    }
                }
            }

            pane.rotation.y = angle;
            pane.translateZ( -scope.apothem );

            scope.group.add( pane );
        }

        scope.group.rotateY( Math.PI );
        scope.parent.add( scope.group );
    };

    const spell = function( message )
    {
        var array = [];

        for ( var c = 0; c < message.length; c++ )
        {
            array.push( { letter: message[ c ], code: CHARACTERS.block[ message[ c ] ] } );
        }

        return array;
    };

    this.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;
        scope.message = spell( scope.message );

        build.call( this );
    };
};
