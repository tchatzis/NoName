import { Constructors } from './constructors.js';
import { Utilities } from './utilities.js';
import { Components } from './components.js';

function Field( args )
{
    var field = this;
    var constructors = new Constructors();
    var types;

    const check = ( value ) => this.value.value ? this.value : new constructors.Option( { text: this.value.text, value: value } );
    const checkVoid = ( value ) => this.value.void() ? new constructors.Option( { text: this.value.text, value: value } ) : this.value;

    // get/set values and options
    const defaults = async () =>
    {
        switch( field.type )
        {
            case "button":
            case "submit":
                this.value = check( field.name.toUpperCase() );
            break;

            case "color":
                this.value = check( "#000000" );
            break;

            case "buttons":
            case "cycle":
            case "combo":
            case "select":
                this.options = await options( this.source );
            break;

            case "date":
                let date = new Date( this.value.value ) || new Date();
                    date = date.toISOString().substring( 0, 10 );
                this.value = check( date );
            break;

            case "menu":
            case "tree":
                this.options = await items( this.source );
                this.value = this.options.find( option => option.equals( this.value ) ) || this.options.find( option => option.parent == "" );
            break;

            case "object":
                this.value = checkVoid( { a: "amanda", b: "bob", c: "cathy", d: "dave" } );
            break;

            case "time":
                let time = new Date( this.value.value ) || new Date();
                    time = time.toTimeString().split(' ')[ 0 ];
                this.value = check( time );
            break;

            case "toggle":
                let bool = !!this.value.value;
                this.options = await options( this.source );
                this.value = this.options.find( option => option.value == bool );
            break;

            case "vector":
                this.value = checkVoid( { x: 0, y: 0, z: 0 } );
            break;
        }

        if ( this.value )
            this.selected = this.value.clone();

        return true;
    };

    // switch handlers per type
    const handlers = () =>
    {
        switch( field.type )
        {
            //case "color":   // because the color has to be validated first
            case "match":   // because the target is the button and not the input
            case "submit":  // because the row is validated before the event is fired
            //case "tree":    // because the target is the label and not the input
            break;

            default:
                field.set.handlers();
            break;
        }
    };

    // invoke component
    const invoke = () =>
    {
        var type = types.find( type => type.text == field.type );

        if ( !type || !type.value )
            throw( `${ field.type } field is not implemented` );

        Components[ type.value ].call( this );
    };

    // get items from js or db
    async function items( source )
    {
        var options = [];

        if ( !source )
            throw( `"${ args.type }" source is not defined` );

        var response = await app.getters[ source.type ]( source );
            response.data.forEach( item =>
            {
                var option = new constructors.Item( item, source.key );
                    options.push( option );
            } );

        return options;
    }

    // put the args into constructors
    const normalize = () =>
    {
        var col = new constructors.Col( args );

        for ( let prop in col )
        {
            if ( col.hasOwnProperty( prop ) )
            {
                switch( prop )
                {
                    case "destination":
                        col[ prop ] = new constructors.Destination( col[ prop ] );
                    break;

                    case "handlers":
                        col[ prop ] = col[ prop ].map( data => new constructors.Handler( data ) );
                    break;

                    case "options":
                        col[ prop ] = col[ prop ].map( data => new constructors.Option( data ) );
                    break;

                    case "source":
                        col[ prop ] = new constructors.Source( col[ prop ] );
                    break;

                    case "value":
                        col[ prop ] = optionize( col[ prop ] );
                    break;
                }
            }
        }

        Object.assign( this, col );
    };

    const optionize = ( value ) =>
    {
        if ( [ "number", "range" ].find( type => args.type == type ) )
            value = Number( value );

        if ( value == null )
            return new constructors.Option( { text: "", value: "" } );

        if ( typeof value == "undefined" )
            return new constructors.Option( { text: "", value: "" } );

        if ( typeof value == "boolean" )
            return new constructors.Option( { text: args.name, value: value } );

        if ( typeof value == "number" )
            return new constructors.Option( { text: value, value: value } );

        if ( typeof value == "string" )
            return new constructors.Option( { text: value, value: value } );

        if ( Array.isArray( value ) )
            return new constructors.Option( { text: args.name, value: [ ...value ] } );

        if ( typeof value == "object" )
            return new constructors.Option( { text: args.name, value: { ...value } } );
    };

    // get options from js or db
    async function options( source )
    {
        var options = [];

        if ( !source )
            throw( `"${ args.type }" source is not defined` );

        var response = await app.getters[ source.type ]( source );
            response.data.forEach( item =>
            {
                var option = new constructors.Option( item );
                    options.push( option );
            } );

        return options;
    }

    // public methods
    Object.defineProperty( this, "init",
    {
        enumerable: false,
        value: async () =>
        {
            normalize();
            await defaults();
            field.lookup();
            invoke();
            handlers();
            field.set.attributes();
        }
    } );

    Object.defineProperty( this, "lookup",
    {
        enumerable: false,
        value: () =>
        {
            types =
            [
                // not implemented
                new constructors.Option( { text: "checkbox", value: "" } ),
                new constructors.Option( { text: "datetime-local", value: "" } ),
                new constructors.Option( { text: "file", value: "" } ),
                new constructors.Option( { text: "image", value: "" } ),
                new constructors.Option( { text: "month", value: "" } ),
                new constructors.Option( { text: "radio", value: "" } ),
                new constructors.Option( { text: "search", value: "" } ),
                new constructors.Option( { text: "week", value: "" } ),
                // input
                new constructors.Option( { text: "button", value: "input" } ),
                new constructors.Option( { text: "date", value: "input" } ),
                new constructors.Option( { text: "email", value: "input" } ),
                new constructors.Option( { text: "hidden", value: "input" } ),
                new constructors.Option( { text: "password", value: "input" } ),
                new constructors.Option( { text: "range", value: "input" } ),
                new constructors.Option( { text: "readonly", value: "input" } ),
                new constructors.Option( { text: "tel", value: "input" } ),
                new constructors.Option( { text: "text", value: "input" } ),
                new constructors.Option( { text: "time", value: "input" } ),
                new constructors.Option( { text: "url", value: "input" } ),
                // custom
                new constructors.Option( { text: "buttons", value: "buttons" } ),
                new constructors.Option( { text: "code", value: "code" } ),
                new constructors.Option( { text: "color", value: "color" } ),
                new constructors.Option( { text: "combo", value: "combo" } ),
                new constructors.Option( { text: "cycle", value: "cycle" } ),
                new constructors.Option( { text: "label", value: "label" } ),
                new constructors.Option( { text: "match", value: "match" } ),
                new constructors.Option( { text: "menu", value: "menu" } ),
                new constructors.Option( { text: "number", value: "number" } ),
                new constructors.Option( { text: "object", value: "object" } ),
                new constructors.Option( { text: "preview", value: "preview" } ),
                new constructors.Option( { text: "select", value: "select" } ),
                new constructors.Option( { text: "separator", value: "separator" } ),
                new constructors.Option( { text: "submit", value: "submit" } ),
                new constructors.Option( { text: "toggle", value: "toggle" } ),
                new constructors.Option( { text: "tree", value: "tree" } ),
                new constructors.Option( { text: "underscore", value: "underscore" } ),
                new constructors.Option( { text: "vector", value: "vector" } )
            ];

            types = types.sort( ( a, b ) => a.text - b.text );
        }
    } );

    field.refresh =
    {
        items: async () => await items( this.source ),
        options: async () => await options( this.source )
    };

    field.set =
    {
        attributes: () =>
        {
            if ( this.attributes )
                for ( let attr in this.attributes )
                    if ( this.attributes.hasOwnProperty( attr ) )
                        this.element.setAttribute( attr, this.attributes[ attr ] );
        },

        disabled: ( text, bool ) =>
        {
            var action = bool ? "add" : "remove";
            var item = field.options.find( option => option.text == text ).element;
                item.classList[ action ]( "formdisabled" );
        },

        handlers: () =>
        {
            var handler = ( e, type ) =>
            {
                e.preventDefault();

                if ( type.event == "input" )
                {
                    if ( this.validate() )
                        type.handler( this );
                }
                else
                   type.handler( this );
            };

            this.handlers.forEach( type =>
            {
                this.element.removeEventListener( type.event, ( e ) => handler.call( this, e, type ), false );
                this.element.addEventListener(    type.event, ( e ) => handler.call( this, e, type ), false );
            } );
        },

        hide: ( bool ) =>
        {
            var action = bool ? "add" : "remove";
            var row = Utilities.bubble( this.element, "table-row" );
            var cell = row.querySelector( `[ data-col = "${ this.col.index }" ]` );
                cell.classList[ action ]( "hide" );
            var heading = row.previousSibling;
            var label = heading.querySelector( `[ data-label = "${ this.col.index }" ]` );
                label.classList[ action ]( "hide" );
        },

        visibility: ( bool ) =>
        {
            var action = bool ? "remove" : "add";

            var row = Utilities.bubble( this.element, "table-row" );
                row.classList[ action ]( "hide" );

            var heading = row.previousSibling;
                heading.classList[ action ]( "hide" );
        }
    };

    // attach validation function to field
    field.validate = () =>
    {
        const is =
        {
            // checks
            boolean:    ( value ) => typeof value == "boolean",
            defined:    ( value ) => typeof value !== "undefined",
            matched:    ( value1, value2 ) => value1 == value2,
            notnull:    ( value ) => value !== null,
            numeric:    ( value ) => typeof Number( value ) == "number" && !isNaN( Number( value ) ),
            populated:  ( value ) => value !== "" && is.notnull( value ) && is.defined( value ),
            string:     ( value ) => typeof value == "string",
            validated:  ( field ) => field.validate.row( field ),

            // types
            button:     () => true,
            buttons:    () => is.populated( field.selected.value ),
            click:      () => true,
            code:       () => true,
            combo:      () => is.populated( field.selected.value ),
            color:      () => ( /^transparent|#([A-Fa-f0-9]{6})/ ).test( field.selected.value ),
            cycle:      () => is.populated( field.selected.value ),
            date:       () => ( /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])/ ).test( field.selected.value ),
            datalist:   () => is.populated( field.selected.value ),
            email:      () => {
                                  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                  return re.test( field.selected.value );
                              },
            hidden:     () => is.populated( field.selected.value ),
            list:       () => is.populated( field.selected.value ),
            match:      () => is.matched( field.value.value, field.selected.value ),
            menu:       () => true,
            number:     () => is.numeric( field.selected.value ),
            object:     () => Object.keys( field.selected.value ).every( key => is.populated( field.selected.value[ key ] ) ),
            password:   () => (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/).test( field.selected.value ),
            preview:    () => true,
            range:      () => is.numeric( Number( field.selected.value ) ),
            readonly:   () => is.populated( field.selected.value ),
            select:     () => is.populated( field.selected.value ),
            submit:     () => true,
            tel:        () => ( /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ ).test( field.selected.value ),
            text:       () => is.string( field.selected.value ) && is.populated( field.selected.value ),
            toggle:     () => is.boolean( field.selected.value ),
            tree:       () => true,
            url:        () => ( /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ ).test( field.selected.value ),
            vector:     () => Object.keys( field.selected.value ).every( axis => is.numeric( field.selected.value[ axis ] ) )
        };

        if ( !is[ field.type ] )
            throw( `${ field.type } validation is not defined` );

        var valid = is[ field.type ]();

        if ( field.element )
        {
            let element = Utilities.bubble( field.element, "table-cell" );

            if ( !valid )
                element.classList.add( "forminvalid" );
            else
            {
                let detail = { detail: field };
                let event = new CustomEvent( "valid", detail );

                field.element.dispatchEvent( event );

                element.classList.remove( "forminvalid" );
            }
        }

        return valid;
    };

    field.validate.row = () =>
    {
        var validated = [];
        var valid = false;
        var row = field.table.get.row( field.index );
        var submit = [];

        for ( let col in row )
        {
            let obj = row[ col ];

            if ( obj.field && obj.field.required )
                validated.push( obj.field.validate( obj.field ) );
            else if ( obj.field && obj.field.type == "submit" )
                submit.push( obj.field );
            else
            {
                valid = validated.every( bool => bool );

                if ( obj.state )
                    obj.state( valid );

                submit.forEach( item =>
                {
                    var action = valid ? "removeAttribute" : "setAttribute";

                    item.element[ action ]( "disabled", "" );
                } );

                return valid;
            }
        }

        return valid;
    };
}

export { Field }