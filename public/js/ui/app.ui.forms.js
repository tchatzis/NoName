UI.forms =
{
    display:
    {
        createUser: function( success )
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
            var email = new UI.forms.Wrapper( form, "email" );
            var password = new UI.forms.Wrapper( form, "password" );
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

                    UI.forms.process.createUser( data, success, denied );
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
            var email = new UI.forms.Wrapper( form, "email" );
            var password = new UI.forms.Wrapper( form, "password" );
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
                    
                    UI.forms.process.login( data, denied );
                }, false );

            form.appendChild( button );

            return form;
        },
        logout: function()
        {
            var button = document.createElement( "input" );
                button.type = "button";
                button.value = "Sign Out";
                button.addEventListener( "click", UI.forms.process.logout, false );

            return button;
        }
    },

    process:
    {
        checkAuth: function()
        {
            this.ui.modal.innerHTML = null;

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
                    var form = UI.forms.display.login( success );
        
                    this.ui.modal.appendChild( form );
                }
            } );
        
            var success = function( user )
            {
                this.user = user;
    
                this.ui.modal.innerHTML = null;
                this.ui.modal.classList.add( "hide" );

                this.init();
            }.bind( this );
        },        
        createUser: function( data, success, denied )
        {
            firebase.auth().createUserWithEmailAndPassword( data.email, data.password )
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
    },

    Wrapper: function( form, type, value )
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
    }
};