export default function()
{
    var scope = this;
    var firebase = window.firebase;
    
    this.display =
    {
        authenticate: ( args ) => this.process.authenticate( args ),
        create: function( success )
        {
            var denied = function( error )
            {
                message.innerText = error.code;
            };

            var message = document.createElement( "div" );
                message.innerText = "Please log in";
            var form = document.createElement( "div" );
                form.classList.add( "form" );
                form.appendChild( message );
            var email = new Wrapper( form, "email" );
            var password = new Wrapper( form, "password" );
            var button = document.createElement( "input" );
                button.type = "button";
                button.value = "Create";
                button.addEventListener( "click", () =>
                {
                    var data =
                    {
                        email: email.input.value,
                        password: password.input.value
                    };

                    scope.process.create( data, success, denied );
                }, false );

            form.appendChild( button );

            return form;
        },
        login: function()
        {
            var denied = function( error )
            {
                message.innerText = error.code;
            };

            var message = document.createElement( "div" );
                message.innerText = "Please log in";
            var form = document.createElement( "div" );
                form.classList.add( "form" );
                form.appendChild( message );
            var email = new Wrapper( form, "email" );
            var password = new Wrapper( form, "password" );
            var button = document.createElement( "input" );
                button.type = "button";
                button.value = "Sign In";
                button.addEventListener( "click", () =>
                {
                    var data =
                    {
                        email: email.input.value,
                        password: password.input.value
                    };

                    scope.process.login( data, denied );
                }, false );

            form.appendChild( button );

            return form;
        },
        logout: function()
        {
            var button = document.createElement( "input" );
                button.type = "button";
                button.value = "Sign Out";
                button.addEventListener( "click", scope.process.logout, false );

            return button;
        }
    };

    this.process =
    {
        authenticate: function( args )
        {
            args.parent.innerHTML = null;

            firebase.auth().onAuthStateChanged( auth =>
            {
                if ( auth )
                {
                    let user =
                    {
                        id: auth.uid,
                        name: auth.displayName,
                        token: auth.refreshToken
                    };

                    success( user );
                }
                else
                {
                    var form = scope.display.login( success );

                    args.parent.appendChild( form );
                }
            } );

            var success = function( user )
            {
                args.parent.innerHTML = null;
                args.parent.classList.add( "hide" );

                app.user = user;
                app.init();
                app.ui.toolbar.append( { icon: 128274, title: "Sign Out", action: scope.process.logout } );
            };
        },
        create: function( data, success, denied )
        {
            firebase.auth().createWithEmailAndPassword( data.email, data.password )
                /*.then( ( userCredential ) =>
                {
                    var user =
                    {
                        id: userCredential.user.uid,
                        name: userCredential.user.displayName,
                        token: userCredential.user.refreshToken
                    }

                    success( user );
                } )*/
                .catch( denied );
        },
        login: function( data, denied )
        {
            firebase.auth().signInWithEmailAndPassword( data.email, data.password )
                .catch( denied );
        },
        logout: function()
        {
            firebase.auth().signOut();
            window.location.reload();
        }
    };

    const Wrapper = function( form, type, value )
    {
        this.input = document.createElement( "input" );
        this.input.type = type;
        this.input.value = value || "";

        var heading = document.createElement( "div" );
            heading.classList.add( "formheading" );
            heading.innerText = type;

        var div = document.createElement( "div" );
            div.classList.add( "formelement" );
            div.appendChild( heading );
            div.appendChild( this.input );

        form.appendChild( div );
    };
};