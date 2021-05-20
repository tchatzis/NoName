import { Utilities } from './utilities.js';

function oninput()
{
    var event = new Event( "input" );
    //console.warn( this );
    this.dispatchEvent( event );
}

function handles()
{
    var handlers = {};

    this.handlers.forEach( type => handlers[ type.event ] = type.handler );

    return handlers;
}

function options( parent )
{
    this.options.forEach( option =>
    {
        var item = document.createElement( "option" );
            item.text = option.text;
            item.value = option.value;

        parent.appendChild( item );
    } );
}

// this is the hook for Table()
function table()
{
    if ( this.table )
    {
        this.table.get.columns().forEach( name =>
        {
            let field = this.table.get.field( this.index, name );
            this.table.next[ name ] = field.selected.value;
        } );
    }
}

function Value( value )
{
    this.value = value;
}

const Components = {};

// TODO: every component must have an "input" event when changing
// TODO: field.validate.row();
// TODO: table.call in this.update()

Object.defineProperty( Components, "input",
{
    enumerable: false,
    value: function()
    {
        var field = this;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.name );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "autocomplete", "off" );
        if ( field.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            field.selected.value = this.value;
            field.update( field.selected );
            field.validate();
            field.validate.row();
        }, false );

        Components[ field.type ] = this;

        this.update = ( option ) =>
        {
            this.element.value = option.value;
            this.selected = option;

            table.call( this );
        };

        this.update( this.value );
    }
} );

