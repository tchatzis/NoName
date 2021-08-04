function QT()
{
    this.config =
    {
        controls:
        {
            active: { beam: false, run: false, hose: false, axes: false, sky: true },
            type: "orbit"
        },
        debug: false,
        dependencies: { three: THREE.REVISION },
        loaded: new Set(),        
        progress: { limit: 7, value: 1 },
        ready: false,
        sample: { path: "applications/designer", options: ( imported ) => {}/*console.info( "sample", imported )*/ },
        title: "NoNameGame",
        url: window.location.origin == "https://tchatzis.github.io" ? window.location.origin + "/" + this.title + "/public/" : window.location.origin + "/"
    };

    this.data =
    {
        arrays: { animations: [], functions: [], persistent: { background: [], ground: [], functions: [] }, lfo: [], videos: [] },
        assets: { textures: {}, displacements: {}, sprites: {}, fonts: {} }
    };

    this.devices =
    {
        gamepads: new Set()
    };

    this.methods =
    {
        animate: ( args ) =>
        {
            this.data.animations.push( args );
        },

        broadcast: ( name ) =>
        {
            var event = new Event( name );

            window.dispatchEvent( event );
        },

        import: async ( name, url ) =>
        {
            this.config.loaded.add( name );

            // noinspection
            var script = await import( `${ this.config.url }js/${ url }` );

            return script;
        },

        invoke: ( args ) =>
        {
            this.data.functions.push( args );
        },

        kill: ( array, name ) =>
        {
            var index = array.findIndex( item => item.name === name );

            if ( index > -1 )
            {
                array.splice( index, 1 );
                this.methods.kill( array, name );
            }
        },

        ready: () => this.config.ready
    };

    this.props = {};
}