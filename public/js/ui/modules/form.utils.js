import { Field } from './form.field.js';

const Utils =
{
    bubble: function( element, css )
    {
        while ( !element.classList.contains( css ) )
        {
            element = element.parentNode;
        }

        return element;
    },

    copy: function( value )
    {
        var primitive = value !== Object( value );

        if ( primitive )
            return value;
        else
        {
            if ( Array.isArray( value ) )
                return [ ...value ];
            else if ( typeof value == "object" && value !== null )
                return { ...value };
            else
                console.error( value, typeof value );
        }
    },

    create: function( css )
    {
        var div = document.createElement( "div" );
            div.classList.add( css );

        return div;
    },

    element: function( tag )
    {
        var element = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( tag );
            element.setAttribute( "data-name", this.name );
            element.setAttribute( "data-uuid", scope.uuid );

        return element;
    },

    invoke: async function( args )
    {
        var options = async function( source )
        {
            var options = [];

            if ( !source )
                throw( `"${ args.type }" source is not defined` );

            var response = await app.getters[ source.type ]( source );
                response.data.forEach( item => options.push( new this.composite.Option( { text: item[ source.key ] } ) ) );

            return options;
        }.bind( this );

        switch( args.type )
        {
            case "click":
                args.value = true;
                args.options = args.options || [ "-", "+" ];
            break;

            case "color":
                args.value = args.value || "000000";
            break;

            case "buttons":
            case "combo":
            case "cycle":
            case "select":
            case "tree":
                args.value = args.value || "";
                args.options = args.options || await options( args.source );
            break;

            case "label":
            case "match":
            case "readonly":
            case "submit":
            case "text":
            break;

            case "number":
                args.value = Utils.validate( { type: args.type, value: args.value } ) ? Number( args.value ) : 0;
            break;

            case "object":
                args.value = args.value || { a: "amanda", b: "bob", c: "cathy", d: "dave" };
            break;

            case "toggle":
                args.value = args.value || false;
                args.options = args.options || await options( args.source );
            break;

            case "vector":
                args.value = args.value || { x: 0, y: 0, z: 0 };
            break;

            default:
                throw( `"${ args.type }" type is not defined` );
            break;
        }

        args.form = this;

        return new Field( args );
    },

    validate: function ( field )
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

            // types
            click:      () => true,
            combo:      () => is.populated( field.value ),
            color:      () => ( /^#([A-Fa-f0-9]{6})/ ).test( field.value ),
            cycle:      () => is.populated( field.value ),
            date:       () => Object.prototype.toString.call( field.value ) === '[object Date]',
            datalist:   () => is.populated( field.value ),
            hidden:     () => is.populated( field.value ),
            list:       () => is.populated( field.value ),
            match:      () => is.matched( field.value, field.element.value ),
            number:     () => is.numeric( field.value ),
            object:     () => Object.keys( field.value ).every( key => is.populated( field.value[ key ] ) ),
            range:      () => is.numeric( Number( field.value ) ),
            readonly:   () => is.populated( field.value ),
            select:     () => is.populated( field.value ),
            text:       () => is.string( field.value ) && is.populated( field.value ),
            toggle:     () => is.boolean( field.value ),
            tree:       () => is.text( field.value ),
            vector:     () => Object.keys( field.value ).every( axis => is.numeric( field.value[ axis ] ) )
        };

        if ( !is[ field.type ] )
            throw( `${ field.type } validation is not defined` );

        var valid = is[ field.type ]();

        if ( field.element )
        {
            let element = Utils.bubble( field.element, "table-cell" );

            if ( !valid )
            {
                field.element.focus();

                element.classList.add( "forminvalid" );
            }
            else
            {
                let event = new CustomEvent( "valid", { detail: field } );

                field.element.dispatchEvent( event );

                element.classList.remove( "forminvalid" );
            }
        }

        return valid;
    }
};

export { Field, Utils };