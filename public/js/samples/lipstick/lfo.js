var options = {};

var prop = function( name )
{
    options.light =
    {
        target: this.stage.lights[ "blue" ],
        direction: 1,
        attributes: [ { attribute: "distance", scale: 1, offset: 0 } ],
        hz: 0.1,
        amplitude: 5,
        absolute: true
    };

    options.position =
    {
        direction: 1,
        attributes: [ { attribute: "position.y", scale: 1, offset: 0 } ],
        hz: 0.1,
        amplitude: 5,
        absolute: false
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.stage.props;
        option.name = key;

        this.stage.lights[ "blue" ].visible = key === "light";

        const plane =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3( 0, 0, 0 ),
            width: 10,
            height: 10,
            widthSegments: 1,
            heightSegments: 1
        };

        var floor = new this.presets.Plane( plane );

        switch( key )
        {
            case "light":
                this.stage.lights[ "blue" ].intensity = 30;
                this.stage.lights[ "blue" ].position.set( 0, 1, 0 );

                floor.add();

                this.utils.LFO( option );
            break;

            case "position":
                floor.enhance( this.lipstick.LFO, option );
            break;
        }
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };