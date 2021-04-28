import { Field, Utils } from './form.utils.js';

export function Composite( args )
{
    Object.assign( this, args );

    var composite = this;
        composite.name = composite.parent.getAttribute( "data-name" );
    var labels = {};

    // add row and columns
    var add = async function( columns )
    {
        this.table.row.create();

        var promises = [];

        columns.forEach( ( col, index ) => promises.push( this.table.row.col.add( col, index ) ) );

        return Promise.all( promises );
    }.bind( this );

    var Col = function( row )
    {
        this.row = row;

        this.add = async ( args, index ) =>
        {
            var element = Utils.create( "table-cell" );
                element.setAttribute( "data-col", index );
                element.setAttribute( "data-row", this.row.index );
            if ( composite.config.borders == true )
                element.classList.add( "table-border" );

            args.col = index;
            args.data = composite.data;
            args.id = `${ composite.name }.${ this.row.index }.${ args.name || args.type }`;
            args.parent = element;
            args.row = this.row.index;

            this.field = await Utils.invoke.call( composite, args );
            this.field.Row =
            {
                cols: this.row.cols,
                validate: this.row.validate
            };

            if ( args.name )
                composite.data[ this.row.index ][ args.name ] = this.field.value;

            var data =
            {
                col: index,
                element: element,
                field: this.field,
                row: this.row.index
            };

            this.row.cols.push( data );

            this.row.table.dimensions.cols = Math.max( this.row.table.dimensions.cols, this.row.cols.length );

            return data;
        };
    };

    var Row = function( table )
    {
        this.table = table;

        // initialize the row
        this.create = () =>
        {
            this.index = this.table.rows.length;
            this.element = Utils.create( "table-row" );
            if ( !this.index && composite.config.add == true  )
                this.element.classList.add( "table-add" );
            if ( this.index && composite.config.hover == true  )
                this.element.classList.add( "table-hover" );
            this.cols = [];
            this.col = new Col( this );

            composite.data.push( {} );

            var data =
            {
                cols: this.cols,
                element: this.element,
                row: this.index
            };

            this.table.rows.push( data );
            this.table.dimensions.rows = Math.max( this.table.dimensions.rows, this.table.rows.length );
            this.table.element.appendChild( this.element );

            if ( composite.config.numbers !== false )
                this.number();
        };

        // this runs once upon initialization
        this.define = ( data ) =>
        {
            // set the headings and labels
            var headings = Utils.create( "table-row" );

            if ( composite.config.numbers !== false )
                headings.appendChild( Utils.create( "table-number" ) );

            var heading = function( field )
            {
                labels[ field.col ] = Utils.create( "table-heading" );
                headings.appendChild( labels[ field.col ] );
                composite.label( field.col, field.name );
            }.bind( this );

            if ( composite.config.headings !== false )
                this.table.element.prepend( headings );

            this.labels = {};
            this.defaults = [];

            // append the columns in the same order as the fields are defined
            // put a handle on the fields
            this.fields = data.map( d =>
            {
                this.element.appendChild( d.element );

                return d.field;
            } );

            // sort the columns because they are created asynchronously
            this.cols.sort( ( a, b ) => a.col > b.col ? 1 : -1 );

            // set the column headings, fields and defaults
            this.cols.forEach( col =>
            {
                this.defaults.push( Utils.copy( col.field.value ) );

                heading( col.field );
            } );
        };

        this.delete = ( field ) =>
        {
            field.data.splice( field.row, 1 );

            var index = composite.table.rows.findIndex( row => row.row == field.row );

            composite.table.rows.splice( index, 1 );

            this.remove( field.element );
        };

        // populate next row
        this.next = async () =>
        {
            this.index++;

            var columns = [];
            var validated = [];
            var values = [];

            this.fields.forEach( ( field, col ) =>
            {
                // disconnect reference to objects
                var value = Utils.copy( field.value );
                var copy = Object.assign( {}, field );
                    copy.value = value;
                var valid = copy.validate();

                validated.push( valid );
                values.push( { [ copy.name ]: copy.value } );

                if ( valid )
                {
                    //console.log( this, composite );
                    columns.push( new composite.Col( copy ) );

                    // reset the field to default value
                    field.update( Utils.copy( this.defaults[ col ] ) );
                }
            } );

            var valid = validated.every( bool => bool );

            // append the columns in the same order as the fields are defined
            if ( valid )
            {
                let data = await add( columns );
                    data.map( d => this.element.appendChild( d.element ) );

                let event = new CustomEvent( "next", { detail: { row: this.index, values: values } } );

                composite.element.dispatchEvent( event );
            }
        };

        this.number = () =>
        {
            var div = Utils.create( "table-number" );
                div.innerText = this.index;

            this.element.prepend( div );
        };

        this.remove = ( element ) =>
        {
            var node = Utils.bubble( element, "table-row" );
                node.remove();
        };

        //this.reorder = () => {};

        //this.select = () => {};

        this.validate = () =>
        {
            var result = [];

            this.cols.forEach( col =>
            {
                if ( col.field.name && col.field.required )
                    result.push( col.field.validate() );
            } );

            return result.every( bool => bool );
        };
    };

    var Table = function()
    {
        this.dimensions = { cols: 0, rows: 0 };

        this.element = Utils.create( "table-form" );

        this.row = new Row( this );

        this.rows = [];

        composite.parent.appendChild( this.element );
    };
    
    // add / delete row with click
    this.action = ( field ) =>
    {
        if ( !field.row )
            this.table.row.next();
        else
            this.table.row.delete( field );
    };

    // add row with data
    this.append = ( data ) =>
    {
        console.log( composite, data );
    };

    // column definition object
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

        this.type = args.type || "text";

        // suggested
        this.value = args.value || null;
        this.handlers = args.handlers || [];

        // optional
        this.col = args.col || 0;
        this.row = args.row || 0;

        // only if defined
        if ( args.destination )
            this.destination = args.destination;

        if ( args.options )
            this.options = args.options;
        else
            if ( args.source )
                this.source = args.source;

        //console.warn( this );
    };

    this.from =
    {
        object:
        {
            to:
            {
                options: ( args ) =>
                {
                    var source = args.data;
                    var options = [];
                    var keys = Object.keys( source );
                        keys.splice( keys.indexOf( args.key ), 1 );
                        keys.sort();
                        keys.forEach( name =>
                        {
                            options.push( new this.Option( name, source[ name ] ) );
                        } );

                    return options;
                }
            }
        }
    };

    this.get =
    {
        config: () => this.config,
        data: () => this.data,
        defaults: () => this.table.row.defaults,
        field: ( row, col ) => this.table.rows[ row ].cols[ col ].field,
        schema: () => this.table.row.fields.map( field => { return { name: field.name, type: field.type } } ),
        size: () => this.table.dimensions,
        value: ( row, col ) => this.data[ row ][ col ]
    };

    this.init = async ( columns ) =>
    {
        this.data = [];
        this.table = new Table();
        this.element = this.table.element;

        var data = await add( columns );

        this.table.row.define( data );

        var event = new Event( "loaded" );

        this.element.dispatchEvent( event );
    };

    this.label = ( col, value ) => labels[ col ].innerText = value;

    Field.call( this );
}