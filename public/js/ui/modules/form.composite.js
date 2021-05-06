import { Constructors } from './form.constructors.js';
import { Utils } from './form.utils.js';

export function Composite( args )
{
    Object.assign( this, args );
    delete this.form;

    var composite = this;
    var labels = {};
    var form = args.form;
        form.fields[ this.name ] = {};

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

            var local =
            {
                break: args.break,
                hide: args.hide
            };

            delete args.break;
            delete args.hide;

            args.col = { index: index };
            args.data = composite.data;
            args.id = `${ composite.name }.${ this.row.index }.${ args.name || args.type }`;
            args.parent = element;
            args.row = { index: this.row.index };

            this.field = await Utils.invoke.call( form, args );
            this.field.row = Object.assign(
            {
                cols: this.row.cols,
                index: this.row.index,
                validate: this.row.validate
            }, local );

            if ( args.name )
                composite.data[ this.row.index ][ args.name ] = this.field.value;

            var data =
            {
                col: args.col,
                element: element,
                field: this.field,
                row: args.row
            };

            this.row.cols.push( data );

            this.row.table.dimensions.cols = Math.max( this.row.table.dimensions.cols, this.row.cols.length );

            return data;
        };
    };

    var Row = function( table )
    {
        var number = () =>
        {
            var div = Utils.create( "table-number" );
                div.innerText = this.index || "\u27a4";//»U+00BB\u27b2

            this.element.prepend( div );
        };

        // load the data into the row
        var populate = async ( data ) =>
        {
            var columns = [];
            var validated = [];
            var values = [];

            this.fields.forEach( ( field, col ) =>
            {
                var value = Utils.copy( data[ col ] || field.value );
                var copy = Object.assign( {}, field );
                    copy.value = value;
                var valid = copy.validate();

                validated.push( valid );
                values.push( { [ copy.name ]: copy.value } );

                if ( valid )
                {
                    columns.push( new composite.Col( copy ) );
                    copy.update( value );

                    field.update( this.defaults[ col ] );
                }
            } );

            await validate( validated, columns );

            this.index++;
        };

        // give the form a reference to the fields
        var reference = ( field ) =>
        {
            var name = field.name || field.type.toUpperCase();
            form.fields[ composite.name ][ name ] = { field: field, col: field.col.index, row: field.row.index };
        };

        // render each column in row and append field
        var render = ( data ) =>
        {
            var count = 0;
            var headings;

            this.fields = data.map( d =>
            {
                d.element.setAttribute( "data-col", d.field.col.index );

                if ( d.field.row.break )
                {
                    let row = Utils.create( "table-row" );
                        row.appendChild( d.element );
                        row.setAttribute( "data-row", d.field.row.index );
                    if ( d.field.row.hide )
                        row.classList.add( "hide" );

                    let parent = this.element.parentNode;
                        parent.appendChild( row );

                    this.element = row;

                    count = 0;
                }
                else
                    this.element.appendChild( d.element );

                // add headings
                if ( !count && composite.config.headings !== false )
                {
                    labels[ d.field.col.index ] = Utils.create( "table-heading" );
                    labels[ d.field.col.index ].setAttribute( "data-label", d.field.col.index );

                    headings = Utils.create( "table-row" );
                    headings.appendChild( labels[ d.field.col.index ] );
                    headings.setAttribute( "data-heading", d.field.row.index );
                    if ( d.field.row.hide )
                        headings.classList.add( "hide" );

                    if ( composite.config.numbers !== false )
                        headings.prepend( Utils.create( "table-number" ) );

                    let parent = this.element.parentNode;
                        parent.insertBefore( headings, this.element );

                    composite.label( d.field.col.index, d.field.label );
                }
                else
                {
                    if ( d.field.label )
                    {
                        labels[ d.field.col.index ] = Utils.create( "table-heading" );
                        headings.appendChild( labels[ d.field.col.index ] );

                        composite.label( d.field.col.index, d.field.label );
                    }
                }

                count++;

                reference( d.field );

                return d.field;
            } );
        };

        var validate = async ( validated, columns ) =>
        {
            var valid = validated.every( bool => bool );

            // append the columns in the same order as the fields are defined
            if ( valid )
            {
                let data = await this.add( columns );
                    data.map( d => this.element.appendChild( d.element ) );
            }

            return valid;
        };

        // TODO: implement option
        // public functions
        this.array = async ( array ) =>
        {
            // source: array of columns [ [ col array ], [ col array ], ... ]

            // todo: data populates first row
            var rows = [];
            var cols = [];

            array.forEach( ( column, c ) => cols[ c ] = column );

            cols.forEach( ( array ) =>
            {
                rows = [];

                array.forEach( ( item, c ) => rows.push( cols.map( ( col, i ) => cols[ i ][ c ] ) ) );
            } );

            for ( let row of rows )
                await populate( row );
        };

        this.add = async ( columns ) =>
        {
            this.table.row.create();

            var promises = [];

            columns.forEach( ( args, index ) => promises.push( this.table.row.col.add( args, index ) ) );

            return Promise.all( promises );
        };

        // initialize the row
        this.create = () =>
        {
            this.index = this.table.rows.length;
            this.element = Utils.create( "table-row" );
            this.element.setAttribute( "data-row", this.index );
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
                index: this.index
            };

            this.table.rows.push( data );
            this.table.dimensions.rows = Math.max( this.table.dimensions.rows, this.table.rows.length );
            this.table.element.appendChild( this.element );

            if ( composite.config.numbers !== false )
                number();
        };

        // this runs once upon initialization
        this.define = ( data ) =>
        {
            this.defaults = [];

            render( data );

            // sort the columns because they are created asynchronously
            this.cols.sort( ( a, b ) => a.col.index > b.col.index ? 1 : -1 );

            // set the column headings, fields and defaults
            this.cols.forEach( col => this.defaults.push( Utils.copy( col.field.value ) ) );
        };

        this.delete = ( field ) =>
        {
            field.data.splice( field.row.index, 1 );

            var index = composite.table.rows.findIndex( row => row.index == field.row.index );

            composite.table.rows.splice( index, 1 );

            this.remove( field.element );
        };

        // populate the next dummy row
        this.next = async () => await populate( [] );

        this.option = async ( field ) =>
        {
            var array = new Array( field.row.cols.length );
                array[ field.row.index ] = field.selected.value;

            this.array( array );
        };

        this.remove = ( element ) =>
        {
            var node = Utils.bubble( element, "table-row" );
                node.remove();
        };

        this.table = table;

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

        this.element = composite.parent.querySelector( ".table-form" ) || Utils.create( "table-form" );
        this.element.innerHTML = null;

        this.row = new Row( this );

        this.rows = [];

        composite.parent.appendChild( this.element );
    };

    // replace column data with form.constructors
    var normalize = function( columns )
    {
        var normalized = [];

        columns.forEach( column =>
        {
            var col = new this.Col( column );

            for ( let prop in col )
            {
                if ( col.hasOwnProperty( prop ) )
                {
                    switch( prop )
                    {
                        case "destination":
                            col[ prop ] = new this.Destination( col[ prop ] );
                        break;

                        case "handlers":
                            col[ prop ] = col[ prop ].map( data => new this.Handler( data ) );
                        break;

                        case "options":
                            col[ prop ] = col[ prop ].map( data => new this.Option( data ) );
                        break;

                        case "source":
                            col[ prop ] = new this.Source( col[ prop ] );
                        break;
                    }
                }
            }

            normalized.push( col );
        } );

        return normalized;
    }.bind( this );
    
    // add / delete row with click
    this.action = ( field ) =>
    {
        if ( !field.row.index )
            this.table.row.next();
        else
            this.table.row.delete( field );
    };

    this.from =
    {
        object:
        {
            to:
            {
                options: ( args ) =>
                {
                    var source = new this.Source( args );
                    var data = source.data;
                    var options = [];

                    if ( data )
                    {
                        let keys = Object.keys( data );
                            keys.splice( keys.indexOf( source.key ), 1 );
                            keys.sort();
                            keys.forEach( name => options.push( new this.Option( { text: name, value: data[ name ] } ) ) );
                    }

                    return options;
                }
            }
        },
        set:
        {
            to:
            {
                value: ( args ) =>
                {
                    var value;

                    for ( let item of args )
                        value = item;

                    return value;
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
        schema: () => form.fields[ this.name ],
        size: () => this.table.dimensions,
        value: ( row, col ) => this.data[ row ][ col ]
    };

    this.init = async ( columns ) =>
    {
        this.data = [];
        this.table = new Table();
        this.element = this.table.element;
        this.table.row.define( await this.table.row.add( normalize( columns ) ) );
        this.source =
        {
            array: this.table.row.array,
            option: this.table.row.option
        };

        return true;
    };

    this.label = ( col, value ) => labels[ col ].innerText = value;

    Constructors.call( this );
}