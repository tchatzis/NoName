const samples = function()
{
    var scope = "samples";
    var app = this;
        app[ scope ] = {};
        app[ scope ].loaded = {};

    app[ scope ].load = async function( data )
    {
        let path = data.path.split( "/" );
        let name = path[ path.length - 1 ];
        let sample = await import( `${ app.url }js/samples/${ data.path }.js` );
        let prop = sample.prop.call( app, name, data );
        let imported = { name: name, prop: prop, options: sample.options, data: data };
        
        // store the script context
        app[ scope ].loaded[ name ] = sample;

        // send options to callback to build menu
        if ( imported.options )
        {
            data.loaded = true;
            data.options( imported );
        }
    };
};