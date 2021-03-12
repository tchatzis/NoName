const Planets = function()
{
    var app = {};
    var scope = this;
    var radius = 5;
    var depth = 0;

    var direction = function()
    {
        return Math.sign( Math.random() - 0.5 );
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;

        scope.parent.add( scope.group );

        scope.textures = [ "blue", "circles", "earthly", "green_1", "green_2", "green_3", "green_4", "green_5", "green_6", "graph", "jupiter", "lightning",
        "mars", "mosaic", "perlin-512", "radial", "surface_1", "surface_2", "surface_3", "saturn", "stained_glass", "waternormals", "water_planet" ];
        scope.mapped = [];

        new Space();

        map();
    };

    const Space = function()
    {
        const dome =
        {
            name: "space",
            parent: scope.group,
            color: new THREE.Color( 1, 1, 1 )
        };

        const args =
        {
            includes: { fragment: [ "noise", "random" ] },
            params:
            {
                side: THREE.FrontSide,
                transparent: true,
                blending: THREE.AdditiveBlending
            },
            uniforms:
            {
                alpha:      { value: 0.8 },
                time:       { value: 0 },
                scale:      { value: 2 },
                speed:      { value: 0.01 },
                brightness: { value: 0.3 }
            }
        };

        app.stage.scene.background = null;

        var space = new app.presets.Dome( dome );
            space.shader.load( "space", args );

        app.arrays.animations.push( { name: scope.name, object: space.mesh, path: "material.uniforms.time.value", value: 0.01 } );
    };

    const Planet = function( args )
    {
        this.speed = 100 * Math.random() - 100;
        this.name = args.texture;
        this.color = args.color ? args.color : new THREE.Color( 0xFFFFFF * Math.random() );
        this.rotation =
        {
            attribute: `rotation.${ app.utils.item( [ "x", "y", "z" ] ) }`,
            value: Math.random() * direction() * 0.001 + 0.01
        };
        this.tilt = app.utils.range( -Math.PI / 3, Math.PI / 3 );
        this.texture = app.assets.textures[ args.texture ];
        this.displacement =
        {
            scale: Math.random() * args.radius / radius,
            bias: 0
        };
        this.orbit =
        {
            type: "ellipse",
            a: args.orbit.a,
            b: args.orbit.b,
            speed: this.speed / args.orbit.a,
            target: args.target,
            orientation: { axis: `rotate${ app.utils.item( scope.orientation.axes ) }`, value: Math.PI * Math.random() * scope.orientation.amount },
            static: false
        };
        this.sphere =
        {
            name: this.name,
            parent: scope.group,
            radius: args.radius,
            widthSegments: 128,
            heightSegments: 64
        };

        var sphere = new app.presets.Sphere( this.sphere );
            sphere.enhance( app.lipstick.Planet, this );

        this.target = sphere.group;
    };

    const Sun = function()
    {
        const sphere =
        {
            name: "sun",
            parent: scope.group,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0x000000 ),
            radius: 10,
            widthSegments: 32,
            heightSegments: 32,
            phiStart: 0,
            phiLength:  Math.PI * 2,
            thetaStart: 0,
            thetaLength: Math.PI * 2
        };

        const sun =
        {
            type: "glow",
            includes: { fragment: [ "noise" ] },
            params:
            {
                side: THREE.FrontSide,
                transparent: true,
                blending: THREE.NoBlending,
                depthTest: true
            },
            uniforms:
            {
                viewVector: { value: app.stage.camera.position },
                c:          { value: 0.2 },
                power:      { value: 3.0 },
                glowColor:  { value: new THREE.Color( 0x00ff66 ) },
                opacity:    { value: 1 },
                time:       { value: 0.0 }
            },
            layer: 1
        };

        var prop = new app.presets.Sphere( sphere );
            prop.shader.load( sun.type, sun );
            prop.mesh.layers.set( sun.layer );

        app.arrays.animations.push( { name: scope.name, object: prop.mesh, path: "material.uniforms.time.value", value: 0.01 } );

        this.target = sun.group;
    };

    const texture = function( name )
    {
        var texture = app.utils.item( scope.textures );

        var index = scope.textures.indexOf( name );

        if ( index > - 1 )
            scope.textures.splice( index, 1 );

        return texture;
    };

    const map = function( current )
    {
        depth++;

        if ( !current )
        {
            current = new Sun();
        }

        var moons = app.utils.random( 0, 3 );

        for ( var moon = 0; moon < moons; moon++ )
        {
            var args =
            {
                radius: radius * Math.random()
            };

            if ( scope.textures.length && args.radius > 1 )
            {
                var orbit = ( moon + depth ) * ( radius + args.radius ) * 2;

                args.orbit = { a: orbit * ( Math.random() + 1 ), b: orbit };
                args.target = current.target;
                args.texture = texture( current.name );

                map( new Planet( args ) );
            }
        }

        scope.mapped.push( current.name );
    };
};