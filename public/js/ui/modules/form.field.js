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
        case "object":
        case "select":
        case "submit":
        case "toggle":
        case "tree":
        case "vector":
            Components[ this.type ].call( this );
        break;

        console.warn( this.type );
    }

    // events
    switch( this.type )
    {
        case "click":
        case "submit":
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

    // constructors
    this.Destination = function( args )
    {
        this.key = args.key;

        if ( args.path )
        {
            this.type = "db";
            this.path = args.path;
            this.output = args.output || "static";

            if ( args.map )
                this.map = args.map;

            return;
        }

        if ( args.data )
        {
            this.type = "object";
            this.data = args.data;
        }
    };

    this.Handler = function( args )
    {
        this.event = args.event;
        this.handler = args.handler || console.warn( this.event, "is not defined" );
    };

    this.Option = function( text, value )
    {
        this.text = text;
        this.value = typeof value == "undefined" ? text : value;
    };

    this.Source = function( args )
    {
        this.key = args.key;

        if ( args.path )
        {
            this.type = "db";
            this.path = args.path;
            this.output = args.output || "static";

            if ( args.map )
                this.map = args.map;

            return;
        }

        if ( args.data )
        {
            this.type = "object";
            this.data = args.data;
        }
    };
}

export { Field };