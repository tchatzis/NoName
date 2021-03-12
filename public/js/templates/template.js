const Template = function()
{
    var app = {};
    var scope = this;


    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );
    };
};
