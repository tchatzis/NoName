const Scenes = function()
{
    var scope = "scenes";
    var app = this;
        app[ scope ] = {};
        app[ scope ].catalog = {};

    app[ scope ].load = async function( name )
    {
        if ( app[ scope ].catalog.hasOwnProperty( name ) )
            return app[ scope ].catalog[ name ];

        app[ scope ].catalog[ name ] = await import( `${ app.url }js/scenes/${ name }.js` );

        return app[ scope ].catalog[ name ];
    }
}