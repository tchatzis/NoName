var options = {};

var prop = function( name )
{
    const sphere =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        radius: 4,
        widthSegments: 32,
        heightSegments: 16,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI
    };

    const sprites =
    {
        name: name,
        app: this,
        sprite:
        {
            name: "blue",
            debug: false,
            alpha: 0.7,
            size: 0.3,
            stops:
            [
                [ 0.0, 'rgba(0,255,255,1)' ],
                [ 0.2, 'rgba(0,127,255,1)' ],
                [ 0.3, 'rgba(0,127,63,1)' ],
                [ 0.8, 'transparent' ]
            ]
        }
    };

    this.props[ name ] = new this.presets.Sphere( sphere );
    this.props[ name ].enhance( this.lipstick.Sprites, sprites );

    return this.props[ name ];
};

export { prop, options };