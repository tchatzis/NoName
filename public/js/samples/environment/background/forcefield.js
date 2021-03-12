var options = null;

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.persistent
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new ForceField();    
    this.props[ name ].init.call( this, args );
    this.props[ name ].group.userData = { type: "background" };

    return this.props[ name ];
};

export { prop, options };