Object.assign( Components,
{
    button: Components.input,

    buttons: function()
    {
        var field = this;
        var data = new Set();
        var values = new Set();
        var toggle =
        {
            data: ( option ) =>
            {
                var value = option.text;

                if ( value && values.has( value ) )
                    data.add( option );
                else
                    data.delete( option );
            },

            values: ( value ) =>
            {
                if ( value && !values.has( value ) )
                    values.add( value );
                else
                    values.delete( value );
            }
        };

        this.required = true;

        this.element = document.createElement( "div" );
        this.element.setAttribute( "name", this.name );

        if ( this.settings.horizontal )
            this.element.classList.add( "formsxs" );

        this.render = () =>
        {
            this.element.innerHTML = null;

            field.options.forEach( option =>
            {
                var item = document.createElement( "div" );
                    item.innerText = option.text;
                    item.setAttribute( "data-text", option.text );
                    item.classList.add( "formlink" );
                    item.style.textAlign = "left";
                    item.addEventListener( "click", () =>
                    {
                        field.selected = option;
                        field.update( option );
                        oninput.call( field.element );
                    }, false );
                if ( option.disabled )
                    item.classList.add( "formdisabled" );

                option.element = item;
                this.element.appendChild( item );
            } );
        };

        this.update = ( option ) =>
        {
            if ( this.settings.multiple )
            {
                toggle.values( option.value );
                this.selected = Array.from( values );
            }
            else
                this.selected = option;

            state( option );
        };

        this.render();
        this.update( this.value );

        function select( value )
        {
            return field.options.find( option => option.value == value );
        }

        function state( option )
        {
            Array.from( field.element.children ).forEach( item =>
            {
                var name = item.getAttribute( "data-text" );
                var predicate = field.settings.multiple ? values.has( name ) : name == option.value;
                //var use = field.settings.multiple ? name : option.value;
                //var selected = select( use );

                if ( predicate )
                    item.classList.add( "formselected" );
                else
                    item.classList.remove( "formselected" );

                if ( field.settings.multiple )
                {
                    toggle.data( option );
                    field.selected = Utilities.copy( Array.from( data ) );
                }
                //else
                //    field.selected = selected;
            } );
        }
    },

    code: function()
    {
        var field = this;
        var css = "language-" + ( this.settings.type || "js" );

        this.element = document.createElement( "pre" );
        this.element.classList.add( css );
        this.element.setAttribute( "name", this.name );

        if ( this.source.hasOwnProperty( "url" ) )
        {
            this.source.url = this.source.url || "assets/forms/modules/sample.js";
            this.element.setAttribute( "data-src", this.source.url );
        }

        if ( this.settings.edit )
        {
            this.element.setAttribute( "contenteditable", this.settings.edit );

            this.element.addEventListener( "keyup", function()
            {
                field.selected.value = this.innerHTML;
                oninput.call( this );

                field.validate( field );
            }, false );
        }

        this.update = ( option ) =>
        {
            this.selected = option;
            this.element.innerHTML = option.value;

            Prism.highlightElement( this.element );
        };

        this.update( this.value );
    },

    color: function()
    {
        var field = this;

        var color = document.createElement( "div" );
            color.classList.add( "formcolor" );

        var input = document.createElement( "input" );
            input.setAttribute( "name", this.name );
            input.setAttribute( "type", "text" );
            input.setAttribute( "maxlength", 7 );
            input.setAttribute( "size", 4 );
            input.setAttribute( "spellcheck", false );
            input.setAttribute( "pattern", "^#([A-Fa-f0-9]{6})" );
            input.addEventListener( "input", function()
            {
                field.selected.value = this.value;
                field.update( field.selected );
                field.validate( field );
                oninput.call( field.element );
            }, false );

        this.element = document.createElement( "div" );
        this.element.classList.add( "formsxs" );
        this.element.appendChild( color );
        this.element.appendChild( input );

        this.update = ( option ) =>
        {
            this.selected = option;
            input.value = option.value;
            color.style.backgroundColor = option.value;
        };

        this.update( this.value );
    },

    combo: function()
    {
        var field = this;

        this.required = true;

        var input = document.createElement( "input" );
            input.setAttribute( "name", this.name );
            input.setAttribute( "type", "text" );
            input.setAttribute( "placeholder", this.name );
            input.setAttribute( "list", "" );
            input.setAttribute( "autocomplete", "off" );
            input.addEventListener( "click", () =>
            {
                items.classList.toggle( "hide" );
            }, false );
            input.addEventListener( "focus", function()
            {
                items.style.display = "block";

                for ( let option of items.options )
                {
                    option.onclick = function ()
                    {
                        field.update( this );
                        field.validate( field );
                        items.classList.add( "hide" );
                        clearTimeout( timeout );
                    }
                }

                items.style.width = this.offsetWidth + 'px';
                items.style.left = this.offsetLeft + 'px';
                items.style.top = this.offsetTop + this.offsetHeight + 'px';

                var timeout = setTimeout( () => items.classList.add( "hide" ), 5000 );
            }, false );
            input.addEventListener( "input", function()
            {
                field.update( { value: this.value } );
                field.validate( field );
            }, false );

        var items = document.createElement( "datalist" );
            items.innerHTML = null;
            items.classList.add( "hide" );

        this.element = document.createElement( "div" );
        this.element.classList.add( "formsxs" );
        this.element.appendChild( items );
        this.element.appendChild( input );

        this.update = ( option ) =>
        {
            input.value = option.value;
            this.selected = option;
        };

        this.update( this.value );

        options.call( this, items, field );
    },

    cycle: function()
    {
        var field = this;

        this.required = true;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formlink" );
        this.element.addEventListener( "click", function()
        {
            field.index = ( field.index + 1 ) % field.options.length;

            let option = field.options[ field.index ];

            field.update( option );
        } );

        this.update = ( option ) =>
        {
            this.index = this.options.findIndex( o => ( option.text == o.value || option.value == o.value ) );
            this.index = this.index < 0 ? 0 : this.index;

            let opt = this.options[ this.index ];

            this.element.innerText = opt.text;
            this.value = opt;
        };

        this.update( this.value );
    },

    date: Components.input,

    email: Components.input,

    hidden: Components.input,

    label: function()
    {
        this.required = false;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formspan" );

        this.update = ( option ) =>
        {
            this.element.innerText = option.value;
            oninput.call( this.element );
        };

        this.update( this.value );
    },

    match: function()
    {
        var field = this;
        var handlers = handles.call( this );
        
        this.element = document.createElement( "div" );
        this.element.classList.add( "formsxs" );

        var input = document.createElement( "input" );
            input.setAttribute( "name", this.name );
            input.setAttribute( "placeholder", this.value.value );
            input.setAttribute( "type", "text" );
            input.setAttribute( "value", "" );
            input.setAttribute( "autocomplete", "off" );
            if ( this.type == "readonly" )
                input.setAttribute( "readonly", "" );
            input.addEventListener( "input", function()
            {
                field.update( new Value( this.value ) );
                oninput.call( field.element );
            }, false );

        this.element.appendChild( input );

        var button = document.createElement( "div" );
            button.classList.add( "formbutton" );
            button.innerText = this.settings.icon || String.fromCodePoint( 8680 );
            button.addEventListener( "click", () => handlers.click( this ), false );

        this.element.appendChild( button );

        this.update = ( option ) =>
        {
            field.selected = option;

            var valid = field.validate( field );

            if ( valid )
            {
                button.classList.remove( "formdisabled" );
            }
            else
            {
                button.classList.add( "formdisabled" );
            }
        };
    },

    number: function()
    {
        var field = this;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", this.type );
        if ( this.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            field.update( { value: Number( this.value ) } );
            field.validate( field );
        }, false );

        this.update( this.value );
    },

    object: function()
    {
        var field = this;
        var components = {};

        this.element = document.createElement( "div" );

        if ( this.value.type() == "object" )
        {
            let keys = this.value.keys();
                keys.forEach( key =>
                {
                    var label = document.createElement( "div" );
                        label.classList.add( "formkey" );
                        label.innerText = key;
                    var input = document.createElement( "input" );
                        input.setAttribute( "name", key );
                        input.setAttribute( "type", "text" );
                        input.setAttribute( "size", "8" );
                        input.addEventListener( "input", function()
                        {
                            field.selected.value[ key ] = this.value;
                            field.validate( field );
                            oninput.call( field.element );
                        }, false );

                    components[ key ] = input;
                    this.element.appendChild( label );
                    this.element.appendChild( input );
                } );

            this.update = ( option ) =>
            {
                keys.forEach( key =>
                {
                    this.selected.value[ key ] = option.value[ key ];
                    components[ key ].value = option.value[ key ];
                } );
            };

            this.update( this.value );
        }
    },

    password: Components.input,

    preview: function()
    {
        var field = this;

        this.element = document.createElement( "pre" );
        this.element.classList.add( "form-preview" );
        this.element.setAttribute( "name", this.name );

        if ( this.settings.edit )
        {
            this.element.setAttribute( "contenteditable", this.settings.edit );

            this.element.addEventListener( "keyup", function()
            {
                field.selected.value = this.innerText;
                oninput.call( this );

                field.validate( field );
            }, false );
        }

        this.update = ( option ) =>
        {
            this.selected = option;
            this.element.innerText = this.settings.stringify ? JSON.stringify( option.value ) : option.value;
        };

        this.update( this.value );
    },

    range: Components.input,

    readonly: Components.input,

    select: function()
    {
        var field = this;

        this.required = true;

        this.element = document.createElement( "select" );
        this.element.innerHTML = null;
        this.element.setAttribute( "name", this.name );
        this.element.addEventListener( "change", function()
        {
            var option = field.options[ field.element.selectedIndex || 0 ];

            field.update( option );
            field.validate( field );
            oninput.call( this );
        }, false );

        this.update = ( option ) =>
        {
            var index = field.options.findIndex( item => item.equals( option ) );
                index = index < 0 ? 0 : index;

            option = option || field.options[ index ];

            this.selected = option;

            field.element.selectedIndex = index;
        };

        options.call( this, this.element );

        this.update( this.value );
    },

    separator: function()
    {
        this.required = false;

        this.element = document.createElement( "div" );
        this.element.classList.add( "table-separator" );
        this.element.style.borderLeft = `${ this.settings.width || 1 }px ${ this.settings.line || "solid" } ${ this.settings.color || "#333" }`;
    },
    
    submit: function()
    {
        var field = this;
        var handlers = handles.call( this );

        this.required = false;

        this.update = () =>
        {
            var valid = this.validate.row( this );
            var array = [];
            var object = {};

            if ( valid )
            {
                for ( let col in field.row )
                {
                    let obj = field.row[ col ];

                    if ( obj.field && obj.field.required )
                    {
                        array.push( obj.field.value );
                        object[ obj.field.name ] = obj.field.value.value;
                    }
                }

                if ( handlers.click )
                    handlers.click( { array: array, object: object, field: field } );

                this.element.setAttribute( "disabled", "" );
            }
        };

        this.element = document.createElement( "input" );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "value", this.value.value );
        this.element.addEventListener( "click", field.update, false );

        this.reset = () => this.element.removeAttribute( "disabled" );

        this.update();
    },

    tel: Components.input,

    text: Components.input,

    time: Components.input,

    toggle: function()
    {
        var field = this;
        var index = field.options.findIndex( item => item.equals( this.value ) );

        this.required = true;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formlink" );
        this.element.addEventListener( "click", function()
        {
            field.update( field.options[ index ] );
            oninput.call( this );
        } );

        this.update = ( option ) =>
        {
            this.selected = option || field.options[ index ];
            this.element.innerText = option.text;

            index = 1 - index;
        };

        this.update( this.value );
    },

    tree: function()
    {
        var field = this;

        this.required = true;

        // element
        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "hidden" );
        //this.element.setAttribute( "value", this.value );

        // handlers
        var handlers = handles.call( this );

        // items
        var items = document.createElement( "div" );
            items.innerHTML = null;
            //items.setAttribute( "data-name", this.name );

        // private functions
        function add( args )
        {
            args.field = field;

            if ( handlers.add )
                handlers.add( args );
        }

        function click( args )
        {
            var value = args.value;

            field.update( value );
            // TODO: field.selected ( option )

            state( args.element, value );
            oninput.call( args.element );

            if ( handlers.click )
                handlers.click( args );
        }

        function show( item )
        {
            item.classList.toggle( "hide" );
        }

        function state( label, value )
        {
            var spans = items.querySelectorAll( "span" );
                spans.forEach( span => span.classList.remove( "formselected" ) );

            if ( field.value == value )
                label.classList.add( "formselected" );
        }

        function toggle( args )
        {
            var children = args.element.querySelectorAll( "ul" );
                children.forEach( child =>
                {
                    if ( child.getAttribute( "data-parent" ) == args.value )
                    {
                        child.classList.toggle( "hide" );
                        this.innerText = child.classList.contains( "hide" ) ? "+" : "-";
                    }
                } );

            //if ( handlers.toggle )
            //    handlers.toggle( args );
        }

        // public methods
        this.render = () =>
        {
            var i = 0;
            var root = this.source.data.find( obj => !obj.parent );

            // clear the element
            items.innerHTML = null;

            // start the iteration
            if ( root )
            {
                let args =
                {
                    data: root,
                    parent: items,
                    breadcrumbs: [],
                    expand: root.expand
                };

                traverse( args );
            }

            function traverse( args )
            {
                var data = args.data;
                var value = data[ field.source.key ];
                var parent = args.parent;
                var breadcrumbs = [ ...args.breadcrumbs, value ];
                var level = args.level || 0;
                var index = args.index || 0;
                var _i = i;

                // elements
                var icon = document.createElement( "div" );
                    icon.innerText = String.fromCodePoint( 8627 );
                    icon.classList.add( "formswitch" );
                    icon.setAttribute( "data-value", value );
                var label = document.createElement( "span" );
                    label.innerText = value;
                    label.classList.add( data.visible );
                    label.addEventListener( "click", ( e ) =>
                    {
                        e.stopPropagation();
                        click( { breadcrumbs: breadcrumbs, data: data, element: e.target, value: value } );
                    }, false );
                var item = document.createElement( "li" );
                    item.classList.add( "formitem" );
                    item.setAttribute( "data-index", _i );
                    item.setAttribute( "data-child", index );
                    item.setAttribute( "data-value", value );
                    item.appendChild( icon );
                    item.appendChild( label );
                var ul = items.querySelector( `[ data-parent = "${ data.parent }" ]` ) || document.createElement( "ul" );
                    ul.setAttribute( "data-parent", data.parent );
                    ul.appendChild( item );

                // toggle
                if ( data.hasOwnProperty( "children" ) )
                {
                    let args =
                    {
                        breadcrumbs: breadcrumbs,
                        data: data,
                        element: ul,
                        value: value
                    };

                    icon.addEventListener( "click", () => toggle.call( icon, args ), false );
                }
                else
                {
                    icon.style.pointerEvents = "none";
                    icon.style.border = "1px solid transparent";
                }

                // add field
                if ( handlers.add )
                {
                    // new child ( toggled )
                    let li = document.createElement( "li" );
                        li.classList.add( "formadd" );
                        li.classList.add( "hide" );
                    let icon = document.createElement( "div" );
                        icon.innerText = String.fromCodePoint( 8627 );
                        icon.classList.add( "formswitch" );
                        icon.style.pointerEvents = "none";
                        icon.style.border = "1px solid transparent";
                    let input = document.createElement( "input" );
                        input.setAttribute( "size", 10 );
                        input.setAttribute( "name", value );
                        input.setAttribute( "type", "text" );
                        input.setAttribute( "placeholder", `add child to ${ value }` );
                    let action = document.createElement( "div" );
                        action.innerText = "+";
                        action.classList.add( "formbutton" );
                        action.setAttribute( "title", `add child to ${ value }` );
                        action.addEventListener( "click", () =>
                        {
                            field.update( input.value );

                            var args =
                            {
                                breadcrumbs: breadcrumbs,
                                data: data,
                                element: action,
                                value: input.value
                            };

                            add( args );
                        }, false  );

                    li.appendChild( icon );
                    li.appendChild( input );
                    li.appendChild( action );
                    ul.appendChild( li );

                    // add child button ( showing )
                    let button = document.createElement( "div" );
                        button.innerText = String.fromCodePoint( 8628 );
                        button.classList.add( "formbutton" );
                        button.setAttribute( "title", `add child to ${ value }` );
                        button.addEventListener( "click", () => show( li, ul, value ), false );

                    item.appendChild( button );
                }

                if ( !data.expand )
                    ul.classList.add( "hide" );

                if ( args.expand || !ul.getAttribute( "data-parent" ) )
                    ul.classList.remove( "hide" );

                state( label, value );

                parent.appendChild( ul );

                level++;
                i++;

                // reiterate
                if ( data.hasOwnProperty( "children" ) )
                {
                    icon.innerText = data.expand ? "-" : "+";

                    data.children.forEach( ( child, index ) =>
                    {
                        var args =
                        {
                            data: child,
                            parent: ul,
                            breadcrumbs: breadcrumbs,
                            expand: data.expand,
                            level: level,
                            index: index
                        };

                        traverse( args );
                    } );
                }
            }
        };

        this.state = ( value ) =>
        {
            var item = items.querySelector( `[ data-value = "${ value }" ]` );

            if ( item )
            {
                let label = item.querySelector( "span" );

                state( label, value );
            }
        };

        this.render();
    },
    
    underscore: function()
    {        
        this.required = false;

        this.element = document.createElement( "div" );
        this.element.classList.add( "table-underline" );
        this.element.style.borderBottom = `${ this.settings.width || 1 }px ${ this.settings.line || "solid" } ${ this.settings.color || "#333" }`;
    },

    url: Components.input,

    vector: function()
    {
        var field = this;
        var components = {};

        this.element = document.createElement( "div" );

        if ( this.value.type() == "object" )
        {
            let keys = this.value.keys();
                keys.forEach( key =>
                {
                    var label = document.createElement( "div" );
                        label.classList.add( "formkey" );
                        label.innerText = key;
                    var input = document.createElement( "input" );
                        input.setAttribute( "name", key );
                        input.setAttribute( "type", "number" );
                        input.addEventListener( "input", function()
                        {
                            field.selected.value[ key ] = Number( this.value );
                            field.validate( field );
                            oninput.call( field.element );
                        }, false );

                    components[ key ] = input;
                    this.element.appendChild( label );
                    this.element.appendChild( input );
                } );

            this.update = ( option ) =>
            {
                keys.forEach( key =>
                {
                    this.selected.value[ key ] = option.value[ key ];
                    components[ key ].value = option.value[ key ];
                } );
            };

            this.update( this.value );
        }
    }
} );

export { Components };