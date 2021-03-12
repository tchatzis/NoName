const Setters = function()
{
    var scope = "setters";

    app[ scope ] = {};

    app[ scope ].db = ( path, data, callback ) =>
    {
        app.db.set( path, data, callback )
    };
};