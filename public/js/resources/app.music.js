const Music = function()
{
    var scope = "music";
    var app = this;
        app[ scope ] = {};

    app[ scope ].Notes = function()
    {
        var names = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];
        var intervals = names.length;
        var semitone = Math.pow( 2, 1 / intervals );
        var notes = [];
        var frequency = 16.35;

        for ( let octave = 0; octave < 11; octave++ )
        {
            for ( let interval = 0; interval < intervals; interval++ )
            {
                notes.push(
                {
                    name: `${ names[ interval ] }${ octave }`,
                    label: frequency < 1000 ? Math.round( frequency ) + "Hz" : Math.round( frequency / 10 ) / 100 + "kHz",
                    frequency: frequency,
                    octave: octave,
                    interval: interval
                } );

                frequency *= semitone;
            }
        }

        this.get = function( name )
        {
            return notes.find( note => note.name === name.toUpperCase() );
        };

        this.notes = notes;
    };

    app[ scope ].Metronome = function( args )
    {
        this.note = args.note / 4;
        this.signature = args.signature || 4;
        this.running = false;
        this.bpm = args.bpm || 120;
        this.starttime = performance.now();
        this.runtime = args.runtime || 1000;
        this.index = 0;
        this.elapsedtime = 0;
        this.bars = args.bars || Infinity;
        this.beattime = 1000 / ( this.bpm / 60 );

        this.listen = function()
        {
            this.ended = { time: this.elapsedtime > this.runtime, bars: this.barcount > this.bars, data: this.index >= this.data.length };

            if ( this.ended.time || this.ended.bars || this.ended.data )
            {
                this.stop();
                return;
            }

            this.barcount = Math.floor( this.index * this.note / this.signature ) + 1;
            this.elapsedtime = performance.now() - this.starttime;
            console.log( this.index, this.data.length, this.barcount, this.elapsedtime, this.data[ this.index ] );
            this.index++;
        };

        this.play = function( song )
        {
            this.running = true;
            this.data = song;
            this.interval = setInterval( () => this.listen.call( this ), this.beattime / this.note );
        };

        this.stop = function()
        {
            console.error( this.ended );
            this.running = false;
            clearInterval( this.interval );
        };
    };

    app[ scope ].Note = function( args )
    {
        this.type = args.type || 4;
        this.name = args.name || "A4";
    };

    app[ scope ].Bar = function( args )
    {


    };

    /*var Song = function()
    {
        this.signature = 4;
        this.note = 4;

        app[ scope ].Metronome.call( this, { bpm: 120, bars: 4, signature: this.signature, runtime: 5000, note: this.note } );

        var notes = new app[ scope ].Notes();
        var a4 = notes.get( "A3" );

        var toggle = function ()
        {
            new app.audio.Tone( {
                frequency: a4.frequency,
                beat: this.beattime / 1000,
                note: 1, // 1: whole, 2: half, 4: quarter, etc
                type: "sawtooth"
            } );

        }.bind( this );

        document.addEventListener( "click", toggle, false );
    };

    new Song();*/
};