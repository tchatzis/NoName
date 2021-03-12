const navdata = function()
{
    var scope = "navdata";
    var app = this;
        app[ scope ] = {};

    const Background = function( args )
    {
        this.types = [ "background" ];
        this.type = "background";
        this.label = args.label;
        this.persistent = true;
    };

    const Default = function( types, position, rotation, lookat )
    {
        this.types = types;
        this.type = "default";
        this.camera =
        {
            position: position ? position : [ 0, 0, 5 ],
            rotation: rotation ? rotation : [ 0, 0, 0 ],
            lookat:   lookat   ? lookat   : [ 0, 0, 0 ]
        };
        this.hud = false;
    };

    const NoSubmenu = function( types, position, rotation )
    {
        Default.call( this, types, position, rotation );

        this.nosubmenu = true;
    };

    const Ground = function( args )
    {
        this.types = [ "ground" ];
        this.type = "ground";
        this.label = args.label;
        this.persistent = true;
    };

    app[ scope ].data =
    {
        // applications
        designer:       new Default( [ "applications" ], [ 0, 1.5, 15 ] ),
        shapes:         new Default( [ "applications" ], [ 0, 0, 2 ] ),
        // assets
        bend:           new Default( [ "assets" ], [ 0, 10, 30 ] ),
        cameralayers:   new Default( [ "assets" ], [ 7, 4, 7 ] ),
        city:           new Default( [ "assets" ], [ 0, 100, 500 ] ),
        geometry:       new Default( [ "assets" ], [ 0, 0, 15 ] ),
        grid:           new NoSubmenu( [ "assets" ], [ -7, 2.5, 10 ] ),
        hose:           new NoSubmenu( [ "assets" ], [ 0, 0, 0 ] ),
        marchingcubes:  new NoSubmenu( [ "assets" ], [ 0, 0, 2 ] ),
        marquee:        new Default( [ "assets" ], [ 0, 0, 50 ] ),
        maze:           new NoSubmenu( [ "assets" ], [ 0, 5, 50 ] ),
        pacman:         new Default( [ "assets" ], [ 0, 0, 16 ] ),
        planets:        new Default( [ "assets" ], [ 0, 0, 150 ] ),
        text:           new Default( [ "assets" ], [ 0, 0, 50 ] ),
        toxicpool:      new Default( [ "assets" ], [ 1, 12.5, 1 ] ),
        // audio
        play:           new Default( [ "audio" ] ),
        bar:            new Default( [ "audio" ], [ 0, 0, 30 ] ),
        level:          new Default( [ "audio" ], [ 0, 0, 16 ] ),
        height:         new Default( [ "audio" ], [ 12, 12, 19 ] ),
        peak:           new Default( [ "audio" ], [ 60, 20, 60 ] ),
        // background
        cubemap:        new Background( { label: "Cube Map" } ),
        fog:            new Background( { label: "Fog" } ),
        forcefield:     new Background( { label: "Force Field" } ),
        lightning:      new Background( { label: "Lightning" } ),
        overcast:       new Background( { label: "Overcast" } ),
        sky:            new Background( { label: "Sky" } ),
        space:          new Background( { label: "Space" } ),
        sunrise:        new Background( { label: "Sunrise" } ),
        texture:        new Background( { label: "Texture" } ),
        nobackground:   new Background( { label: "No Background" } ),
        // emitter
        emitter:        new NoSubmenu( [ "emitter" ], [ 0, 0, 5 ] ),
        // exploders
        exploders:      new NoSubmenu( [ "exploders" ], [ 0, 0, 10 ] ),
        // ground
        contour:        new Ground( { label: "Contour" } ),
        displacement:   new Ground( { label: "Displacement" } ),
        floor:          new Ground( { label: "Floor" } ),
        solid:          new Ground( { label: "Solid" } ),
        terrain:        new Ground( { label: "terrain" } ),
        tiles:          new Ground( { label: "Tiles" } ),
        water:          new Ground( { label: "Water" } ),
        noground:       new Ground( { label: "No Ground" } ),
        // fractals
        textures:       new Default( [ "fractals" ], [ 0, 0, 10 ] ),
        trees:          new Default( [ "fractals" ], [ 0, 25, 50 ] ),
        // lipstick
        collate:        new Default( [ "lipstick" ] ),
        cubecamera:     new Default( [ "lipstick" ], [ 0, 0, 5 ] ),
        explode:        new Default( [ "lipstick" ], [ 0, 0, 20 ] ),
        LFO:            new Default( [ "lipstick" ], [ 0, 0, 20 ] ),
        lookat:         new Default( [ "lipstick" ], [ 0, 0, 20 ] ),
        RenderTarget:   new Default( [ "lipstick" ], [ 0, 0, 15 ] ),
        planet:         new Default( [ "lipstick" ], [ 0, 0, 15 ] ),
        Sprites:        new Default( [ "lipstick" ], [ 0, 0, 15 ] ),
        Video:          new Default( [ "lipstick" ] ),
        VideoCube:      new Default( [ "lipstick" ] ),
        // path
        defined:        new Default( [ "path" ], [ 0, 0, 50 ] ),
        Lerp:           new Default( [ "path" ], [ 0, 0, 15 ] ),
        Organic:        new Default( [ "path" ], [ 0, 0, 15 ] ),
        Paths:          new Default( [ "path" ], [ 150, 50, 150 ] ),
        Structure:      new Default( [ "path" ], [ 150, 50, 150 ] ),
        trajectory:     new NoSubmenu( [ "path" ] ),
        // physics
        ammo:           new Default( [ "physics" ], [ 0, 1, 5 ] ),
        oimo:           new Default( [ "physics" ], [ 0, 1, 5 ] ),
        // raycaster
        culling:        new Default( [ "raycaster" ], [ -50, -100, 80 ] ),
        guiding:        new Default( [ "raycaster" ] ),
        lathe:          new Default( [ "raycaster" ], [ 0, 0, 50 ] ),
        ray:            new Default( [ "raycaster" ], [ 0, 0, 50 ] ),
        targeting:      new Default( [ "raycaster" ] ),
        tracking:       new Default( [ "raycaster" ], [ 3, 3, 3 ] ),
        // shaders
        beam:           new Default( [ "shaders" ] ),
        cube:           new Default( [ "shaders" ], [ 0, 0, 20 ] ),
        plane:          new Default( [ "shaders" ], [ 0, 0, 10 ] ),
        fresnel:        new Default( [ "shaders" ], [ 0, 0, 20 ] ),
        mirror:         new Default( [ "shaders" ], [ 0, 0, 10 ] ),
        sphere:         new Default( [ "shaders" ], [ 0, 3, 10 ] ),
        raymarching:    new Default( [ "shaders" ], [ 0, 1, 5 ] ),
        vortex:         new Default( [ "shaders" ], [ 0, 0, 5 ] ),
        // voxels
        blob:           new Default( [ "voxels" ], [ 0, 0, 50 ] ),
        hollow:         new Default( [ "voxels" ], [ 0, 0, 50 ] ),
        parametric:     new Default( [ "voxels" ], [ 0, 5, 20 ] ),
        polygons:       new Default( [ "voxels" ], [ 0, 0, 20 ] ),
        pyramid:        new Default( [ "voxels" ], [ 0, 0, 20 ] ),
        // widgets
        crud:           new Default( [ "widgets" ], [ 0, 0, 5 ] ),
        login:          new Default( [ "widgets" ], [ 0, 0, 5 ] ),
        widgets:        new Default( [ "widgets" ], [ 0, 0, 5 ] )
    };
};