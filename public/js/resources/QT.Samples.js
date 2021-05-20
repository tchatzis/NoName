QT.Samples = function()
{
    var scope = this;

    scope.loaded = {};

    scope.load = async function( data )
    {
        let path = data.path.split( "/" );
        let name = path[ path.length - 1 ];
        let sample = await app.methods.import( name, `samples/${ data.path }.js` );
        let prop = sample.prop.call( app, name, data );
        let imported = { name: name, prop: prop, options: sample.options, data: data };
        
        // store the script context
        scope.loaded[ name ] = sample;

        // send options to callback to build menu
        if ( imported.options )
        {
            data.loaded = true;
            data.options( imported );
        }
    };
};