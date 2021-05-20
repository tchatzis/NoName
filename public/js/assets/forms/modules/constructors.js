export const Constructors = function()
{
    var scope = this;

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

    this.Option = function( args )
    {
        if ( args.hasOwnProperty( "text" ) )
            this.text = args.text;

        if ( args.hasOwnProperty( "value" ) )
            this.value = args.value;

        if ( typeof args !== "object" )
            args = { text: args, value: args };

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

        this.novalue = ( value ) => value == "" || typeof value == "undefined" || value == null || isNaN( value );

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

        if ( args.form && args.bind )
        {
            this.bind = ( row ) => args.form.get.field( args.form.composite.name, row, args.bind );
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