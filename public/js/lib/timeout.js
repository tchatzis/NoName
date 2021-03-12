const Timeout = function( parameters )
{
    var base = 36;

    this.time = { id: ( Math.random() * Date.now() ).toString( base ) };
    this.timeout = new Worker( '/js/timeout.worker.js' );

    this.cancel =
    {
        all: function()
        {
            parameters.scope[ parameters.group ].forEach( ( instance ) =>
            {
                instance.pause();
            } );
        },

        previous: function()
        {
            parameters.scope[ parameters.group ].forEach( ( instance ) =>
            {
                if ( instance.time.id !== this.time.id )
                {
                    instance.pause();
                }
            } );
        },

        self: function()
        {
            this.timeout.terminate();
            this.time = {};

        }.bind( this )
    };

    // worker methods
    this.pause = function()
    {
        this.time.action = "pause";
        this.timeout.postMessage( this.time );
    };

    this.resume = function()
    {
        this.time.action = "resume";
        this.timeout.postMessage( this.time );
    };

    // message handlers
    this.elapsed = function()
    {
        parameters.function.call( parameters.scope, parameters.arguments );
        this.cancel.self();
    };

    this.running = function()
    {
        //console.log( "running", this.time );
    };

    this.paused = function()
    {
        //console.warn( "paused", this.time );
    };

    // set up
    var group = ( function()
    {
        if ( parameters.hasOwnProperty( "scope" ) )
        {
            if ( parameters.hasOwnProperty( "group" ) )
            {
                if ( !parameters.scope.hasOwnProperty( parameters.group ) )
                {
                    parameters.scope[ parameters.group ] = [];
                }

                this.group = parameters.group;
            }

            parameters.scope[ parameters.group ].push( this );
        }
    }.bind( this ) )();

    var receive = function( e )
    {
        Object.assign( this.time, e.data );

        this[ this.time.process ].call( this );
    }.bind( this );

    this.start = function()
    {
        var now = Date.now();

        Object.assign( this.time,
        {
            start: now,
            time: parameters.time,
            expires: parameters.time + now,
            running: true,
            action: "loop"
        } );

        this.timeout.postMessage( this.time );
        this.timeout.onmessage = receive;
    };
};