var options = {};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );

    function modal( element )
    {
        this.ui.modal.innerHTML = null;
        this.ui.modal.classList.remove( "hide" );
        this.ui.modal.appendChild( element );
    }

    var loader = document.createElement( "div" );
        loader.id = "loader";
        loader.innerText = "Loading...";

    var form = document.createElement( "div" );
        form.style.pointerEvents = "auto";
        form.classList.add( "form" );
        form.id = "firebaseui-auth-container";
        form.appendChild( loader );

    modal.call( this, form );

    var config =
    {
        callbacks:
        {
            signInSuccessWithAuthResult: function( authResult, redirectUrl )
            {
                console.log(  authResult, redirectUrl  );
            },
            uiShown: function()
            {
                loader.style.display = 'none';
            },
        },
        signInOptions:
        [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
    };

    var ui = new firebaseui.auth.AuthUI( firebase.auth() );
        ui.start( '#firebaseui-auth-container', config );

    return this.props[ name ];
};

export { prop, options };