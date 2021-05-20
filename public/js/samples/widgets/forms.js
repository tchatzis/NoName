var options = {};

var prop = function( name )
{
    var forms = new QT.Forms();
        forms.init.call( this, { name: name, parent: app.ui.modal } );
};

export { prop, options };