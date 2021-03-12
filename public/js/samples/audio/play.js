var options = sounds;

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
        this.audio.init( option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };