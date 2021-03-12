const animate = function()
{
    var app = this;
        app.kill = function( array, name )
        {
            var index = array.findIndex( item => item.name === name );

            if ( index > -1 )
            {
                array.splice( index, 1 );
                app.kill( array, name );
            }
        };

    var update = function( data )
    {
        data.path = typeof data.path === 'string' ? data.path.split( '.' ) : data.path;

        var current = data.object;
        var p = 0;
        var param;

        while ( data.path.length > p )
        {
            param = data.path[ p ];

            if ( current[ param ] === undefined ) return;

            if ( p === data.path.length - 1 )
            {
                current[ param ] += data.value;
            }
            else
            {
                current = current[ param ];
            }

            p++;
        }

        return data.object;
    };

    var frame = 0;

    var render = function( renderer )
    {
        renderer.render( app.stage.scene, app.stage.camera );
    };

    var animate = function()
    {
        if ( !app.debug ) requestAnimationFrame( animate );

        if ( app.debug )
        {
            console.warn( "animations", app.arrays.animations );
            console.warn( "persistent", app.arrays.persistent );
            console.warn( "functions", app.arrays.functions );
        }

        var animations = app.arrays.animations.concat( app.arrays.persistent[ "background" ] ).concat( app.arrays.persistent[ "ground" ] );
        var functions = app.arrays.functions.concat( app.arrays.persistent[ "functions" ] );
        var alen = animations.length;
        var flen = functions.length;
        var a = 0, f = 0;

        // updates transformations and uniforms
        while ( a < alen )
        {
            let adata = animations[ a ];

            if ( !adata.name )
            {
                console.error( "animation name is not defined", adata );
                a = alen;
                app.kill( animations, adata.name );
                break;
            }

            if ( adata )
            {
                update( adata );
            }

            a++;
        }

        // runs methods of object
        while ( f < flen )
        {
            let fdata = functions[ f ];

            if ( !fdata.name )
            {
                console.error( "function name is not defined", fdata );
                f = flen;
                app.kill( functions, fdata.name );
                break;
            }

            if ( fdata )
            {
                fdata.function.call( fdata.scope, fdata.args );
            }

            f++;
        }

        if ( !Object.keys( app.stage.composers ).length )
        {
            app.stage.renderer.clear();
            render( app.stage.renderer );

            if ( frame === 0 ) console.log( "renderer" );

            frame++;

            return;
        }

        for ( var name in app.stage.composers )
        {
            if ( app.stage.composers.hasOwnProperty( name ) )
            {
                var composer = app.stage.composers[ name ];

                if ( composer.hasOwnProperty( "layer" ) )
                {
                    app.stage.renderer.clear();
                    app.stage.camera.layers.set( composer.layer );

                    render( composer.composer );

                    app.stage.renderer.clearDepth();
                    app.stage.camera.layers.set( 0 );

                    render( app.stage.renderer );
                }
                else
                {
                    app.stage.renderer.clear();
                    render( composer.composer );
                }

                //if ( frame === 0 ) console.log( name, composer );
            }
        }

        frame++;
    };

    animate();
};