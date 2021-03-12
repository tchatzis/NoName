const Audio = function()
{
    var scope = "audio";
    var app = this;
        app[ scope ] = {};

    app[ scope ].loaded = [];
    app[ scope ].frequencies = [ 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000 ];
    app[ scope ].param = {};

    app[ scope ].init = function( args )
    {
        Object.assign( app, this );
        Object.assign( app[ scope ], args );

        app[ scope ].context = new AudioContext();
        app[ scope ].find( args );
    };

    app[ scope ].find = function( args )
    {
        function find( name )
        {
            var buffer;

            for ( let f = 0; f < app[ scope ].loaded.length; f++ )
            {
                let obj = app[ scope ].loaded[ f ];

                if ( obj.name === name )
                {
                    buffer = obj.buffer;
                    break;
                }
            }

            app[ scope ].buffer = buffer;
            app[ scope ].play();
        }

        if ( !app[ scope ].loaded.find( item => item.name === args.name ) )
            app[ scope ].loader( args.name, args.ext );
        else
            find( args.name );
    };

    app[ scope ].loader = function( name, ext )
    {
        var decode = function( e )
        {
            app[ scope ].context.decodeAudioData( e.target.response, function( buffer )
            {
                app[ scope ].loaded.push( { name: name, buffer: buffer } );
                app[ scope ].buffer = buffer;
                app[ scope ].clipping();

                if ( !app[ scope ].clipped )
                    app[ scope ].play();
            } );
        };

        ext = ext ? ext : "mp3";

        var url = app.url + "audio/" + name + "." + ext;

        var request = new XMLHttpRequest();
            request.open( 'GET', url, true );
            request.responseType = 'arraybuffer';
            request.addEventListener( "load", decode );
            request.send();
    };

    app[ scope ].clipping = function()
    {
        var clipping = false;
        var time = [];

        for ( var i = 0; i < app[ scope ].buffer.length; i++ )
        {
            if ( Math.abs( app[ scope ].buffer[ i ] ) >= 1.0 )
            {
                clipping = true;
                time.push( window.Performance.now() );
                break;
            }
        }

        app[ scope ].clipped = clipping;
    };

    app[ scope ].play = function()
    {
        app[ scope ].playing = true;

        //source
        app[ scope ].source = app[ scope ].context.createBufferSource();
        app[ scope ].source.buffer = app[ scope ].buffer;
        
        // destination
        switch ( app[ scope ].node )
        {
            case "analyser":
                app[ scope ].analyser = app[ scope ].context.createAnalyser();
                app.arrays.functions.push( { name: app[ scope ].name, scope: scope, function: app[ scope ].analyse, args: null } );

                app[ scope ].source.connect( app[ scope ].analyser );
                app[ scope ].analyser.connect( app[ scope ].context.destination );
            break;
            
            case "source":
                app[ scope ].source.connect( app[ scope ].context.destination );
            break;
        }

        app[ scope ].processor = app[ scope ][ app[ scope ].node ];
        app[ scope ].source.start( 0, 0, 15 );
        app[ scope ].source.onended = app[ scope ].stop;
    };

    app[ scope ].pause = function()
    {
        if ( app[ scope ].context.state === "running" )
        {
            app[ scope ].context.suspend();
            app[ scope ].playing = false;
        }
        else
        {
            app[ scope ].context.resume();
            app[ scope ].playing = true;

            if ( app[ scope ].analyser )
                app[ scope ].frequency();
        }
    };

    app[ scope ].analyse = function()
    {
        if ( app[ scope ].playing )
        {
            var domain = new Uint8Array( app[ scope ].analyser.frequencyBinCount );
            var length = app[ scope ].frequencies.length;

            app[ scope ].analyser.getByteFrequencyData( domain );
            app[ scope ].analyser.data = [];

            var get = function( frequency )
            {
                var nyquist = app[ scope ].context.sampleRate / 2;
                var index = Math.round( frequency / nyquist * domain.length );

                return domain[ index ] / 256;
            };

            for ( let i = 0; i < length; i++ )
            {
                let frequency = app[ scope ].frequencies[ i ];
                let value = get( frequency );
                let db = 20 * ( Math.log( value ) / Math.log( 10 ) );
                    db = Math.max( -50, Math.min( db, 0 ) );
                let percent = 100 + ( db * 2 );

                app[ scope ].analyser.data.push( { index: i, frequency: frequency, value: value, db: db, percent: percent } );
            }
        }

        if ( app[ scope ].onAudioInputConnect )
            app[ scope ].onAudioInputConnect( app[ scope ].analyser.data );
    };

    app[ scope ].connect = function( callback )
    {
        app[ scope ].onAudioInputConnect = callback;
    };

    app[ scope ].hold = function( depth, percent )
    {
        if ( !app[ scope ].playing )
        {
            var length = app[ scope ].frequencies.length;

            for ( let d = 0; d < depth; d++ )
            {
                for ( let i = 0; i < length; i++ )
                {
                    let frequency = app[ scope ].frequencies[ i ];

                    app[ scope ].analyser.data.push( { index: i, frequency: frequency, value: 0, db: 0, percent: percent } );
                }
            }
        }
    };

    app[ scope ].stop = function()
    {
        app[ scope ].playing = false;

        if ( app[ scope ].source )
            app[ scope ].source.stop( 0 );

        app.kill( app.arrays.functions, app[ scope ].name );
    };

    app[ scope ].disconnect = function()
    {
        app[ scope ].stop();
        app[ scope ].source.disconnect( app[ scope ].processor );
        app[ scope ].processor.disconnect( app[ scope ].context.destination );
        app[ scope ].onAudioInputConnect = null;
    };

    app[ scope ].Tone = function( args )
    {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.gain.exponentialRampToValueAtTime( 0.00001, this.context.currentTime + 4 / args.note * args.beat );
        this.osc = this.context.createOscillator();
        this.osc.type = args.type || "sine";
        this.osc.frequency.value = args.frequency;
        this.osc.connect( this.gainNode );
        this.gainNode.connect( this.context.destination );
        this.osc.start();
    };
};

