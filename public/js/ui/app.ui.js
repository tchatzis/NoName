const UI = function()
{
    var scope = "ui";
    var app = this;
        app[ scope ] = {};

    var listen = function()
    {
        app[ scope ].container.classList.add( "expand" );

        [ "container" ].forEach( div =>
        {
            app[ scope ][ div ].addEventListener( "mouseover", () =>
            {
                app[ scope ][ div ].classList.add( "expand" );
            } );

            app[ scope ][ div ].addEventListener( "mouseout", () =>
            {
                app[ scope ][ div ].classList.remove( "expand" );
            } );
        } );
    };

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
            raycasting:
            {
                el: document.createElement( "div" ),
                cl: [ "raycasting" ],
                parent: document.body
            },
            logout:
            {
                el: UI.forms.display.logout(),
                cl: [],
                parent: "container"
            },
            debug:
            {
                el: document.createElement( "div" ),
                cl: [ "debug" ],
                parent: "container"
            },
            submenu:
            {
                el: document.createElement( "div" ),
                cl: [ "submenu" ],
                parent: "container"
            },
            navigation: 
            {
                el: document.createElement( "div" ),
                cl: [ "navigation" ],
                parent: document.body
            }
        }
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
    listen();
};