import { Utils } from './form.utils.js';

function handles()
{
    var handlers = {};

    this.handlers.forEach( type => handlers[ type.event ] = type.handler );

    return handlers;
}

export const Components =
{
    bind: function()
    {
        //TODO: like submit, but it is tied to the value of the previous field
    },

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
        this.element.setAttribute( "id", field.id );
        this.element.setAttribute( "name", this.name );

        if ( this.horizontal )
            this.element.classList.add( "formsxs" );

        this.parent.appendChild( this.element );

        this.render = () =>
        {
            this.element.innerHTML = null;

            this.options.forEach( option =>
            {
                var item = document.createElement( "div" );
                    item.innerText = option.text;
                    item.setAttribute( "data-text", option.text );
                    item.classList.add( "formlink" );
                    item.style.textAlign = "left";
                    item.addEventListener( "click", () => field.update( option.text ), false );
                if ( option.disabled )
                    item.classList.add( "formdisabled" );
                if ( option.selected )
                    item.classList.add( "formselected" );

                option.element = item;
                this.element.appendChild( item );
            } );
        };

        this.update = ( value ) =>
        {
            if ( this.multiple )
            {
                toggle.values( value );
                this.value = Array.from( values );
            }
            else
                this.value = value;

            this.data[ this.row.index ][ this.name ] = this.value;

            state();
        };

        this.render();
        this.update( this.value );

        function select( text )
        {
            return field.options.find( option => option.text == text );
        }

        function state()
        {
            Array.from( field.element.children ).forEach( item =>
            {
                var name = item.getAttribute( "data-text" );
                var predicate = field.multiple ? values.has( name ) : name == field.value;
                var use = field.multiple ? name : field.value;
                var option = select( use );

                if ( predicate )
                    item.classList.add( "formselected" );
                else
                    item.classList.remove( "formselected" );

                if ( field.multiple )
                {
                    toggle.data( option );
                    field.selected = Utils.copy( Array.from( data ) );
                }
                else
                    field.selected = option;
            } );
        }
    },

    click: function()
    {
        this.required = false;
        this.value = !this.row.index;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formbutton" );
        this.element.addEventListener( "click", () => this.action( this ), false );

        this.parent.appendChild( this.element );

        this.update = () =>
        {
            this.element.innerText = this.options[ this.value - 0 ];
        };

        this.update();
    },

    color: function()
    {
        var field = this;

        this.color = document.createElement( "div" );
        this.color.classList.add( "formcolor" );

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "maxlength", 7 );
        this.element.setAttribute( "size", 4 );
        this.element.setAttribute( "spellcheck", false );
        this.element.setAttribute( "pattern", "^#([A-Fa-f0-9]{6})" );
        this.element.addEventListener( "input", function()
        {
            field.update( this.value );

            Utils.validate( field );
        }, false );

        var sxs = document.createElement( "div" );
            sxs.classList.add( "formsxs" );
            sxs.appendChild( this.color );
            sxs.appendChild( this.element );

        this.parent.appendChild( sxs );

        this.update = ( value ) =>
        {

            this.data[ this.row.index ][ this.name ] = value;
            this.value = value;
            this.element.value = value;
            this.color.style.backgroundColor = value;
        };

        this.update( this.value );
    },

    combo: function()
    {
        var field = this;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.name );
        this.element.setAttribute( "list", "" );
        this.element.setAttribute( "autocomplete", "off" );
        this.element.addEventListener( "click", () =>
        {
            items.classList.toggle( "hide" );
        }, false );
        this.element.addEventListener( "focus", function()
        {
            items.style.display = "block";

            for ( let option of items.options )
            {
                option.onclick = function ()
                {
                    field.update( this.value );
                    Utils.validate( field );
                    items.classList.add( "hide" );
                    clearTimeout( timeout );
                }
            }

            items.style.width = this.offsetWidth + 'px';
            items.style.left = this.offsetLeft + 'px';
            items.style.top = this.offsetTop + this.offsetHeight + 'px';

            var timeout = setTimeout( () => items.classList.add( "hide" ), 5000 );
        }, false );
        this.element.addEventListener( "input", function()
        {
            field.update( this.value );
            Utils.validate( field );
        }, false );

        var items = document.createElement( "datalist" );
            items.innerHTML = null;
            items.classList.add( "hide" );
            items.setAttribute( "id", this.id );

        var sxs = document.createElement( "div" );
            sxs.classList.add( "formsxs" );
            sxs.appendChild( items );
            sxs.appendChild( this.element );

        this.parent.appendChild( sxs );

        Components.options.call( this, items, field );
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

            let object = field.options[ field.index ];

            field.update( object.text );
        } );

        this.parent.appendChild( this.element );

        this.update = ( value ) =>
        {
            this.index = this.options.findIndex( option => ( option.text == value || option.value == value ) );
            this.index = this.index < 0 ? 0 : this.index;

            let object = this.options[ this.index ];

            this.element.innerText = object.text;
            this.data[ this.row.index ][ this.name ] = object.value;
            this.value = object.text;
        };

        this.update( this.value );
    },

    input: function()
    {
        var field = this;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.name );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "autocomplete", "off" );
        if ( this.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            field.update( this.value );

            Utils.validate( field );
        }, false );

        this.parent.appendChild( this.element );
    },

    label: function()
    {
        this.required = false;

        this.element = document.createElement( "div" );
        this.element.innerText = this.value;
        this.element.classList.add( "formspan" );

        this.parent.appendChild( this.element );

        this.update = ( value ) =>
        {
            this.element.innerText = value;
        };
    },

    match: function()
    {
        var field = this;
        var div = document.createElement( "div" );
            div.classList.add( "formsxs" );

        this.parent.appendChild( div );

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.value );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", "" );
        this.element.setAttribute( "autocomplete", "off" );
        if ( this.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            match( this.value );
        }, false );

        div.appendChild( this.element );

        // handlers
        var handlers = handles.call( this );

        var button = document.createElement( "div" );
            button.classList.add( "formbutton" );
            button.innerText = this.icon || String.fromCodePoint( 8680 );
            button.addEventListener( "click", () => handlers.click( this ), false );

        div.appendChild( button );

        function match( value )
        {
            if ( Utils.validate( field ) )
            {
                field.update( value );
                button.classList.remove( "formdisabled" );
            }
            else
                button.classList.add( "formdisabled" );
        }

        match();
    },

    number: function()
    {
        var field = this;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.name );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "value", Number( this.value ) );
        this.element.setAttribute( "autocomplete", "off" );
        if ( this.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            field.update( Number( this.value ) );

            Utils.validate( field );
        }, false );

        this.parent.appendChild( this.element );
    },

    object: function()
    {
        var field = this;

        if ( this.value )
        {
            this.element = document.createElement( "div" );
            this.element.setAttribute( "id", field.id );
            this.components = [];

            let axes = Object.keys( this.value ).sort();
                axes.forEach( axis =>
                {
                    var label = document.createElement( "div" );
                        label.classList.add( "formkey" );
                        label.innerText = axis;
                    var input = document.createElement( "input" );
                        input.setAttribute( "name", axis );
                        input.setAttribute( "type", "text" );
                        input.setAttribute( "value", this.value[ axis ] );
                        input.addEventListener( "input", function()
                        {
                            var value = field.value;
                                value[ axis ] = this.value;

                            field.update( value );

                            Utils.validate( field );
                        }, false );

                    this.components.push( input );
                    this.element.appendChild( label );
                    this.element.appendChild( input );
                } );

            this.parent.appendChild( this.element );
        }

        this.update = ( value ) =>
        {
            Object.keys( value ).forEach( axis =>
            {
                this.data[ this.row.index ][ this.name ][ axis ] = value[ axis ];
                this.value[ axis ] = value[ axis ];

                var input = this.components.find( input => input.name == axis );
                    input.value = value[ axis ];
            } );
        }
    },

    options: function( parent )
    {
        this.options.forEach( option =>
        {
            var item = document.createElement( "option" );
                item.text = option.text;
                item.value = option.value;

            var predicate = option.text == this.value || option.value == this.value;

            if ( predicate )
                item.setAttribute( "selected", "" );

            option.selected = predicate;
            option.element = item;
            parent.appendChild( item );
        } );
    },

    select: function()
    {
        var field = this;

        this.required = true;

        this.element = document.createElement( "select" );
        this.element.innerHTML = null;
        this.element.setAttribute( "id", field.id );
        this.element.setAttribute( "name", this.name );
        this.element.addEventListener( "change", function()
        {
            field.update();

            Utils.validate( field );
        }, false );

        this.parent.appendChild( this.element );

        this.update = () =>
        {
            var index = this.element.selectedIndex;
            var value = this.element.options[ index || 0 ].value;

            this.data[ this.row.index ][ this.name ] = value;
            this.value = value;
            this.element.selectedIndex = index;
        };

        Components.options.call( this, this.element );
    },
    
    submit: function()
    {
        var field = this;

        this.required = false;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "autocomplete", "off" );
        this.element.addEventListener( "click", click, false );

        this.parent.appendChild( this.element );

        // handlers
        var handlers = handles.call( this );

        this.reset = () =>
        {
            this.element.removeAttribute( "disabled" );
        };

        function click()
        {
            var valid = field.row.validate();

            if ( valid )
                if ( handlers.click )
                    handlers.click( field );
        }
    },

    toggle: function()
    {
        var field = this;

        this.required = true;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formlink" );
        this.element.addEventListener( "click", function()
        {
            field.index = 1 - field.index;

            let object = field.options[ field.index ];

            field.update( object.text );
        } );

        this.parent.appendChild( this.element );

        this.update = ( value ) =>
        {
            this.index = this.options.findIndex( option => ( option.text == value || option.value == value ) );
            this.index = this.index < 0 ? 0 : this.index;

            let object = this.options[ this.index ];

            var action = object.value ? "add" : "remove";

            this.element.classList[ action ]( "formselected" );

            this.element.innerText = object.text;
            this.data[ this.row.index ][ this.name ] = object.value;
            this.value = object.value;
        };

        this.update( this.value );
    },

    tree: function()
    {
        var field = this;

        this.required = true;

        // element
        this.element = document.createElement( "input" );
        this.element.setAttribute( "id", this.id );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "hidden" );
        this.element.setAttribute( "value", this.value );

        this.parent.appendChild( this.element );

        // handlers
        var handlers = handles.call( this );

        // items
        var items = this.parent.querySelector( `[ data-name = "${ this.name }" ]` ) || document.createElement( "div" );
            items.innerHTML = null;
            items.setAttribute( "id", this.id );
            items.setAttribute( "data-name", this.name );

        this.parent.appendChild( items );

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

            state( args.element, value );

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

    vector: function()
    {
        var field = this;

        if ( this.value )
        {
            this.element = document.createElement( "div" );
            this.element.setAttribute( "id", field.id );
            this.components = [];

            let axes = Object.keys( this.value ).sort();
                axes.forEach( axis =>
                {
                    var label = document.createElement( "div" );
                        label.classList.add( "formkey" );
                        label.innerText = axis;
                    var input = document.createElement( "input" );
                        input.setAttribute( "name", axis );
                        input.setAttribute( "type", "number" );
                        input.setAttribute( "value", this.value[ axis ] );
                        input.addEventListener( "input", function()
                        {
                            var value = field.value;
                                value[ axis ] = Number( this.value );

                            field.update( value );

                            Utils.validate( field );
                        }, false );

                    this.components.push( input );
                    this.element.appendChild( label );
                    this.element.appendChild( input );
                } );

            this.parent.appendChild( this.element );
        }

        this.update = ( value ) =>
        {
            Object.keys( value ).forEach( axis =>
            {
                this.data[ this.row.index ][ this.name ][ axis ] = value[ axis ];

                this.value[ axis ] = value[ axis ];

                var input = this.components.find( input => input.name == axis );
                    input.value = value[ axis ];
            } );
        }
    }
};