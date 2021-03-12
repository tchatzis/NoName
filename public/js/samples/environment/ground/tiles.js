var options =
{
    tiles:
    {
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 0x666666 ),
        size: new THREE.Vector3( 1, 0.01, 1 ),
        spacing: 0.01,
        dimensions: new THREE.Vector3( 5, 1, 5 )
    }
};

var prop = function( name )
{
    this.props[ name ] = new this.presets.Group( { name: name, parent: this.stage.persistent } );
    this.props[ name ].submenu = function( option )
    {
        Object.assign( option,
        {
            parent: this.stage.persistent,
            attributes:
            {
                color:   { type: "vec3", name: "set", value: new THREE.Color( 0x666666 ) },
                start:   { type: "vec3", name: "set" },
                end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
                opaque:  { type: "float", name: "set", value: 1.0 }
            },
            uniforms:
            {
                lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
                diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
                specularColor:  { type: "vec3", value: new THREE.Color( 0, 0, 0.2 ) },
                time:           { type: "float", value: 0 },
                duration:       { type: "float", value: 1 },
                phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
            },
            physics:
            {
                engine: "ammo",
                body: "rigid",
                mass: 0,
                restitution: 0.2,
                friction: 0.2,
                group: 2,
                mask: 1
            },
            disruptors:
            [
                {
                    name: name,
                    type: "reciprocate",
                    delay: new THREE.Vector3( 200, 0, 1000 ),
                    axis: "y",
                    value: 0.05
                    //onDisruptorUpdate: this.ammo.update
                },
                {
                    name: name,
                    type: "rotate",
                    delay: new THREE.Vector3( 200, 0, 1000 ),
                    axis: "z",
                    value: 0.1
                    //onDisruptorUpdate: this.ammo.update
                },
                {
                    name: name,
                    type: "color",
                    delay: new THREE.Vector3( 1000, 0, 1000 ),
                    axis: "z",
                    value: new THREE.Color( 0x00FFFF * Math.random() )
                }
            ]
        } );

        var sphere = new this.presets.Sphere(
        {
            name: "sphere",
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFF00 ),
            radius: 0.5,
            widthSegments: 32,
            heightSegments: 32,
            phiStart: 0,
            phiLength:  Math.PI * 2,
            thetaStart: 0,
            thetaLength: Math.PI * 2
        } );

        var cube = new this.presets.Cube(
        {
            name: name,
            parent: this.stage.props,
            size: 1,
            segments: 10,
            position: new THREE.Vector3( 0, 0, 0 )
        } );

        this.ammo.init( { gravity: new THREE.Vector3( 0, -9.8, 0 ) } );

        var tiles = new this.presets.Tiles( option );

        sphere.mesh.position.set( 0, 10, 0 );
        sphere.enhance( this.ammo.add, {
            body: "rigid",
            mass: 1,
            restitution: 0,
            friction: 0.2,
            group: 3,
            mask: 2
        } );

        cube.mesh.position.set( 0, 1, 0 );
        cube.enhance( this.ammo.add, {
            body: "soft",
            mass: 12,
            iterations: 40,
            pressure: 120,
            friction: 0.5,
            damping: 0.01,
            stiffness: 0.9,
            group: 3,
            mask: 2
        } );

        this.ammo.play();
        
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };