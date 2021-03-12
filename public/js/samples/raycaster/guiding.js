var options = {};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        this.props[ name ].clear();

        option.parent = this.props[ name ].group;
        option.name = key;


        
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };