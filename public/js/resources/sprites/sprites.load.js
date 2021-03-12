var Sprites = function()
{
    var scope = this;
        scope.image = {};
        scope.start = Date.now();
        scope.debug = false;

    this.load = function( array, callback )
    {
        var d = 0;

        var loader = function( data )
        {
            if ( scope.debug ) console.log( Date.now() - scope.start + "ms", "loading", data.src );

            var image = new Image();
                image.src = data.src;
                image.addEventListener( "load", function()
                {
                    scope.image[ data.name ] =
                    {
                        data: image,
                        src: data.src
                    };

                    if ( d < array.length )
                    {
                        loader( array[ d ] );
                    }
                    else
                    {
                        if ( scope.debug ) console.log( Date.now() - scope.start + "ms", `loaded ${ d } images: ${ JSON.stringify( scope.image ) }` );
                        callback.call();
                    }
                }, false );

            d++;
        };

        loader( array[ d ] );
    };
};