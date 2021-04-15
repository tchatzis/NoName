const Getters = function()
{
    var scope = "getters";

    app[ scope ] = {};

    app[ scope ].db = async ( params, callback ) =>
    {
        return await app.db.get( params, callback );
    };

    app[ scope ].object = ( params, callback ) =>
    {
        var data = params.data;
        var result;

        if ( Array.isArray( data ) )
            result = { data: data }
        else if ( typeof data == "object" )
        {
            let array = [];

            for ( let key in data )
                if ( data.hasOwnProperty( key ) )
                    array.push( { [ key ]: data[ key ] } );

            result = { data: array };
        }
        else
            result = { data: [ data ] };

        callback( result );

        return result;
    };
}