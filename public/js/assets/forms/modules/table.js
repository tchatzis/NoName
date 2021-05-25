import { Utilities } from './utilities.js';
import { Field } from './field.js';

const Table = function( config )
{
    var table = this;
    var names = [];
    var defaults = {};
    var data = {};
    var cells = {};
    var promises = [];
    var dnd = new DnD();
    var row = new RowMethods();
    var schema = new Schema();
    var stack = new Stack();

    // get table properties and data
    Data.call( this );

    // public methods
    this.add = row.add;
    this.delete = row.delete;
    this.define = config.vertical ? stack.add : schema.add;
    this.element = Utilities.create( "table-form" );
    this.next = {};

    // called from DnD.drop()
    // called from RowMethods.delete()
    function renumber()
    {
        var rows = table.get.size().rows;

        for ( let i = 1; i <= rows; i++ )
        {
            let element = table.element.children[ i ];
            let autonumber = element.querySelector( ".table-number" );
            let index = i - config.autonumber;

            if ( element.hasAttribute( "data-row" ) )
                element.setAttribute( "data-row", String( index ) );

            if ( index && autonumber )
                autonumber.innerText = index;
        }
    }

    // called from DnD.drop()
    function reorder( drag, drop, shift )
    {
        var current =
        {
            cells: cells,
            data: data
        };

        var temp =
        {
            cells: {},
            data: {}
        };

        for ( let index in data )
        {
            Object.keys( current ).forEach( name =>
            {
                let c = { ...current[ name ][ index ] };

                if ( index == drag )
                {
                    temp[ name ][ drop ] = c;
                    //console.error( index, "dropped and renumbered to", drop );
                }
                else if ( index >= drop && index < drag )
                {
                    temp[ name ][ Number( index ) + shift ] = c;
                    //console.warn( index, shift, "renumbered to", Number( index ) + shift );
                }
                else if ( index <= drop && index >= drag )
                {
                    temp[ name ][ Number( index ) + shift ] = c;
                    //console.warn( index, shift, "renumbered to", Number( index ) + shift );
                }
                else
                {
                    temp[ name ][ index ] = c;
                    //console.log( index, "unchanged" );
                }
            } );
        }

        cells = temp.cells;
        data = temp.data;
    }

    function CellElement()
    {
        this.element = Utilities.create( "table-cell" );
        if ( config.border )
            this.element.classList.add( "table-border" );

        CellMethods.call( this );
    }

    function CellMethods()
    {
        // private functions
        Object.defineProperty( this, "field",
        {
            enumerable: false,
            value: async( args ) =>
            {
                var field = new Field( args.option );
                await field.init();
                var selected = field.source?.key ? field.selected[ field.source.key ] : field.selected.value;

                this.element.appendChild( field.element );

                cells[ args.index ][ args.option.name ].field = field;
                cells[ args.index ][ args.option.name ].selected = field.selected;
                cells[ args.index ][ args.option.name ].value = selected;

                field.index = args.index;
                field.table = table;
                field.update( field.value.clone() );
                Object.assign( field.settings, args.settings );

                // get the default value
                if ( !args.index && field.required )
                    defaults[ args.option.name ] = field.value.value;
                else
                    data[ args.index ][ args.option.name ] = selected;

                // validate the default value
                field.validate();

                return args;
            }
        } );

        Object.defineProperty( this, "listen",
        {
            enumerable: false,
            value: ( type, handler ) => this.element.addEventListener( type, handler, false )
        } );

        Object.defineProperty( this, "parent",
        {
            enumerable: false,
            value: ( parent ) =>
            {
                if ( parent )
                    return parent.appendChild( this.element );
                else
                    return this.element.parentNode;
            }
        } );

        // hooks
        this.css = ( action, css ) =>
        {
            this.element.classList[ action ]( css );
        };

        // outputs
        this.divider = ( args ) => new Promise( ( resolve ) => resolve( args ) );

        this.json = ( args ) =>
        {
            var re = new RegExp( args.settings.delim, 'g' );
            var span = document.createElement( "div" );
                span.innerText = JSON.stringify( args.option.value ).replace( re, `${ args.settings.delim }\n` );

            this.element.appendChild( span );
            this.element.classList.add( "pre" );

            return true;
        };

        this.number = ( args ) =>
        {
            var cell = () =>
            {
                this.element.innerText = args.option.value;
                this.element.classList.add( "table-number" );

                return args;
            };

            return new Promise( ( resolve ) => resolve( cell() ) );
        };

        this.pre = ( args ) =>
        {
            this.element.innerText = args.option.value;
            this.element.classList.add( "pre" );

            return true;
        };

        this.text = ( args ) =>
        {
            var cell = () =>
            {
                this.element.innerText = args.option.value;
                this.element.classList.add( "table-text" );

                return args;
            };

            return new Promise( ( resolve ) => resolve( cell() ) );
        };
    }

    // getters / setters / methods
    function Data()
    {
        this.get =
        {
            cell: ( index, name ) => cells[ index ][ name ].cell,
            column: ( name ) =>
            {
                var values = [];

                for ( let index in cells )
                    if ( cells[ index ][ name ] && Number( index ) )
                        values.push( cells[ index ][ name ].value );

                return { [ name ]: values };
            },
            columns: () => names,
            data: () =>
            {
                if ( config.vertical )
                    for ( let index in data )
                        return data[ index ];

                var values = [];

                for ( let index in cells )
                    if ( Number( index ) )
                        values.push( this.get.values( index ) );

                return values;
            },
            element:
            {
                cell: ( index, name ) => this.get.cell( index, name ).element,
                row: ( index ) => table.element.querySelector( `[ data-row="${ index }" ]` )
            },
            field: ( index, name ) => cells[ index ][ name ].field,
            next: () => table.next,
            row: ( index ) => cells[ index ],
            size: () => { return { cols: names.length, rows: Object.keys( cells ).length } },
            value: ( index, name ) => cells[ index ][ name ].field.selected.value,
            values: ( index ) =>
            {
                var values = {};

                for ( let name in data[ index ] )
                    values[ name ] = data[ index ][ name ];

                return values;
            }
        };
        
        this.highlight = ( index ) =>
        {
            var element = table.get.element.row( index );
                element.classList.add( "table-highlight" );

            setTimeout( () => element.classList.remove( "table-highlight" ), 2000 );
        };

        this.lock = ( index ) =>
        {
            var element = table.get.element.row( index );
                element.removeAttribute( "draggable" );
                element.classList.add( "table-disabled" );
                element.classList.remove( "table-hover" );
        };

        this.populate = async ( source ) =>
        {
            if ( config.vertical )
                return;

            var data = await app.getters[ source.type ]( source );
                data.data.forEach( values => { table.next = values; this.add() } );

            return true;
        };

        this.set =
        {
            cells: ( args ) =>
            {
                cells[ args.index ][ args.name ] =
                {
                    cell: args.cell,
                    silent: !!args.silent,
                    value: args.value
                };

                // only if controls are true
                if ( row.state )
                    cells[ args.index ][ args.name ].state = row.state;
            },

            next: ( name, value ) => this.next[ name ] = value,

            property: ( name, value ) => this[ name ] = value
        };

        this.test = ( index, name ) =>
        {
            console.log( "cell", table.get.cell( index, name ) );
            console.log( "column", table.get.column( name ) );
            console.log( "columns", table.get.columns() );
            console.log( "data", table.get.data() );
            console.log( "field", table.get.field( index, name ) );
            console.log( "row", table.get.row( index ) );
            console.log( "size", table.get.size() );
            console.log( "value", table.get.value( index, name ) );
            console.log( "values", table.get.values( index ) );
            console.log( "" );
        };

        this.unlock = ( index ) =>
        {
            var element = table.get.element.row( index );
                element.addAttribute( "draggable" );
                element.classList.remove( "table-disabled" );
                element.classList.add( "table-hover" );
        };

        this.update = ( index, values ) =>
        {
            for ( let name in values )
            {
                let field = cells[ index ][ name ].field;

                cells[ index ][ name ].value = values[ name ];
                field.update( { text: name, value: values[ name ] } );
                field.validate();
                field.validate.row();
            }
        };

        this.visible = ( index, name, bool ) =>
        {
            var visibility = bool ? "visible" : "hidden";
            var element = this.get.element.cell( index, name );
                element.style.visibility = visibility;
        };
    }

    function DnD()
    {
        this.allow = ( e ) =>
        {
            e.preventDefault();
        };

        this.start = ( e ) => this.dragging = Utilities.bubble( e.target, "table-row" );

        this.drop = ( e ) =>
        {
            e.preventDefault();

            this.dropzone = Utilities.bubble( e.target, "table-row" );

            var drag = this.dragging.getAttribute( "data-row" );
            var drop = this.dropzone.getAttribute( "data-row" );
            var shift = drag > drop ? 1 : -1;
            var element = drag > drop ? this.dropzone : this.dropzone.nextSibling;

            this.dropzone.parentNode.insertBefore( this.dragging, element );

            reorder( drag, drop, shift );
            renumber();
        };
    }

    function RowElement()
    {
        this.element = Utilities.create( "table-row" );
        if ( config.hover )
            this.element.classList.add( "table-hover" );
        this.element.setAttribute( "data-row", this.index );
        
        if ( this.index )
        {
            this.element.ondragover = dnd.allow;
            this.element.setAttribute( "draggable", true );
        }
        else if ( config.add )
           this.element.classList.add( "table-add" );

        this.element.ondrop = dnd.drop;
        this.element.ondragstart = dnd.start;
        table.element.appendChild( this.element );
    }

    function RowMethods()
    {
        this.add = () =>
        {
            if ( config.vertical )
            {
                Promise.all( promises ).then( res => { /*console.warn( "resolved", res )*/ } );
                return;
            }

            RowElement.call( this );

            var index = this.index;
            var element = this.element;
            var validated = [];

            cells[ index ] = {};

            if ( index )
                data[ index ] = {};

            schema.autonumber( this );

            var set = ( key, data ) =>
            {
                var value = table.next[ key ] || data.value;
                var copy = { ...data };
                    copy.name = key;
                    copy.type = data.type;
                    copy.value = value;  
                var cell = new CellElement();
                    cell.css( "add", "table-cell" );
                    cell.parent( element );
                // this is where the cell gets its content / field
                var promise = cell[ data.output ]( { index: index, option: copy, settings: { delim: data.delim } } );
                    promise.then( valid =>
                    {
                        validated.push( valid );

                        // enable / disable the control for default values
                        if ( this.state )
                            this.state( validated.every( bool => bool ) );

                        // set defaults to reset the "add" row
                        if ( index )
                            table.update( 0, defaults );
                    } );

                table.set.cells( { index: index, name: key, value: value, cell: cell, silent: !!data.silent } );
            };

            for ( let [ key, data ] of schema.columns )
                set( key, data );

            if ( config.controls )
                schema.controls();

            this.index++;
        };

        this.delete = ( element ) =>
        {
            var index = Number( element.getAttribute( "data-row" ) );
            var parent = Utilities.bubble( element, "table-row" );

            delete cells[ index ];
            delete data[ index ];
            parent.remove();
            renumber.call( this );

            this.index--;
            delete this;
        };

        this.index = 0;
    }

    function Schema()
    {
        var headings;

        // define the columns
        this.add = ( parameters ) =>
        {
            var key = parameters.name || parameters.type.toUpperCase();

            this.columns.set( key, parameters );

            names.push( key );

            var label = parameters.hasOwnProperty( "label" ) ? parameters.label : parameters.name;
            var headings = this.headings();
            var cell = new CellElement();
                cell.text( { index: null, option: { name: key, value: label } } );
                cell.css( "add", "table-heading" );
                cell.parent( headings );
        };

        this.autonumber = ( instance ) =>
        {
            if ( config.autonumber )
            {
                let cell = new CellElement();
                    cell.number( { index: null, option: { value: instance.index === 0 ? "\u27a4" : instance.index } } );
                if ( !instance.index )
                    cell.css( "add", "table-none" );

                instance.element.prepend( cell.element );

                if ( instance.map )
                    instance.map.set( "autonumber", { cell: cell, data: { name: "autonumber", value: instance.index } } );
            }
        };

        this.columns = new Map();

        this.controls = () =>
        {
            var button = row.index ? { text: "-", value: "delete", args: { table: table, index: row.index } } : { text: "+", value: "add", args: { table: table, index: row.index } };
            var cell = new CellElement();
                cell.text( { index: null, option: { name: button.value, value: button.text } } );
                cell.css( "add", "table-control" );
                cell.parent( row.element );
                cell.element.setAttribute( "data-row", row.index );
                cell.listen( "click", ( e ) =>
                {
                    if ( table.handlers[ button.value ] )
                        table.handlers[ button.value ]( button.args );

                    row[ button.value ]( e.target );
                } );

            // this will always be the button for the row, so a cell argument is not possible
            row.state = ( enabled ) =>
            {
                if ( enabled )
                    cell.element.classList.remove( "formdisabled" );
                else
                    cell.element.classList.add( "formdisabled" );
            };

            table.set.cells( { index: row.index, name: "ACTION", value: button.value, cell: cell, silent: true } );

            return cell.element;
        };

        this.headings = () =>
        {
            if ( !headings )
            {
                headings = Utilities.create( "table-row" );
                schema.autonumber( { element: headings, index: "" } );
            }

            headings.setAttribute( "data-headings", "" );
            headings.classList.add( "table-headings" );

            table.element.appendChild( headings );

            return headings;
        };
    }
    
    function Stack()
    {
        var index = 0;
        var _row = 0;
        cells[ index ] = {};
        data[ index ] = {};

        // add row
        this.add = ( parameters ) =>
        {
            var divider = parameters.output == "divider";
            var key = parameters.name || parameters.type.toUpperCase();
            var label = parameters.hasOwnProperty( "label" ) ? parameters.label : parameters.name;
            var copy = { ...parameters };
                copy.name = key;
                copy.type = parameters.type;
                copy.value = parameters.value;
            var row = Utilities.create( "table-row" );
                row.setAttribute( "data-row", _row );
            var title = new CellElement();
                title.text( { index: null, option: { name: key, value: label } } );
            if ( divider )
            {
                title.css( "add", "table-divider" );
                title.css( "remove", "table-border" );
                title.css( "remove", "table-cell" );
                title.css( "remove", "table-text" );
            }
            else
                title.css( "add", "table-heading" );
                title.parent( row );
            var cell = new CellElement();
                cell.css( "add", "table-cell" );
            if ( !divider )
                cell.parent( row );

            table.element.appendChild( row );

            cells[ index ][ key ] = { cell: cell };
            names.push( key );

            promises.push( cell[ parameters.output ]( { index: index, option: copy, settings: { row: _row, delim: parameters.delim } } ) );
            _row++;
        };
    }

    config.parent.appendChild( this.element );
};

export { Table };