var options = {};

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.props,
        orientation:
        {
            axes: [ "Z" ],
            amount: 0.25
        }
    };

    this.props[ name ] = new Planets();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };