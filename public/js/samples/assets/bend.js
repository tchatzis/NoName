var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        // bender
        bender:
        {
            sides: 8,
            straightness: 200,
            onBendComplete: ( scope ) => console.log( scope )
        },
        // mesh
        geometry: "box",     // sphere, box
        dimensions: new THREE.Vector3( 120, 8, 1 ),
        size: 1,
        spacing: 0.1,
        scale: new THREE.Vector3( 1, 1, 1 ),
        shader: "instanced",
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0.5, 0.5, 0.5 ) },
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

    this.props[ name ] = new Bend();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };