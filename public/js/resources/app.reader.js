const Reader = function( app )
{
    var scope = this;

    // transpose array dimensions
    var transpose = function( m )
    {
        var array = scope.characters[ scope.message[ m ] ];

        return array[ 0 ].map( ( col, i ) => array.map( row => row[ i ] ).reverse() );
    };

    // solve each letter as 2d array and push to new array
    var charactersAs3dArray = function( callback )
    {
        var output = [];

        for ( var m = 0; m < scope.message.length; m++ )
        {
            if ( scope.characters.hasOwnProperty( scope.message[ m ] ) )
            {
                output.push( callback.call( null, m ) );
            }
        }

        return output;
    };

    // transpose and add spacer "column"
    var serialize = function()
    {
        var serialized = charactersAs3dArray( transpose );
        var spacer = new Array( 16 );

        for ( var s = 0; s < serialized.length; s++ )
        {
            // add spacing
            for ( var n = 0; n < scope.space; n++ )
            {
                serialized[ s ].push( spacer );
            }
        }

        return serialized;
    };

    scope.read = function()
    {
        scope.message = scope.message.trim();
        scope.message = scope.message.split( " " );
        scope.message = scope.reverse ? scope.message.reverse() : scope.message;
        scope.message = scope.message.join( " " );
        scope.message = scope.message + " ";

        scope.color = scope.inverse ?
        {
            0: scope.attributes.alternate.value.clone(),
            1: scope.attributes.color.value.clone()
        }
        :
        {
            0: scope.attributes.color.value.clone(),
            1: scope.attributes.alternate.value.clone()
        };

        scope.data = [].concat( ...serialize() );

        if ( !scope.static )
            app.arrays.functions.push( { name: scope.name, scope: scope, function: scope.update, args: null } );
        else
            scope.update();
    };

    scope.display = function()
    {
        for ( let col = 0; col < scope.data.length; col++ )
        {
            let rows = scope.data[ col ].length;

            for ( let row = 0; row < rows; row++ )
            {
                let index = col * rows + row;
                let color = scope.data[ col ][ row ] || 0;

                app.utils.attributes.set( scope.geometry, "alternate", index, scope.color[ color ] );
            }
        }
    };

    scope.update = function()
    {
        scope.display();

        if ( scope.reverse )
            scope.data.unshift( scope.data.pop() );
        else
            scope.data.push( scope.data.shift() );
    };
};