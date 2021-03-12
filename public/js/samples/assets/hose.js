var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        remove: true,
        iterations: 128,
        sides: 7,
        radius: 1,
        cycles: { x: 2.4, y: 3.17 },
        max: { x: 6, y: 4 },
        offset: { x: 0, y: 0, z: 2 },
        velocity: { x: 0, y: 0, z: 2 },
        mode: "tube",
        changing: false,
        mapping: [ "hexagons", "circles", "earthly", "graph", "lightning", "mosaic", "qbert", "radial", "sphere" ],
        bumping: this.assets.displacements[ "lightning" ].texture,
        coloring: false,
        helpers:
        {
            points: false,
            correct: false,
            incorrect: false
        }
    };

    this.props[ name ] = new Hose();
    this.props[ name ].init.call( this, args );
    this.listeners.add( window, { type: "keyup", value: "h", function: this.props[ name ].toggle } );

    return this.props[ name ];
};

export { prop, options };