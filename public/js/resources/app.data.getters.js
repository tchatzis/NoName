const Getters = function()
{
    var scope = "getters";

    app[ scope ] = {};

    app[ scope ].db = async ( params, callback ) => await app.db.get( params, callback );

    app[ scope ].object = ( params ) => params;
};