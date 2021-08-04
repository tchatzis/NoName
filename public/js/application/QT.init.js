QT.prototype.authenticate = async function()
{
    const { default: DB } = await this.methods.import( "db", "resources/QT.Firebase.js" );
    
    this.db = new DB();
    this.getters = new QT.Getters();
    this.setters = new QT.Setters();
    this.forms = new QT.Forms();
    this.forms.init.call( this, { name: "authenticate", parent: this.ui.modal } );
};

QT.prototype.gameloop = function()
{
    this.progress.update( { label: "Loading props", value: value++ } );
    this.methods.broadcast( "stage_set" );
};

QT.prototype.init = async function()
{
    const { default: Utils } = await this.methods.import( "db", "resources/app.utils.js" );

    this.utils = new Utils();
    this.utils.framerate();
    this.progress = new this.utils.Progress( { value: this.config.progress.value, limit: this.config.progress.limit } );
    this.progress.update( { label: "Authorized", value: this.config.progress.value++ } );

    QT.LoadFonts.call( this );
    QT.LoadTextures.call( this );

    this.stage = new QT.Stage();
    QT.PostProcessing.call( this );

    QT.MouseControls.call( this, this.config.controls.type );
    QT.GamePad.call( this );

    this.presets = new QT.Presets();
    this.record = new QT.Record();

    this.progress.update( { label: "Loading fonts and textures", value: this.config.progress.value++ } );


    //Audio.call( this );
    //Ammo.call( this ).then( AmmoLib => Ammo3.call( this ) );
    //Fractal.call( this );
    //Getters.call( this );
    //Lipstick.call( this );
    //Listeners.call( this );
    //Music.call( this );
    //Oimo3.call( this );
    //Patterns.call( this );
    //Path.call( this );
    //Path.Organic.call( this );
    //Path.Plot.call( this );
    //Persistent.call( this );
    //Presets.call( this );
    //Raycaster.call ( this );
    //Record.call ( this );
    //Scenes.call ( this );
    //Setters.call( this );
    //Shaders.call( this );
    //Textures.call( this );
    //Trajectory.call( this );
};

QT.prototype.listeners = function()
{
    // modal: initial load
    window.addEventListener( "scripts_loaded", () => this.authenticate(), false );

    window.addEventListener( "scripts_progress", ( e ) =>
    {
        this.ui[ "modal_progress" ].value = e.detail.value;
        this.ui[ "modal_label" ].innerText = e.detail.name;
    }, false );

    // async
    window.addEventListener( "framerate", () =>
    {
        this.progress.update( { label: `${ this.utils.fps } fps`, value: this.config.progress.value++ } );
        this.methods.broadcast( "stage_set" );
    }, false );

    window.addEventListener( "fonts_loaded", () => this.progress.update( { label: "fonts loaded", value: this.config.progress.value++ } ), false );

    window.addEventListener( "textures_loaded", () => this.progress.update( { label: "textures loaded", value: this.config.progress.value++ } ), false );

    // in order
    window.addEventListener( "stage_set", () =>
    {
        this.progress.update( { label: "stage set", value: this.config.progress.value++ } );
        this.animate = new QT.Animate();
        this.menu();
        this.methods.broadcast( "animation_started" );
    }, false );

    window.addEventListener( "menu_loaded", () =>
    {
        document.title = this.config.title;
        this.config.ready = true;
        
        this.samples.load.call( this, this.config.sample );
        this.progress.update( { label: "menu loaded", value: this.config.progress.value++ } );
        this.methods.broadcast( "running" );
    }, false );

    // gamepad: optional
    window.addEventListener( "gamepad_found", () => QT.GamePad.Camera.call( this ), false );
};

QT.prototype.menu = function()
{
    this.navdata = new QT.NavData();
    this.navigation = new QT.Navigation();
    this.samples = new QT.Samples();

    this.methods.broadcast( "menu_loaded" );
};

QT.prototype.start = async function()
{
    const { default: UI } = await this.methods.import( "ui", "ui/app.ui.js" );

    this.ui = new UI();

    this.listeners();
};

var app = new QT();
    app.start();