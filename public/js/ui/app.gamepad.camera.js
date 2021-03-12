const Dolly = function()
{
    var app = this;
        app.initial =
        {
            position: app.stage.camera.position.clone(),
            rotation: app.stage.camera.rotation.clone()
        };

        app.arrays.functions.push( { name: "dolly", scope: this, function: update, args: null } );

    function update()
    {
        var rotation = -0.02;
        var position = 0.03;
        var v = app.gamepad.values;
        var x = 0;
        var y = 0;
        var z = 0;

        if ( v.axis[ 0 ] )
        {
            y += v.axis[ 0 ].value * rotation;
            app.stage.camera.rotateY( y );
        }

        if ( v.axis[ 1 ] )
        {
            z += v.axis[ 1 ].value * position;
            app.stage.camera.translateZ( z );
        }

        if ( v.axis[ 2 ] )
        {
            x += v.axis[ 2 ].value * position;
            app.stage.camera.translateX( x );
        }

        if ( v.axis[ 5 ] )
        {
            y -= v.axis[ 5 ].value * position;
            app.stage.camera.translateY( y );
        }

        if ( v.button[ 10 ] )
        {
            app.stage.camera.rotation.copy( app.initial.rotation );
        }

        if ( v.button[ 11 ] )
        {
            app.stage.camera.position.copy( app.initial.position );
        }
    }
};