var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 2,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 )
    };

    const callback = function()
    {
        const args =
        {
            name: name,
            from: 0,
            to: 4,
            time: 3,
            attribute: "position.y",
            onLerpComplete: () => this.props[ name ].kill()
        };

        this.props[ name ].enhance( this.path.Lerp, args );
    }.bind( this );

    const lerp =
    {
        name: name,
        from: -10,
        to: 8,
        time: 5,
        attribute: "position.x",
        onLerpComplete: callback
    };

    const args =
    {
        name: name,
        from: this.stage.camera
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.path.Lerp, lerp );
    this.props[ name ].enhance( this.lipstick.LookAt, args );

    return this.props[ name ];
};

export { prop, options };