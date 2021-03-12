var options = {};

var prop = function( name )
{
    const sphere =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        radius: 4,
        widthSegments: 128,
        heightSegments: 64,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI
    };

    const planet =
    {
        name: name,
        color: new THREE.Color( 0.6, 0.55, 0.5 ),
        position: new THREE.Vector3(),
        rotation:
        {
            attribute: "rotation.y",
            value: -0.02
        },
        tilt: 0,
        texture: this.assets.textures[ "mars" ],
        displacement:
        {
            scale: 0.2,
            bias: 0
        },
        orbit:
        {
            type: "ellipse",
            a: 4,
            b: 2,
            speed: 2,
            target: null,
            orientation: { axis: "rotateX", value: Math.PI * Math.random() * 0.3 }
        }
    };

    this.props[ name ] = new this.presets.Sphere( sphere );
    this.props[ name ].enhance( this.lipstick.Planet, planet );

    return this.props[ name ];
};

export { prop, options };