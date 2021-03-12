var options = {};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );

    this.ui.modal.innerHTML = null;
    this.ui.modal.classList.remove( "hide" );

    var key = "value";
    var path = "test";
    var form = new DB.Forms();
        form.init.call( this, this.ui.modal, "CRUD" );
        form.field.add.call( this, key, path );
        form.list.edit.call( this, key, path );
        //form.list.items.call( this, key, path, ( args ) => console.log( args ) );
        //form.list.select.call( this, key, path, ( args ) => console.log( args ) );

    return this.props[ name ];
};

export { prop, options };