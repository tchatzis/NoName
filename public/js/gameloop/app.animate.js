QT.Animate = function()
{
    var scope = this;
    var running = true;
    var loop =
    {
        // updates transformations and uniforms
        animations()
        {
            var update = function( data )
            {
                data.path = typeof data.path === 'string' ? data.path.split( '.' ) : data.path;

                var current = data.object;
                var p = 0;
                var param;

                while ( data.path.length > p )
                {
                    param = data.path[ p ];

                    if ( typeof current[ param ] == "undefined" ) return null;

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

            var animations = app.data.arrays.animations.concat( app.data.arrays.persistent[ "background" ] ).concat( app.data.arrays.persistent[ "ground" ] );
            var alen = animations.length;

            for ( let a = 0; a < alen; a++ )
            {
                let adata = animations[ a ];

                if ( !adata.name )
                {
                    console.error( "animation name is not defined", adata );
                    a = alen;
                    app.methods.kill( animations, adata.name );
                    break;
                }

                if ( adata )
                   update( adata );
            }
        },
        // composers
        composers: () =>
        {
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
                }
            }
        },
        // no composers
        fallback: () =>
        {
            app.stage.renderer.clear();
            render( app.stage.renderer );
        },
        // runs methods of object
        functions: () =>
        {
            var functions = app.data.arrays.functions.concat( app.data.arrays.persistent[ "functions" ] );
            var flen = functions.length;

            for ( let f = 0; f < flen; f++ )
            {
                let fdata = functions[ f ];

                if ( !fdata.name )
                {
                    console.error( "function name is not defined", fdata );
                    f = flen;
                    app.methods.kill( functions, fdata.name );
                    break;
                }

                if ( fdata )
                    fdata.function.call( fdata.scope, fdata.args );
            }
        }
    };

    var render = function( renderer )
    {
        renderer.render( app.stage.scene, app.stage.camera );
    };

    var animate = function()
    {
        if ( !app.config.debug && running )
            requestAnimationFrame( animate );

        loop.animations();
        loop.functions();

        if ( !Object.keys( app.stage.composers ).length )
            loop.fallback();
        else
            loop.composers();
    };
    
    this.autoclear = function()
    {
        requestAnimationFrame( scope.autoclear );

        app.stage.renderer.render( app.stage.scene, app.stage.camera );
        app.stage.renderer.autoClear = true;
    };

    this.start = () =>
    {
        running = true;

        animate();
    };

    this.stop = () =>
    {
        running = false;
    };
};