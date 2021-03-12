var options = {};

var prop = function( name )
{
    options.dunes =
    {
        type: "dunes",
        amplitude: 4,
        noiseScale: 16,
        speed: 0.1,
        lateral: 0,
        axis: "z",
        base: { h: 0.5, s: 0.5, l: 0.2 },
        influence: { h: 1, s: 0, l: 0 },
        function: "hsl",
        smooth: true,
        animate: false,
        texture: this.assets.textures[ "mars" ],
        vertexColors: true
        //forward: true
    };
    
    options.rocky =
    {
        type: "dunes",
        amplitude: 4,
        noiseScale: 16,
        speed: 0.1,
        lateral: 0,
        axis: "z",
        base: { h: 0, s: 0.5, l: 0.2 },
        influence: { h: 1, s: 0, l: 1 },
        function: "hsl",
        smooth: false,
        animate: false,
        texture: this.assets.displacements[ "bump_map_2" ],
        vertexColors: true
        //forward: true
    };

    options.height =
    {
        type: "height",
        amplitude: 5,
        noiseScale: 8,
        speed: 0.1,
        axis: "z",
        gradient: [
            { color: 0x5EA7E2, steps: 4 },
            { color: 0x5C707F, steps: 2 },
            { color: 0x092E7E, steps: 4 },
            { color: 0x03083E, steps: 12 },
            { color: 0x07326D, steps: 6 },
            { color: 0x245E99, steps: 2 },
            { color: 0x6DACDB, steps: 4 },
            { color: 0XFFFFFF, steps: 2 }
        ],
        smooth: false,
        animate: false,
        vertexColors: true
        //forward: true
    };

    options.moon =
    {
        type: "height",
        amplitude: 5,
        noiseScale: 8,
        speed: 0.1,
        axis: "z",
        gradient: [
            { color: 0x1B1B1B, steps: 4 },
            { color: 0x282828, steps: 2 },
            { color: 0x5D5D5D, steps: 4 },
            { color: 0x747474, steps: 5 },
            { color: 0x050505, steps: 6 },
            { color: 0x727272, steps: 2 },
            { color: 0xA2A2A2, steps: 4 },
            { color: 0xFFFFFF, steps: 2 }
        ],
        smooth: true,
        animate: false,
        vertexColors: true
        //forward: true
    };

    options.ocean =
    {
        type: "ocean",
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: this.assets.textures[ "waternormals" ].texture,
        time: 0.01,
        alpha: 1,
        sunDirection: this.stage.scene.sunlight ? this.stage.scene.sunlight.position.clone().normalize() : new THREE.Vector3( 0, 1, 0 ),
        sunColor: this.stage.scene.sunlight ? this.stage.scene.sunlight.color : new THREE.Color( 0xffffff ),
        waterColor: new THREE.Color( 0x0A223A ),
        distortionScale: 4,
        fog: this.stage.scene.fog !== undefined,
        size: 8.0,
        eye: new THREE.Vector3( 0, 1.5, 0 )
    };

    options.waves =
    {
        type: "waves",
        amplitude: 5,
        noiseScale: 8,
        speed: 0.5,
        lateral: 0,
        smooth: true,
        animate: true
        //forward: true
    };

    const group =
    {
        name: name,
        parent: this.stage.persistent
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.props[ name ].group;
        option.name = key;

        const plane =
        {
            name: name,
            parent: this.stage.persistent,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFFFF ),
            width: 100,
            height: 100,
            widthSegments: 100,
            heightSegments: 100,
            vertical: false
        };

        var prop = new this.presets.Plane( plane );
            prop.enhance( this.lipstick.persistent, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };