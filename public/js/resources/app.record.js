const Record = function()
{    
    var scope = "record";
    var app = this;
        app[ scope ] = {};
    var length = 0;
    var progress;
    var params = {};
    
    app[ scope ].recordings = {};

    app[ scope ].init = function( args )
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

        app[ scope ].recordings[ params.name ] = { name: params.name, frames: [], length: 0 };
        app.arrays.functions.push( { name: params.name, scope: scope, function: update, args: null } );
    };

    function update()
    {
        if ( app.isReady() && params.record )
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

                app[ scope ].recordings[ params.name ].frames.push( params.temp );
                length = app[ scope ].recordings[ params.name ].frames.length;

                progress.update( { label: "recording", value: length } );                
            }

            if ( length === params.maxlength )
            {
                app[ scope ].recordings[ params.name ].length = length;
                app.ui.hud.innerHTML = null;
                app.kill( app.arrays.functions, params.name );

                if ( params.onRecordComplete )
                {
                    params.onRecordComplete();
                    params.record = false;
                }
                else
                {
                    var event = new Event( "recording_finished" );
                    document.dispatchEvent( event );
                    params.record = false;
                    app.ui.hud.classList.remove( "expand" );
                }
            }
        }
    }
};