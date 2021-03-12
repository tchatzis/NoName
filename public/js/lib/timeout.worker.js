self.onmessage = function( e )
{
    var args = e.data;
        args.elapsed = Date.now() - args.start;
    var last = args.elapsed;

    self.pause = function()
    {
        self.loop();
    };

    self.resume = function()
    {
        args.action = "loop";
        args.running = true;
        self.loop();
    };

    self.loop = function()
    {
        var limit = Math.min( args.elapsed + 500, args.time );

        do
        {
            args.elapsed   = Date.now() - args.start;
            args.remaining = args.time - args.elapsed;

            if ( args.action === "pause" )
            {
                args.running = false;
                args.process = "paused";
                self.postMessage( args );
                break;
            }

            if ( args.action === "loop" )
            {
                if ( args.elapsed >= args.time )
                {
                    args.running = false;
                    args.process = "elapsed";
                    self.postMessage( args );
                    break;
                }

                args.process = "running";
                self.postMessage( args );
                last = args.elapsed;
            }
        }
        while ( args.elapsed < limit && args.elapsed !== last );

        if ( args.running && args.elapsed < args.time )
        {
            requestAnimationFrame( self.loop );
        }
    };

    self[ args.action ].call( self );
};