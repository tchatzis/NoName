const Morph = function()
{
    var scope = this;

    scope.morph = function( args )
    {
        scope.targets = [];

        args.targets.forEach( vertices =>
        {
            scope.targets.push( [ ...vertices ] );
        } );


    };
};