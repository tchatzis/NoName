QT.Record = function()
{    
    var scope = this;
    var length = 0;
    var progress;
    var params = {};
    
    app.data.recordings = {};

    scope.init = function( args )
    {
        Object.assign( params, args );

        params.maxlength = Math.min( params.time, 5 ) * app.utils.fps;
        params.record = true;
        params.canvas = app.stage.renderer.domElement;

        progress = new app.utils.Progress( { value: 0, limit: params.maxlength } );
        progress.update( { label: "Recording", value: 0 } );
           
        var screen = { width: window.innerWidth, height: window.innerHeight };
        var props = app.utils.greater( params.canvas );
        var factor = screen[ props.lesser ] / params.canvas[ props.lesser ];

        params.size = params.canvas[ props.lesser ] / factor;
        params.coordinates =
        [
            ( params.canvas.width - params.size ) / 2,
            ( params.canvas.height - params.size ) / 2,
            params.size,
            params.size,
            0,
            0,
            params.width,
            params.height
        ];

        length = 0;

        app.data.recordings[ params.name ] = { name: params.name, frames: [], length: 0 };
        app.data.arrays.functions.push( { name: params.name, scope: scope, function: update, args: null } );
    };

    function update()
    {
        if ( app.methods.ready() && params.record )
        {
            if ( length < params.maxlength )
            {
                params.temp = document.createElement( "canvas" );
                params.temp.width = params.width;
                params.temp.height = params.height;
                params.temp.ctx = params.temp.getContext( '2d' );
                params.temp.ctx.drawImage( params.canvas, ...params.coordinates );

                app.ui.hud.innerHTML = null;
                app.ui.hud.appendChild( params.temp );

                scope.recordings[ params.name ].frames.push( params.temp );
                length = scope.recordings[ params.name ].frames.length;

                progress.update( { label: "recording", value: length } );                
            }

            if ( length === params.maxlength )
            {
                scope.recordings[ params.name ].length = length;
                app.ui.hud.innerHTML = null;
                app.methods.kill( app.data.arrays.functions, params.name );

                if ( params.onRecordComplete )
                {
                    params.onRecordComplete();
                    params.record = false;
                }
                else
                {
                    params.record = false;
                    app.broadcast( "recording_finished" );
                    app.ui.hud.classList.remove( "expand" );
                }
            }
        }
    }
};