var options = {};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    const raycaster =
    {
        name: name,
        width: 0.3,
        parent: this.stage.props,
        color: new THREE.Color( 0x00FF00 ),
        debug: true,
        near: 0.1,
        far: 100
    };

    const params =
    {
        name: name,
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        spacing: 0.02,
        type: "block",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { name: "set" },
            end:     { name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { value: new THREE.Vector3( 0, -100, 50 ) },
            diffuseColor:   { value: new THREE.Color( 0.2, 0, 0.2 ) },
            specularColor:  { value: new THREE.Color( 1, 1, 1 ) },
            time:           { value: 0 },
            duration:       { value: 1 },
            phase:          { value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].enhance( this.raycaster.Culling, raycaster );

    var blob = new Blob();
        blob.parent = this.props[ name ].group;
        blob.raycaster = this.props[ name ].raycaster;
        blob.init.call( this, params );

    return this.props[ name ];
};

export { prop, options };