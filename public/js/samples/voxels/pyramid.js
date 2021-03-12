var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        sides: 8,
        size: new THREE.Vector3( 1, 0.2, 1 ),
        spacing: 0,
        levels: 12,
        attributes:
        {
            color: { value: new THREE.Color( 0xFF9900 ) },
            alternate: { value: new THREE.Color( 0x0033FF ) },
            opaque: { value: 1 }
        },
        uniforms:
        {
            light: { value: this.stage.lights[ "directional" ].position },
            diffuseColor: { value: new THREE.Color( 0.3, 0.3, 0.3 ) },
            specularColor: { value: new THREE.Color( 1, 1, 1 ) },
            time: { value: 0 },
            duration: { value: 1 },
            phase: { value: 1 } // -1: no movement, 0: start, 1: end
        },
        up: 1,
        index: 0
    };

    this.props[ name ] = new Pyramid();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };