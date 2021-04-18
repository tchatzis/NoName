var app = {};

var App = function()
{
    //console.log( THREE.REVISION );

    this.title = "NoNameGame";
    this.url = window.location.origin == "https://tchatzis.github.io" ? window.location.origin + "/" + this.title + "/public/" : window.location.origin + "/";
    this.ready = false;
    this.isReady = () => { return this.ready };
    this.debug = false;
    this.helpers = {};
    this.props = {};

    this.arrays = { animations: [], functions: [], persistent: { background: [], ground: [], functions: [] }, lfo: [], videos: [] };
    this.assets = { textures: {}, displacements: {}, sprites: {}, fonts: {} };

    UI.call( this );
    Utils.call( this );
};

// login middleware
document.addEventListener( "scripts_loaded", function()
{
    app = new App();

    DB.call( app );

    UI.forms.process.checkAuth.call( app );

    console.log( app );
}, false );

// start the app
App.prototype.init = function()
{
    var limit = 7;
    var value = 1;
    var progress = new this.utils.Progress( { value: value, limit: limit } );
        progress.update( { label: "Calculating frame rate", value: value++ } );

    this.utils.framerate();

    Audio.call( this );
    Ammo.call( this ).then( AmmoLib => Ammo3.call( this ) );
    Fractal.call( this );
    Getters.call( this );
    Lipstick.call( this );
    Listeners.call( this );
    Music.call( this );
    Oimo3.call( this );
    Patterns.call( this );
    Path.call( this );
    Path.Organic.call( this );
    Path.Plot.call( this );
    Persistent.call( this );
    Presets.call( this );
    Raycaster.call ( this );
    Record.call ( this );
    Scenes.call ( this );
    Setters.call( this );
    Shaders.call( this );
    Textures.call( this );
    Trajectory.call( this );

    document.addEventListener( "framerate", function()
    {
        progress.update( { label: "Loading fonts", value: value++ } );
        LoadFonts.call( this );

    }.bind( this ) );

    document.addEventListener( "fonts_loaded", function()
    {
        progress.update( { label: "Loading textures", value: value++ } );
        LoadTextures.call( this, { debug: false, directory: "/images/textures/" } );
    }.bind( this ) );

    document.addEventListener( "textures_loaded", function()
    {
        progress.update( { label: "Loading stage", value: value++ } );
        Stage.call( this );

        progress.update( { label: "Loading controls", value: value++ } );

        this.controls =
        {
            active: { beam: false, run: false, hose: false, axes: false, sky: true }
        };
        
        mouse.call( this );
        gamepad.call( this );

        progress.update( { label: "Loading props", value: value++ } );
        postprocessing.call( this );

        samples.call( this );
        navdata.call( this );
        navigation.call( this );

        var event = new Event( "assets_loaded" );
        document.dispatchEvent( event );
    }.bind( this ) );

    document.addEventListener( "gamepad_found", function()
    {
        Dolly.call( this );

    }.bind( this ), false );

    document.addEventListener( "assets_loaded", function()
    {
        animate.call( this );

        document.title = this.title;
        this.ready = true;

        var event = new Event( "running" );
        document.dispatchEvent( event );

        progress.update( { label: "Running", value: value++ } );
        
    }.bind( this ), false );
};