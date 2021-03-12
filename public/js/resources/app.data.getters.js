const Getters = function()
{
    var scope = "getters";

    app[ scope ] = {};

    app[ scope ].db = ( params, callback ) =>
    {
        app.db.get( params, callback );
    };

    app[ scope ].object = ( params, callback ) =>
    {
        var data = params.data;

        if ( Array.isArray( data ) )
            callback( { data: data } );
        else if ( typeof data == "object" )
        {
            let array = [];

            for ( let key in data )
                if ( data.hasOwnProperty( key ) )
                    array.push( { [ key ]: data[ key ] } );

            callback( { data: array } );
        }
        else
            callback( { data: [ data ] } );
    };
}