// this file only output to the game loop
// no functions are mapped to the buttons or axes
// see ui/scope.config.gamepad.camera.js for camera control
QT.GamePad = function()
{
    var scope = this;
    var name;

    const check = function()
    {
        var gamepads = Array.from( navigator.getGamepads() );
        return gamepads.some( gamepad =>
            {
                if ( gamepad )
                {
                    name = gamepad.id;

                    if ( gamepad.connected )
                    {
                        scope.devices.gamepads.add( gamepad );
                        return true;
                    }
                    else
                    {
                        scope.devices.gamepads.delete( gamepad );
                        error( name, "not connected" );
                        return false;
                    }
                }
                else if ( !gamepad && name )
                {
                    scope.methods.kill( scope.data.arrays.functions, name );
                    error( name, "connection error" );
                    return false;
                }
            } );
    };

    const update = function()
    {
        var connected = check();

        if ( connected )
        {
            let gamepads = Array.from( scope.devices.gamepads );
                gamepads.forEach( gamepad =>
                {
                    gamepad.values =
                    {
                        hat:    { x: {}, y: {} },
                        axis:   {},
                        button: {}
                    };

                    gamepad.buttons.forEach( ( button, index ) =>
                    {
                        if ( button.pressed || button.touched )
                            gamepad.values.button[ index ] = { index: index, value: button.value, touched: button.touched, pressed: button.pressed };
                    } );

                    gamepad.axes.forEach( ( value, index ) =>
                    {
                        var v = gamepad.values;

                        value = Math.round( value * 100  ) / 100;

                        if ( value && [ 0, 1, 2, 5 ].includes( index ) )
                            v.axis[ index ] = { index: index, value: value };

                        if ( index === 9 )
                        {
                            if ( value < -0.5 )
                            {
                                v.hat.y = { index: "y", value: -1 };
                            }
                            else if ( value > -0.5 && value < 0 )
                            {
                                v.hat.x = { index: "x", value: 1 };
                            }
                            else if ( value > 0 && value < 0.5 )
                            {
                                v.hat.y = { index: "y", value: 1 };
                            }
                            else if ( value > 0.5 && value < 1 )
                            {
                                v.hat.x = { index: "x", value: -1 };
                            }
                            else if ( value > 1 )
                            {
                                v.hat.x = { index: "x", value: 0 };
                                v.hat.y = { index: "y", value: 0 };
                            }
                        }
                    } );
                } );
        }
    };

    const connection = function( event )
    {
        if ( scope.config.debug )
            console.info( "Gamepad connected at index " + event.gamepad.index );

        if ( event.gamepad )
        {
            name = event.gamepad.id;
            //scope.data.arrays.functions.push( { name: name, scope: this, function: update, args: null } );
            scope.methods.broadcast( "gamepad_found" );
            update()
        }
    };

    const disconnection = function( event )
    {
        name = event.gamepad.id;
        scope.config.gamepads.delete( name );
        scope.methods.kill( scope.data.arrays.functions, name );
        error( name, "disconnected" );
    };

    function error( name, message )
    {
        throw ( `${ name } ${ message }` );
    }

    window.addEventListener( "gamepadconnected",    function( e ) { connection.call( this, e ); }, false );
    window.addEventListener( "gamepaddisconnected", function( e ) { disconnection.call( this, e ); }, false );
};