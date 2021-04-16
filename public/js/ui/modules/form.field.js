import { Components } from './form.components.js';
import { Utils } from './form.utils.js';

function Field( args )
{
    // defaults
    Object.assign( this, args );

    //this.parent = this.parent || scope.form;
    this.handlers = this.handlers || [];

    // display
    switch( this.type )
    {
        /*case "array":
            Arrays.call( this );
        break;*/

        /*case "checkbox":
        case "color":
        datetime-local
        file
            image
            month
            radio
            search
            url
            week*/

        case "button":
        case "date":
        case "email":
        case "hidden":
        case "number":
        case "password":
        case "range":
        case "readonly":
        case "submit":
        case "tel":
        case "text":
        case "time":
            Components.input.call( this );
        break;

        case "click":
        case "color":
        case "combo":
        case "cycle":
        case "object":
        case "select":
        case "toggle":
        case "vector":
            Components[ this.type ].call( this );
        break;

        /*case "controls":
            Controls.call( this );
        break;*/

        /*case "datalist":
            DataList.call( this );
        break;*/

        /*case "list":
            List.call( this );
        break;*/

        /*case "select":
            Select.call( this );
        break;*/

        /*case "toggle":
            Toggle.call( this );
        break;*/

        /*case "tree":
            Tree.call( this );
        break;*/

        /*case "vector":
            Vector.call( this );
        break;*/

        /*case "vertical":
            Vertical.call( this );
        break;*/
    }

    // events
    switch( this.type )
    {
        case "array":
        case "click":
        case "vertical":
            // event handlers for arrays are set per item
        break;

        default:
            this.handlers.forEach( type =>
            {
                this.element.removeEventListener( type.event, type.handler, false )
                this.element.addEventListener( type.event, type.handler, false );
            } );
        break;
    }

    // hidden
    if ( this.hidden === true )
        this.element.parentNode.classList.add( "hide" );

    // process
    switch( this.type )
    {
        case "validate":
            //Validate.call( this );
        break;

        case "submit":
            //Submit.call( this );
        break;
    }

    // update value of instance and element
    switch( this.type )
    {
        case "click":
        case "color":
        case "cycle":
        case "select":
        case "toggle":
        case "tree":
        case "vector":
        break;

        default:
            this.update = ( value ) =>
            {
                this.data[ this.row ][ this.name ] = value;
                this.value = value;
                this.element.value = value;
            };
        break;
    }

    this.validate = () => Utils.validate( this );
}

/*const Utils =
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
        var options = async function( params )
        {
            var options = [];

            var response = await app.getters.db( params );
                response.data.forEach( item => options.push( new this.Option( item[ params.key ] ) ) );

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

            case "combo":
                args.value = args.value || "";
                args.options = args.options || await options( args.params );
            break;

            case "cycle":
                args.value = args.value || "";
                args.options = args.options || await options( args.params );
            break;

            case "object":
                args.value = args.value || { a: "amanda", b: "bob", c: "cathy", d: "dave" };
            break;

            case "select":
                args.value = args.value || "";
                args.options = args.options || await options( args.params );
            break;

            case "toggle":
                args.value = args.value || false;
                args.options = args.options || await options( args.params );
            break;

            case "vector":
                args.value = args.value || { x: 0, y: 0, z: 0 };
            break;
        }

        return new Field( args );
    },

    validate: function ( field )
    {
        const is =
        {
            // checks
            boolean:    ( value ) => typeof value == "boolean",
            defined:    ( value ) => typeof value !== "undefined",
            notnull:    ( value ) => value !== null,
            number:     ( value ) => typeof value == "number" && !isNaN( value ),
            populated:  ( value ) => value !== "" && is.notnull( value ) && is.defined( value ),
            string:     ( value ) => typeof value == "string",

            // types
            click:      () => true,
            combo:      () => is.populated( field.value ),
            color:      () => ( /[a-f0-9]{6}$/gi ).test( field.value ),
            cycle:      () => is.populated( field.value ),
            date:       () => Object.prototype.toString.call( field.value ) === '[object Date]',
            datalist:   () => is.populated( field.value ),
            hidden:     () => is.populated( field.value ),
            list:       () => is.populated( field.value ),
            object:     () => Object.keys( field.value ).every( key => is.populated( field.value[ key ] ) ),
            range:      () => is.number( Number( field.value ) ),
            readonly:   () => is.populated( field.value ),
            select:     () => is.populated( field.value ),
            text:       () => is.string( field.value ) && is.populated( field.value ),
            toggle:     () => is.boolean( field.value ),
            tree:       () => is.text( field.value ),
            vector:     () => Object.keys( field.value ).every( axis => is.number( field.value[ axis ] ) )
        };

        if ( !is[ field.type ] )
            throw( field.type );

        var element = Utils.bubble( field.element, "table-cell" );
        var valid = is[ field.type ]();

        if ( !valid )
        {
            element.classList.add( "forminvalid" );
            field.element.focus();
            scope.message.add( field.name, `${ field.name } is not valid`, error, 10 );
        }
        else
        {
            element.classList.remove( "forminvalid" );
            scope.message.cancel();
        }

        return valid;
    }
};*/

export { Field };