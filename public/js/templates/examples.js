examples[ "Sky" ] = function( params )
{
    const args =
    {
        name: params.name,
        parent: this.stage.scene
    };

    this.props[ params.name ] = new Sky();
    this.props[ params.name ].init.call( this, args );
};
