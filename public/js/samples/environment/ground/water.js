var options = {};

var prop = function( name )
{
    const mirror =
    {
        type: "water",
        texture:
        {
            clipBias: 0.003,
            textureWidth: 512,
            textureHeight: 512
        },
        includes: { vertex: [ "noise" ] },
        uniforms:
        {
            tDiffuse:       { value: null },
            textureMatrix:  { value: new THREE.Matrix4() },
            reflection:     { value: 0.44 },
            time:           { value: 0 },
            alpha:          { value: 1 },
            scale:          { value: 16 },
            speed:          { value: 0.1 },
            waterColor:     { value: new THREE.Color( 0xd4f1f9 ) },
            amplitude:      { value: 1.2 },
            frequency:      { value: new THREE.Vector4( 0.24, 0.14, 0.21, 0.31 ) },
            mix:            { value: new THREE.Vector2( 1.27, 1.12 ) }
        }
    };

    const plane =
    {
        name: name,
        parent: this.stage.persistent,
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 0x666666 ),
        width: 100,
        height: 100,
        widthSegments: 100,
        heightSegments: 100,
        vertical: true
    };

    this.props[ name ] = new this.presets.Plane( plane );
    this.props[ name ].mesh.rotateX( -Math.PI / 2 );
    this.props[ name ].enhance( this.lipstick.Reflect, mirror );

    this.stage.camera.position.y = 0.1;

    this.props[ name ].animate = function()
    {
        this.arrays.persistent[ "ground" ].push( { name: name, object: this.props[ name ].mesh, path: "material.uniforms.time.value", value: 0.01 } );
    }.bind( this );

    this.props[ name ].animate();

    return this.props[ name ];
};

export { prop, options };