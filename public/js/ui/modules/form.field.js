import { Components } from './form.components.js';
import { Utils } from './form.utils.js';

function Field( args )
{
    // defaults
    Object.assign( this, args );

    // display
    switch( this.type )
    {
        // TODO: implement
        /*
        checkbox
        datetime-local
        file
        image
        month
        radio
        search
        url
        week
        */

        case "button":
        case "date":
        case "email":
        case "hidden":
        case "password":
        case "range":
        case "readonly":
        case "tel":
        case "text":
        case "time":
            Components.input.call( this );
        break;

        case "click":
        case "color":
        case "combo":
        case "cycle":
        case "label":
        case "match":
        case "number":
        case "object":
        case "select":
        case "submit":
        case "toggle":
        case "tree":
        case "vector":
            Components[ this.type ].call( this );
        break;

        default:
            console.warn( this.type, "field is not defined" );
        break;
    }

    this.set =
    {
        attributes: () =>
        {
            if ( this.attributes )
                for ( let attr in this.attributes )
                    if ( this.attributes.hasOwnProperty( attr ) )
                        this.element.setAttribute( attr, this.attributes[ attr ] );
        },

        handlers: () =>
        {
            this.handlers.forEach( type =>
            {
                this.element.removeEventListener( type.event, () => type.handler( this ), false )
                this.element.addEventListener( type.event, () => type.handler( this ), false );
            } );
        },

        visibility: () =>
        {
            if ( this.hidden === true )
                this.element.parentNode.classList.add( "hide" );
        }
    };

    // events
    switch( this.type )
    {
        // set handlers on other element
        case "click":
            // TODO: test click
            console.warn( this );
        break;

        case "match":   // because the target is the button and not the input
        case "submit":  // because the row is validated before the event is fired
        case "tree":    // because the target is the label and not the input
        break;

        default:
            this.set.handlers();
        break;
    }

    // update value of field and input
    switch( this.type )
    {
        case "click":
        case "color":
        case "cycle":
        case "label":
        case "select":
        case "toggle":
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

    this.set.attributes();
    this.set.visibility();
}

export { Field };