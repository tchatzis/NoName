const Setters = function()
{
    var scope = "setters";

    app[ scope ] = {};

    app[ scope ].db = ( params, callback ) =>
    {
        app.db.set( params, callback )
    };
};