var options = sounds;

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        dimensions: new THREE.Vector3( this.audio.frequencies.length, 1, 120 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 0.5, 1, 0.5 ),
        type: "block",
        shader: "realtime",
        output: "realtime",
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0x009999 ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "set" },
            opaque:  { type: "float", name: "set", value: 0.25 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 0.1 },
            phase:          { type: "float", value: 1 },
            amplitude:      { type: "float", value: 0.5 }
        }
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option )
    {
        var blob = new Blob();
            blob.init.call( this, args );
            blob.audio = option;

    }.bind( this );

    return this.props[ name ];
};

export { prop, options };