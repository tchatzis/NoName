import { Utils } from './form.utils.js';

export const Components =
{
    click: function()
    {
        var field = this;

        this.required = false;
        this.value = !this.row;

        this.element = document.createElement( "div" );
        this.element.classList.add( "formbutton" );

        this.handlers.forEach( type => this.element.addEventListener( type.event, () => type.handler( field ), false ) );

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
        var hash = "#";

        this.color = document.createElement( "div" );
        this.color.classList.add( "formcolor" );

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "maxlength", 6 );
        this.element.setAttribute( "size", 3 );
        this.element.setAttribute( "spellcheck", false );
        this.element.setAttribute( "pattern", "[A-Fa-f0-9]{6}" );
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
            this.data[ this.row ][ this.name ] = value;
            this.value = value;
            this.element.value = value;
            this.color.style.backgroundColor = `${ hash }${ value }`;
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
            this.data[ this.row ][ this.name ] = object.value;
            this.value = object.text;
        };

        this.update( this.value );
    },

    input: function()
    {
        var field = this;
        //var type = this.type == "validate" ? "submit" : this.type;

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
                this.data[ this.row ][ this.name ][ axis ] = value[ axis ];
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

            if ( option.text == this.value || option.value == this.value )
                item.setAttribute( "selected", "" );

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

            this.data[ this.row ][ this.name ] = value;
            this.value = value;
            this.element.selectedIndex = index;
        };

        Components.options.call( this, this.element );
    },
    
    submit: function()
    {
        var field = this;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "type", this.type );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "autocomplete", "off" );
        this.element.addEventListener( "click", function()
        {
            var valid = field.Row.validate();

            if ( valid )
            {
                this.setAttribute( "disabled", valid );

                field.set.handlers();
                field.handlers.forEach( type =>
                {
                    if ( type.event == "click" )
                        type.handler( field );
                } );
            }
        }, false );

        this.parent.appendChild( this.element );
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
            this.data[ this.row ][ this.name ] = object.value;
            this.value = object.value;
        };

        this.update( this.value );
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
                this.data[ this.row ][ this.name ][ axis ] = value[ axis ];

                this.value[ axis ] = value[ axis ];

                var input = this.components.find( input => input.name == axis );
                    input.value = value[ axis ];
            } );
        }
    }
};