var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 1,
        segments: 4,
        position: new THREE.Vector3( 0, 0, 0 )
    };

    const raycaster =
    {
        name: name,
        parent: this.stage.props,
        debug: true,
        far: 30
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.raycaster.Tracking, raycaster );

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
            color:   { name: "random", value: { min: 0x666666, max: 0xFFFFFF } },
            start:   { name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            end:     { name: "set" },
            opaque:  { name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { value: new THREE.Vector3( 0, -100, 50 ) },
            diffuseColor:   { value: new THREE.Color( 0.2, 0, 0.2 ) },
            specularColor:  { value: new THREE.Color( 1, 1, 1 ) },
            time:           { value: 0 },
            duration:       { value: 1 },
            phase:          { value: 0 } // -1: no movement, 0: start, 1: end
        }
    };

    var blob = new Blob();
        blob.parent = this.props[ name ].group;
        blob.raycaster = this.props[ name ].raycaster;
        blob.init.call( this, params );

    return this.props[ name ];
};

export { prop, options };