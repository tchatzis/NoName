const UI = function()
{
    var scope = "ui";
    var app = this;
        app[ scope ] = {};

    var elements = function()
    {
        return {
            modal:
            {
                el: document.getElementById( "modal" )
            },
            modal_progress:
            {
                el: document.getElementById( "modal_progress" )
            },
            hud:
            {
                el: document.createElement( "div" ),
                cl: [ "hud" ],
                parent: document.body
            },
            debug:
            {
                el: document.createElement( "div" ),
                cl: [ "debug" ],
                parent: "hud"
            },
            widget:
            {
                el: document.createElement( "div" ),
                cl: [ "widget", "hide" ],
                parent: document.body
            },
            container:
            {
                el: document.createElement( "div" ),
                cl: [ "container" ],
                parent: document.body
            },
            /*dropdown:
            {
                el: document.createElement( "div" ),
                cl: [ "dropdown" ],
                parent: document.body
            },*/
            raycasting:
            {
                el: document.createElement( "div" ),
                cl: [ "raycasting" ],
                parent: document.body
            },
            navigation:
            {
                el: document.createElement( "div" ),
                cl: [ "navigation" ],
                parent: document.body
            }
        }
    };

    // toolbar ( container ) button constructor
    function button( data )
    {
        var code = String.fromCodePoint( data.icon );
        //var string = data.icon.charCodeAt( 0 );

        console.log( data.icon, code );

        var button = document.createElement( "div" );
            button.classList.add( "toolbar" );
            button.innerText = String.fromCodePoint( data.icon );
            button.title = data.title;
            button.addEventListener( "click", function()
            {
                var bbox = this.getBoundingClientRect();

                data.action( bbox.left, data.params );
            } );

        return button;
    }

    app[ scope ].drop = function( left, content )
    {
        app[ scope ].dropdown.style.left = left + "px";
        app[ scope ].dropdown.classList.toggle( "expand" );
        app[ scope ].dropdown.appendChild( content );
    };
    
    app[ scope ].toolbar =
    {
        append: ( data ) => app[ scope ].container.appendChild( button( data ) ),
        prepend: ( data ) => app[ scope ].container.prepend( button( data ) )
    };

    app[ scope ].row = function( data )
    {
        var id = data.id + "_row";
        var row = document.getElementById( id ) || document.createElement( "div" );
            row.id = id;
            row.classList.add( "row" );
            row.appendChild( data.el );

        data.parent.appendChild( row );

        app[ scope ][ id ] = { el: row, cl: data.cl, parent: data.parent };

        return app[ scope ][ id ];
    };

    var render = function()
    {
        var data;
        var array = elements();

        for ( var element in array )
        {    
            if ( array.hasOwnProperty( element ) )
            {
                data = array[ element ];
                data.id = element;
                
                if ( data.parent )
                {
                    data.cl.forEach( cl =>
                    {
                        data.el.id = element;
                        data.el.classList.add( cl );
                    } );

                    switch ( typeof data.parent )
                    {
                        case "string":
                            data.parent = document.getElementById( data.parent );
                            app[ scope ][ element ] = data.el;
                            data.row = app[ scope ].row( data );
                        break;

                        case "object":
                            data.parent.appendChild( data.el );
                            app[ scope ][ element ] = data.el;
                        break;
                    }
                }
                else
                {
                    // skip appending - element was already coded
                    app[ scope ][ element ] = data.el;
                }
            }
        }
    };

    render();
};