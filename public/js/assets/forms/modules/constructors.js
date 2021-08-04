export const Constructors = function()
{
    var scope = this;
    var convert = function( value )
    {
        if ( typeof value !== "object" )
            return value;

        if ( typeof value == "object" )
            if ( Array.isArray( value ) )
                return [ ...value ];
            else
                return { ...value };
    };

    this.Col = function( args )
    {
        // required
        Object.defineProperty( this, "name",
        {
            value: args.name,
            enumerable: true,
            writeable: false,
            configurable: false
        } );

        // defaults
        this.handlers = args.handlers || [];
        this.label = args.label;
        this.required = ( args.required !== false );
        this.type = args.type || "text";

        // only if defined
        if ( args.attributes )
            this.attributes = args.attributes;

        if ( args.bind )
            this.bind = args.bind;

        if ( args.destination )
            this.destination = args.destination;

        if ( args.options )
            console.warn( "use source attribute instead of options for", args.type );

        if ( args.source )
            this.source = args.source;

        if ( args.hasOwnProperty( "value" ) )
            this.value = args.value;

        this.settings = args.settings || {};
    };

    this.Destination = function( args )
    {
        if ( args.key )
            this.key = args.key;

        if ( args.path )
        {
            this.type = "db";
            this.path = args.path;
            this.output = args.output || "static";
            this.structure = args.structure || "object";

            if ( args.map )
                this.map = args.map;

            return;
        }

        if ( args.data )
        {
            this.type = "js";
            this.data = args.data;
        }
    };

    this.Handler = function( args )
    {
        this.event = args.event;
        this.handler = args.handler || console.warn( this.event, "event handler is not defined" );
    };
    
    this.Item = function( args, key )
    {
        this[ key ] = args[ key ];
        this.color = args.color || "transparent";
        this.label = args.label || this[ key ];
        this.children = [];
        this.expand = !!args.expand;
        this.item = args.item;
        this.parent = args.parent || "";
        this.visible = !!args.visible;
        
        this.clone = () =>
        {
            var args = {};

            for ( let prop in this )
                if ( this.hasOwnProperty( prop ) )
                    args[ prop ] = convert( this[ prop ] );

            return new scope.Item( args, key );
        };

        this.equals = ( item ) => item[ key ] == this[ key ];
    };

    this.Option = function( args )
    {
        if ( typeof args !== "object" )
        {
            args = { text: args, value: args };
            Object.assign( this, args );
        }
        else
        {
            let unpack = () => { for ( let name in args ) return args[ name ] };

            if ( args.hasOwnProperty( "text" ) )
                this.text = args.text;
            else
                this.text = unpack();

            if ( args.hasOwnProperty( "value" ) )
                this.value = args.value;
            else
                this.value = unpack();
        }

        this.text  = typeof this.text  == "undefined" ? this.value : this.text;
        this.value = typeof this.value == "undefined" ? this.text  : this.value;

        if ( args.disabled )
            this.disabled = args.disabled;

        if ( args.selected )
            this.selected = args.selected;

        this.clone = () =>
        {
            var args = {};

            for ( let prop in this )
                if ( this.hasOwnProperty( prop ) )
                    args[ prop ] = app.utils.clone( this[ prop ] );

            return new scope.Option( args );
        };

        this.equals = ( option ) => [ "text", "value" ].every( key => option[ key ] == this[ key ] );
        
        this.extract = () => this.value;

        this.keys = () => Object.keys( this.value ).sort();

        this.typeof = () =>
        {
            if ( typeof this.value == "object" )
            {
                if ( Array.isArray( this.value ) )
                    return "array";

                if ( Object.prototype.toString.call( this.value ) === '[object Date]' )
                    return "date";
            }

            return typeof this.value;
        };

        this.novalue = ( value ) => value == "" || typeof value == "undefined" || value == null;

        this.void = () => [ "text", "value" ].every( key => this.novalue( this[ key ] ) );
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

        if ( args.hasOwnProperty( "url" ) )
        {
            this.url = args.url;
            return;
        }

        if ( args.json )
            this.data = JSON.parse( args.json );

        if ( args.data )
        {
            this.type = "js";
            this.key = args.key || "text";
            this.data = args.data;
        }
    };
};