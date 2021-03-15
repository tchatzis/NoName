const Setters = function()
{
    var scope = "setters";

    app[ scope ] = {};

    app[ scope ].db = ( params, data, callback ) =>
    {
        app.db.set( params, data, callback )
    };
};