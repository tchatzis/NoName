export default function()
{
    var scope = this;
    var elements = function()
    {
        return {
            modal:
            {
                el: document.getElementById( "modal" )
            },
            modal_label:
            {
                el: document.getElementById( "modal_label" )
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

        // TODO: icon data
        console.log( data.icon, code );

        var button = document.createElement( "div" );
            button.classList.add( "toolbar" );
            button.innerText = String.fromCodePoint( data.icon );
            button.title = data.title;
            button.addEventListener( "click", function()
            {
                var bbox = scope.getBoundingClientRect();

                data.action( bbox.left, data.params );
            } );

        return button;
    }

    /*scope.drop = function( left, content )
    {
        scope.dropdown.style.left = left + "px";
        scope.dropdown.classList.toggle( "expand" );
        scope.dropdown.appendChild( content );
    };*/
    
    scope.toolbar =
    {
        append: ( data ) => scope.container.appendChild( button( data ) ),
        prepend: ( data ) => scope.container.prepend( button( data ) )
    };

    scope.row = function( data )
    {
        var id = data.id + "_row";
        var row = document.getElementById( id ) || document.createElement( "div" );
            row.id = id;
            row.classList.add( "row" );
            row.appendChild( data.el );

        data.parent.appendChild( row );

        scope[ id ] = { el: row, cl: data.cl, parent: data.parent };

        return scope[ id ];
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
                            scope[ element ] = data.el;
                            data.row = scope.row( data );
                        break;

                        case "object":
                            data.parent.appendChild( data.el );
                            scope[ element ] = data.el;
                        break;
                    }
                }
                else
                {
                    // skip appending - element was already coded
                    scope[ element ] = data.el;
                }
            }
        }
    };

    render();
};