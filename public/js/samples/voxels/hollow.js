var options = {};

var prop = function( name )
{
    options.ball =
    {
        type: "sphere",
        trajectory:
        {
            name: name,
            type: "helix",
            a: 2,
            b: 1,
            c: 1,
            limit: new THREE.Vector3( Infinity, Infinity, -100 ),
            speed: 5
        }
    };

    options.box =
    {
        type: "box",
        trajectory:
        {
            name: name,
            type: "accelerate",
            a: 9.8,
            limit: new THREE.Vector3( Infinity, Infinity, -100 ),
            speed: 0.1
        }
    };

    var blob =
    {
        name: name,
        parent: this.stage.props,
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        spacing: 0.2,
        type: "reinforced",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "random", value: { min: 0x660066, max: 0x00FFFF } },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 0.5 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0, 0, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
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
        option.parent = group.parent;

        var hollow = new Hollow();
            hollow.init.call( this, option );
            hollow.blob = new Blob();
            hollow.blob.init.call( this, blob );

        this.listeners.add( window, { type: "keyup", value: " ", function: hollow.fire } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };