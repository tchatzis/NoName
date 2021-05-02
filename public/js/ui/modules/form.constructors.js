export const Constructors = function()
{
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
        this.break = !!args.break;
        this.col = args.col || 0;
        this.handlers = args.handlers || [];
        this.label = args.label || args.name;
        this.required = ( args.required !== false );
        this.row = args.row || 0;
        this.type = args.type || "text";

        var value = args.value || "";

        if ( this.type == "number" )
            value = value ? Number( value ) : 0;

        this.value = value;

        // only if defined
        if ( args.attributes )
            this.attributes = args.attributes;

        if ( args.destination )
            this.destination = args.destination;

        if ( args.hasOwnProperty( "horizontal" ) )
            this.horizontal = !!args.horizontal;

        if ( args.icon )
            this.icon = args.icon;

        if ( args.multiple )
            this.multiple = args.multiple;

        if ( args.options )
            this.options = args.options;
        else
            if ( args.source )
                this.source = args.source;
    };

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
        this.handler = args.handler || console.warn( this.event, "event is not defined" );
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
};