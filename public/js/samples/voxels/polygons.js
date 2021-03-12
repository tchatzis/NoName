var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        sides: 6,
        size: 1,
        spacing: 0.02,
        depth: 4,
        origin: new THREE.Vector3( 0, 6, 0 ),
        attributes:
        {
            color:   { type: "vec3", value: new THREE.Color( 0xFFFFFF ) },
            alternate:{ type: "vec3", value: new THREE.Color( 0x0033FF ) },
            opaque: { value: 0.5 }
        },
        uniforms:
        {
            light: { value: this.stage.lights[ "directional" ].position },
            diffuseColor: { value: new THREE.Color( 0.3, 0.3, 0.3 ) },
            specularColor: { value: new THREE.Color( 1, 1, 1 ) },
            time: { value: 0 },
            duration: { value: 1 },
            phase: { value: -1 }, // -1: no movement, 0: start, 1: end
        },
        up: 1,
        index: 0
    };

    this.props[ name ] = new Polygons();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };