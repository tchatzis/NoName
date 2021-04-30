import { Components } from './form.components.js';
import { Utils } from './form.utils.js';

function Field( args )
{
    // defaults
    Object.assign( this, args );

    this.handlers = this.handlers || [];

    // hidden
    if ( this.hidden === true )
        this.element.parentNode.classList.add( "hide" );

    this.set =
    {
        handlers: () =>
        {
            this.handlers.forEach( type =>
            {
                this.element.removeEventListener( type.event, type.handler, false )
                this.element.addEventListener( type.event, type.handler, false );
            } );
        }
    };

    // display
    switch( this.type )
    {
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
        case "number":
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

    // events
    switch( this.type )
    {
        case "click":
        case "label":
        case "match":
        case "submit":
        case "tree":
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
}

export { Field };