QT.Getters = function()
{
    this.db = async ( params, callback ) => await app.db.get( params, callback );

    this.js = ( params ) => params;
};