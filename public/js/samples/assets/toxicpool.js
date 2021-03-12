var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        scale: 1
    };

    this.props[ name ] = new ToxicPool();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };