var options = sounds;

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        // bender
        bender:
        {
            sides: 0,
            straightness: 200,
            onInstancedCallback: ( instanced ) => rotate.call( this, instanced.mesh.parent )
        },
        // mesh        
        geometry: "box",     // sphere, box
        dimensions: new THREE.Vector3( this.audio.frequencies.length, 16, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 2, 1, 1 ),
        shader: "analyser",
        output: "bar",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0.05, 0.05, 0.05 ) },
            alternate:{ type: "vec3", value: new THREE.Color( 0, 0, 0 ) },
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
            duration:       { type: "float", value: 0.1 },
            phase:          { type: "float", value: 0 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    function rotate( object )
    {
        this.arrays.animations.push( { name: name, object: object, path: "rotation.y", value: 0.01 } );
    }

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option )
    {
        var analyser = new Analyser();
            analyser.init.call( this, args );
            analyser.audio = option;
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };