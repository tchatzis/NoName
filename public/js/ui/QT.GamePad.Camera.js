QT.GamePad.Camera = function()
{
    this.config.initial =
    {
        position: this.stage.camera.position.clone(),
        rotation: this.stage.camera.rotation.clone()
    };

    var update = () =>
    {
        var gamepads = Array.from( this.devices.gamepads );
            gamepads.forEach( gamepad =>
            {
                var rotation = -0.02;
                var position = 0.03;
                var v = gamepad.values;
                var x = 0;
                var y = 0;
                var z = 0;

                if ( v.axis[ 0 ] )
                {
                    y += v.axis[ 0 ].value * rotation;
                    this.stage.camera.rotateY( y );
                }

                if ( v.axis[ 1 ] )
                {
                    z += v.axis[ 1 ].value * position;
                    this.stage.camera.translateZ( z );
                }

                if ( v.axis[ 2 ] )
                {
                    x += v.axis[ 2 ].value * position;
                    this.stage.camera.translateX( x );
                }

                if ( v.axis[ 5 ] )
                {
                    y -= v.axis[ 5 ].value * position;
                    this.stage.camera.translateY( y );
                }

                if ( v.button[ 10 ] )
                {
                    this.stage.camera.rotation.copy( this.config.initial.rotation );
                }

                if ( v.button[ 11 ] )
                {
                    this.stage.camera.position.copy( this.config.initial.position );
                }
            } );
    };

    this.data.arrays.functions.push( { name: "gamepad.camera", scope: this, function: update, args: null } );
};