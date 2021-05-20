QT.Setters = function()
{
    this.db = ( params, callback ) =>
    {
        app.db.set( params, callback )
    };

    this.js = ( params ) => params;
};