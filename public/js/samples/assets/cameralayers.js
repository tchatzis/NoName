var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new CameraLayers();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };