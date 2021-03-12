var options = {};

var prop = function( name )
{
    const mirror =
    {
        type: "mirror",
        texture:
        {
            clipBias: 0.003,
            textureWidth: 512,
            textureHeight: 512
        },
        uniforms:
        {
            tDiffuse: { value: null },
            color: { value: new THREE.Color( 0x666666 ) },
            textureMatrix: { value: new THREE.Matrix4() }
        }
    };

    const plane =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 0x666666 ),
        width: 100,
        height: 100,
        widthSegments: 1,
        heightSegments: 1,
        vertical: true
    };

    this.props[ name ] = new this.presets.Plane( plane );
    this.props[ name ].mesh.rotateX( -Math.PI / 2 );
    this.props[ name ].enhance( this.lipstick.Reflect, mirror );

    return this.props[ name ];
};

export { prop, options };