var options = {};

var prop = function( name )
{
    options.circle =
    {
        // marquee
        characters: CHARACTERS[ "block" ],
        message: "The new marquee is the same as analyser.",
        reverse: false,
        inverse: true,
        space: 1,
        // bender
        bender:
        {
            sides: 0,
            straightness: 200
        },
        // mesh
        geometry: "sphere",     // sphere, box
        dimensions: new THREE.Vector3( 128, 16, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 1, 1, 1 ),
        shader: "marquee",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0.05, 0.05, 0.05 ) },
            alternate:{ type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
            start:   { type: "vec3", value: new THREE.Vector3() },
            end:     { type: "vec3", value: new THREE.Vector3() },
            opaque:  { type: "float", value: 1 },
            level:   { type: "float", value: 16 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 0.25 },
            phase:          { type: "float", value: -1 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    options.octagon =
    {
        // marquee
        characters: CHARACTERS[ "block" ],
        message: "The new marquee is the same as analyser.",
        reverse: false,
        inverse: false,
        space: 1,
        // bender
        bender:
        {
            sides: 8,
            straightness: 200
        },
        // mesh
        geometry: "box",     // sphere, box
        dimensions: new THREE.Vector3( 128, 16, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 1, 1, 1 ),
        shader: "marquee",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0.05, 0.05, 0.05 ) },
            alternate:{ type: "vec3", value: new THREE.Color( 0, 1, 0 ) },
            start:   { type: "vec3", value: new THREE.Vector3() },
            end:     { type: "vec3", value: new THREE.Vector3() },
            opaque:  { type: "float", value: 1 },
            level:   { type: "float", value: 16 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 0.25 },
            phase:          { type: "float", value: -1 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    options.reverse =
    {
        // marquee
        characters: CHARACTERS[ "block" ],
        message: "The new marquee is the same as analyser.",
        reverse: true,
        inverse: false,
        space: 1,
        // bender
        bender:
        {
            sides: 4,
            straightness: 200
        },
        // mesh
        geometry: "box",     // sphere, box
        dimensions: new THREE.Vector3( 128, 16, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 1, 1, 1 ),
        shader: "marquee",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0.05, 0.05, 0.05 ) },
            alternate:{ type: "vec3", value: new THREE.Color( 1, 0, 0 ) },
            start:   { type: "vec3", value: new THREE.Vector3() },
            end:     { type: "vec3", value: new THREE.Vector3() },
            opaque:  { type: "float", value: 1 },
            level:   { type: "float", value: 16 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 0.25 },
            phase:          { type: "float", value: -1 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    options.stonehenge =
    {
        // marquee
        characters: CHARACTERS[ "block" ],
        message: "Stonehenge",
        reverse: false,
        inverse: false,
        static: true,
        space: 1,
        // bender
        bender:
        {
            sides: 0,
            straightness: 0
        },
        // mesh
        geometry: "box",     // sphere, box
        dimensions: new THREE.Vector3( 128, 16, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 1, 1, 1 ),
        shader: "marquee",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0, 0, 0 ) },
            alternate:{ type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
            start:   { type: "vec3", value: new THREE.Vector3() },
            end:     { type: "vec3", value: new THREE.Vector3() },
            opaque:  { type: "float", value: 1 },
            level:   { type: "float", value: 16 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 0.25 },
            phase:          { type: "float", value: -1 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.stage.props;
        option.name = key;

        var marquee = new Marquee();
            marquee.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };