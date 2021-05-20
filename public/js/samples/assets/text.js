var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        message: "QT 3D",
        font: this.data.assets.fonts[ "Arial_Regular" ].font,
        geometry:
        {
            size: 8,
            height: 2,
            curveSegments: 16,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 1
        }
    };

    this.props[ name ] = new Text();
    this.props[ name ].init.call( this, args );

    this.stage.lights[ "blue" ].position.set( -1, 5, -1 );
    this.stage.lights[ "blue" ].visible = true;
    this.stage.lights[ "blue" ].intensity = 20;
    this.stage.lights[ "blue" ].distance = 0;

    this.data.arrays.animations.push( { name: name, object: this.props[ name ].group, path: "rotation.y", value: -0.01 } );

    return this.props[ name ];
};

export { prop, options };