// this file only output to the game loop
// no functions are mapped to the buttons or axes
// see ui/app.gamepad.camera.js for camera control
const gamepad = function()
{
    var scope = "gamepad";
    var app = this;
        app[ scope ] = {};
    var name;

    const check = function()
    {
        var gamepads = Array.from( navigator.getGamepads() );
            gamepads.forEach( gamepad =>
            {
                if ( gamepad )
                {
                    this.gamepad = gamepad;
                }

                if ( !this.gamepad )
                {
                    app.kill( app.arrays.functions, name );
                    throw ( "gamepad connection error" );
                }
            } );
    };

    const update = function()
    {
        check();

        this.gamepad.values =
        {
            hat:    { x: {}, y: {} },
            axis:   {},
            button: {}
        };

        this.gamepad.buttons.forEach( ( button, index ) =>
        {
            if ( button.pressed || button.touched )
                this.gamepad.values.button[ index ] = { index: index, value: button.value, touched: button.touched, pressed: button.pressed };
        } );

        this.gamepad.axes.forEach( ( value, index ) =>
        {
            var v = this.gamepad.values;

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
        
        app.gamepad = this.gamepad;
    };

    const connection = function( event, connecting )
    {
        if ( connecting )
        {
            if ( app.debug ) console.info( "Gamepad connected at index " + this.gamepad.index );

            this.gamepad = event.gamepad;

            if ( this.gamepad )
            {
                name = `gamepad_${ event.gamepad.index }`;
                app.arrays.functions.push( { name: name, scope: this, function: update, args: null } );

                setTimeout( () => document.dispatchEvent( new Event( "gamepad_found" ) ), 500 );
            }
        }
        else
        {
            delete this.gamepad;
            delete app.gamepad;
            app.ui.debug.innerText = "Gamepad not found";
            app.kill( app.arrays.functions, name );
            throw ( "Gamepad not found" );
        }
    };

    window.addEventListener( "gamepadconnected",    function( e ) { connection.call( this, e, true  ); }, false );
    window.addEventListener( "gamepaddisconnected", function( e ) { connection.call( this, e, false ); }, false );
};