var options = {};
    options.apollonian =
    {
        name: "apollonian",
        width: 512,
        height: 512,
        max: 200,
        min: 10,
        debug: false,
        color: [ 0, 255, 255 ]
    };

    options.circles =
    {
        name: "circles",
        width: 512,
        height: 512,
        min: 64,
        debug: false,
        color: [ 255, 128, 0 ]
    };

    options.hilbert =
    {
        name: "hilbert",
        width: 512,
        height: 512,
        iterations: 16,
        dot: 8,
        line: 4,
        debug: false,
        color: [ 255, 128, 0 ]
    };

    options.mandlebrot =
    {
        name: "mandlebrot",
        zoom: 16,
        iterations: 64,
        width: 512,
        height: 512,
        debug: false,
        pan:
        {
            x: -0.74,
            y: 0.186
        },
        hue: 30,
        saturation: 100,
        luminosity: 50,
        pixel: 1
    };

    options.julia =
    {
        name: "julia",
        iterations: 128,
        width: 512,
        height: 512,
        debug: false,
        scale:
        {
            r: 0.5,
            i: 1
        },
        constants:
        {
            r: -0.05,
            i: 0.67
        },
        pixel: 1
    };
    
    options.sierpinski =
    {
        name: "sierpinski",
        type: "rect", // dot, rect
        iterations: 2,
        divisions: 3,
        width: 512,
        height: 512,
        debug: false,
        color: [ 255, 255, 255 ]
    };

    options.triangles =
    {
        name: "triangles",
        iterations: 6,
        width: 512,
        height: 512,
        debug: false,
        color: [ 0, 128, 255 ]
    };

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option )
    {
        const args =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            width: 4,
            height: 4,
            widthSegments: 1,
            heightSegments: 1,
            vertical: true
        };

        var plane = new this.presets.Plane( args );
            plane.enhance( this.fractal[ option.name ], option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };