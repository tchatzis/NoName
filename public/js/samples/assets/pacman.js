var options = {};

var prop = function( name )
{
    const option =
    {
        type: "pacman",
        width:
        {
            segments: 16,
            axis: "y"
        },
        height:
        {
            segments: 16,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 0.875, 0.5 ],
            scale: { x: 5, y: 5, z: 5 },
            center: "axes"
        },
        animate:
        {
            frames: { count: Infinity, time: 0.1 },
            keys:
            {
                angle: [ 1, 0.5 ]
            },
            cycle: "sin",
            speed: 10
        }
    };

    const args =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3(),
        rotation: new THREE.Vector3(),
        debug: false,
        wireframe: false,
        flatShading: false,
        color: new THREE.Color( 1, 1, 0 ),
        params: option
    };

    this.props[ name ] = new Geometry();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };