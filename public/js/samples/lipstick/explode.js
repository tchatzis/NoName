var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        app: this,
        near: 0,
        far: 100,
        time: 10,
        implode: true,
        explode: true,
        delay: 3
    };

    const sphere =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        radius: 4,
        widthSegments: 16,
        heightSegments: 16,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI
    };

    const sprites =
    {
        name: "sprites",
        app: this,
        sprite:
        {
            name: "purple",
            debug: false,
            alpha: 0.7,
            size: 0.3,
            stops:
            [
                [ 0.0, 'rgba(255,255,0,1)' ],
                [ 0.2, 'rgba(255,0,255,1)' ],
                [ 0.3, 'rgba(127,0,127,1)' ],
                [ 0.8, 'transparent' ]
            ]
        }
    };

    this.props[ name ] = new this.presets.Sphere( sphere );
    this.props[ name ].enhance( this.lipstick.Sprites, sprites );
    this.props[ name ].enhance( this.lipstick.Explode, args );

    return this.props[ name ];
};

export { prop, options };