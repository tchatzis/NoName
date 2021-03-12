var options = {};

var prop = function( name )
{
    options.block =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        spacing: 0.2,
        type: "block",
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

    options.box =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "box",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
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

    options.container =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "container",
        mod: new THREE.Vector3( 10, 10, 10 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: new THREE.Vector3( 0, 50, 50 ) },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0, 0, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    options.cage =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "cage",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
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

    options.corners =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "corners",
        mod: new THREE.Vector3( 10, 6, 3 ),
        layer: 1,
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
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

    options.edges =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "edges",
        mod: new THREE.Vector3( 10, 6, 3 ),
        layer: 1,
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: new THREE.Vector3() },
            diffuseColor:   { type: "vec3", value: new THREE.Color( 0, 0, 1 ) },
            specularColor:  { type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    options.frame =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "frame",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
            specularColor:  { type: "vec3", value: new THREE.Color( 0, 1, 1 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    options.jail =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "jail",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0x666666 ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: new THREE.Vector3() },
            diffuseColor:   { type: "vec3", value: new THREE.Color( 0xCC0000 ) },
            specularColor:  { type: "vec3", value: new THREE.Color( 0xFFFFFF ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    options.lattice =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "lattice",
        mod: new THREE.Vector3( 2, 2, 2 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 0.2 }
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

    options.nodes =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "nodes",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 1 }
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

    options.random =
    {
        dimensions: new THREE.Vector3( 10, 10, 10 ),
        size: 1,
        spacing: 0.02,
        type: "random",
        mod: new THREE.Vector3( 0, 0, 0 ),
        geometry: new THREE.SphereBufferGeometry( 0.5, 32, 32 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            end:     { type: "vec3", name: "set" },
            opaque:  { type: "float", name: "set", value: 0.5 }
        },
        uniforms:
        {
            lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
            diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
            specularColor:  { type: "vec3", value: new THREE.Color( 0, 0, 0.2 ) },
            time:           { type: "float", value: 0 },
            duration:       { type: "float", value: 1 },
            phase:          { type: "float", value: 1 } // -1: no movement, 0: start, 1: end
        }
    };

    options.reinforced =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "reinforced",
        mod: new THREE.Vector3( 10, 6, 3 ),
        layer: 1,
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0x003300 ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 0.2 }
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

    options.sphere =
    {
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        type: "sphere",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { type: "vec3", name: "set", value: new THREE.Color( 0x009999 ) },
            start:   { type: "vec3", name: "set" },
            end:     { type: "vec3", name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { type: "float", name: "set", value: 0.2 }
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
        option.name = option.type;
        option.parent = this.stage.props;

        var blob = new Blob();
            blob.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };