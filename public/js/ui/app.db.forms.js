DB.Forms = function()
{
    var scope = this;
    var ok = "formconfirm";
    var error = "formerror";
    var square = "\u2B1B ";
    var hash = "#";

    // public methods
    this.clear = () => scope.form.innerHTML = null

    this.init = function( args )
    {            
        var div = document.createElement( "div" );
            div.innerText = args.title;
            div.classList.add( "formtitle" );

        scope.form = document.createElement( "div" );
        scope.form.classList.add( "form" );
        scope.form.appendChild( div );
        scope.uuid = uuid();
        scope.fields = [];
        scope.validate = [];
        scope.data = {};
        scope.message = new Message();
        scope.message.init();

        args.parent.appendChild( scope.form );
    };

    this.add = function( args )
    {
        var field = new Field( args );

        if ( field.data.output )
        {
            scope.fields.push( field );

            if ( field.required )
                scope.validate.push( field.name );
        }

        return field;
    };

    function callback( response )
    {
        console.warn( "callback", response );
    }

    // set the drag element and index
    function dragstart( event, index )
    {
        if ( event.target.hasAttribute( "draggable" ) )
        {
            event.dataTransfer.dropEffect = "move";
            scope.index = index;
            scope.dragElement = event.target;
        }
        else
            event.preventDefault();
    }

    // this is required for functionality
    function dragover( event )
    {
        event.preventDefault();
    }

    // this is where the db magic happens
    function drop( event, data, docs, callback )
    {
        event.preventDefault();

        // manipulate the DOM
        var items = event.target.parentNode;
            items.insertBefore( scope.dragElement, event.target );
        // the drag element's doc data
        var doc = docs[ scope.index ];

        // remove doc from docs
        docs.splice( scope.index, 1 );
        // insert doc before drop element's index
        docs.splice( data.meta.index, 0, doc );
        // update the index according to new DOM order
        docs.forEach( ( doc, i ) =>
        {
            var data = doc.data();
                data.meta = data.meta || {};
                data.meta.index = i;

            this.db.update( data, doc.ref.path, ( data ) => {} );
        } );

        // re-render the form
        callback();
    }

    function hex( string )
    {
        function hashCode()
        {
            var hash = 0;

            for ( let i = 0; i < string.length; i++ )
                hash = string.charCodeAt( i ) + ( ( hash << 5 ) - hash );

            return hash;
        }

        function intToRGB( string )
        {
            var c = ( string & 0x00FFFFFF )
                .toString( 16 )
                .toUpperCase();

            return "#" + "00000".substring( 0, 6 - c.length ) + c;
        }

        return intToRGB( hashCode() );
    }

    function ishex( value )
    {
        return value.length == 7 && !!value.match( /#[a-f0-9]{6}$/gi )
    }

    function remove( element )
    {
        element.parentNode.remove();
    }

    function space()
    {
        var space = document.createElement( "div" );
            space.classList.add( "break" );

        app.ui.modal.appendChild( space );
    }

    function uuid()
    {
        var dt = new Date().getTime();

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c )
        {
            var r = ( dt + Math.random() * 16 ) % 16 | 0;
            dt = Math.floor( dt / 16 );
            return ( c == 'x' ? r :( r & 0x3 | 0x8 ) ).toString( 16 );
        } );
    }

    function match()
    {
        var arr1 = scope.validate.sort();
        var arr2 = Object.keys( scope.data ).sort();
        if ( arr1.length !== arr2.length ) return false;

        for ( var i = 0; i < arr1.length; i++ )
            if ( arr1[ i ] !== arr2[ i ] ) return false;

        return true;
    }

    function validate( field )
    {
        const is =
        {
            color: () => field.value.length == 9 && !!field.value.match( /#[a-f0-9]{6}$/gi ),
            date: () => true, // TODO: validate date
            datalist: () => is.text(),
            defined: () => typeof field.value !== "undefined",
            hidden: () => is.populated(),
            list: () => is.text(),
            notnull: () => field.value !== null,
            number: ( value ) => typeof Number( value ) == "number" && !isNaN( Number( value ) ),
            populated: () => field.value !== "" && is.notnull() && is.defined(),
            select: () => is.text(),
            text: () => typeof field.value == "string" && is.populated(),
            tree: () => is.text(),
            vector: () => Object.keys( field.value ).every( axis => is.number( field.value[ axis ] ) )
        };

        var valid = is[ field.type ]();

        if ( !valid )
        {
            field.element.classList.add( "forminvalid" );
            field.element.focus();
            scope.message.add( field.name, `${ field.name } is not valid`, error, 10 );
        }
        else
        {
            field.element.classList.remove( "forminvalid" );
            scope.message.cancel();
        }

        return valid;
    }

    function wrap( element )
    {
        var heading = element.getAttribute( "placeholder" ) || "<br>";

        let label = document.createElement( "div" );
            label.classList.add( "formheading" );
            label.innerHTML = heading;

        let div = document.createElement( "div" );
            div.classList.add( "formcolumn" );

            div.appendChild( label );
            div.appendChild( element );

        return element.type == "hidden" ? element : div;
    }

    // private classes
    function Message()
    {
        this.add = ( name, message, status, delay ) =>
        {
            var existing = this.messages.querySelector( `[ data-name = "${ name }" ]` );

            this.div = existing || document.createElement( "div" );
            this.div.setAttribute( "data-name", name );
            this.div.innerText = message;
            this.div.classList.remove( "hide" );
            this.div.classList.add( status );

            if ( !existing )
                this.messages.appendChild( this.div );

            this.hide( delay );
        };

        this.cancel = () =>
        {
            clearTimeout( this.timeout );
            this.timeout = null;
            this.remove();
        };

        this.hide = ( delay ) =>
        {
            delay = delay || 5;

            this.timeout = setTimeout( ()=>
            {
                this.remove();
            }, delay * 1000 );
        }

        this.remove = () =>
        {
            if ( this.div )
                this.div.remove();
        };

        this.init = () =>
        {
            this.messages = document.createElement( "div" );
            this.messages.classList.add( "formmessages" );

            scope.form.appendChild( this.messages );
        };
    }

    // field definitions
    function Field( args )
    {
        // defaults
        Object.assign( this, args );

        this.parent = this.parent || scope.form;
        this.handlers = this.handlers || [];

        // display
        switch( this.type )
        {
            case "array":
                Arrays.call( this );
            break;

            case "button":
            case "date":
            case "hidden":
            case "validate":
            case "number":
            case "readonly":  
            case "submit":
            case "text":
                Input.call( this );
            break;

            case "color":
                Color.call( this );
            break

            case "datalist":
                DataList.call( this );
            break

            case "list":
                List.call( this );
            break

            case "select":
                Select.call( this );
            break

            case "tree":
                Tree.call( this );
            break

            case "vector":
                Vector.call( this );
            break;
        }

        // events
        this.handlers.forEach( type => this.element.addEventListener( type.event, type.handler, false ) );

        // process
        switch( this.type )
        {
            case "validate":
                Validate.call( this );
            break;

            case "submit":
                Submit.call( this );
            break;
        }
    }

    function Arrays()
    {
        var field = this;
        var handlers = {};

        this.handlers.forEach( item =>
        {
            handlers[ item.event ] = item.handler;
        } );

        this.element = document.querySelector( `[ data-uuid = "${ scope.uuid } ]"` ) || document.createElement( "div" );
        this.element.classList.add( "formarray" );
        this.element.setAttribute( "data-uuid", scope.uuid );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.label );
        this.parent.appendChild( wrap( this.element ) );

        this.refresh = ( params ) => this.data.source.getter( params, ( response ) =>
        {
            this.element.innerHTML = null;

            var data = response.data;

            if ( data )
                data.forEach( ( value, i ) =>
                {
                    var args = { name: i, label: i, value: value, data: data, icon: "-", action: remove, params: params };
                    row.call( this, args );
                } );

            // add field
            var args = { name: data.length, label: data.length, value: this.value, data: data, icon: "+", action: add, params: params };
            row.call( this, args );
        } );

        this.refresh( this.data.source.params );

        function add( args )
        {
            args.data.push( args.value );

            field.refresh( { data: args.data } );

            if ( handlers.add )
                handlers.add( { detail: args } );
        }

        function remove( args )
        {
            var index = args.data.findIndex( item => item == args.value );

            args.data.splice( index, 1 );

            field.refresh( { data: args.data } );

            if ( handlers.remove )
                handlers.remove( { detail: args } );
        }

        function row( args )
        {
            args.parent = document.createElement( "div" );
            args.parent.setAttribute( "data-index", args.name );

            Object.assign( args, this.data.field );
            console.log( args );

            new Field( args );
            new Controls( args );

            this.element.appendChild( args.parent );
        }
    }

    function Color()
    {
        var value = `${ square }${ hash }${ this.value || "FFFFFF" }`;
        var color = this;
            color.value = value;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.value = value;
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", value );
        this.element.setAttribute( "placeholder", this.label );
        this.element.setAttribute( "maxlength", 9 );
        this.element.setAttribute( "size", 6 );
        this.element.setAttribute( "spellcheck", false );
        this.element.addEventListener( "input", function()
        {
            color.value = this.value;
            this.style.color = this.value.replace( square, "" );
            validate( color );
        }, false );
        this.parent.appendChild( wrap( this.element ) );
    }

    function Controls( args )
    {
        this.button = document.createElement( "span" );
        this.button.innerText = args.icon;
        this.button.classList.add( "formbutton" );
        this.button.addEventListener( "click", () => args.action( args ) );
        args.parent.appendChild( this.button );
    }

    function DataList()
    {
        var list = this;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.label );
        this.element.setAttribute( "list", scope.uuid );
        this.element.setAttribute( "autocomplete", "off" );
        this.element.addEventListener( "input", function()
        {
            list.value = this.value;
            validate( list );
        }, false );
        this.parent.appendChild( wrap( this.element ) );

        var items = document.querySelector( `[ data-uuid = "${ scope.uuid } ]"` ) || document.createElement( "datalist" );
            items.innerHTML = null;
            items.setAttribute( "id", scope.uuid );
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "list" );
            items.setAttribute( "data-name", this.name );
            items.setAttribute( "placeholder", this.label );

            scope.form.appendChild( items );

        Options.call( this, items );
    }

    function Input()
    {
        var field = this;
        var type = this.type == "validate" ? "submit" : this.type;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.label );
        this.element.setAttribute( "type", type );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "autocomplete", "off" );
        if ( this.type == "readonly" )
            this.element.setAttribute( "readonly", "" );
        this.element.addEventListener( "input", function()
        {
            field.value = this.value;
            validate( field );
        }, false );
        this.parent.appendChild( wrap( this.element ) );
    }

    function List()
    {
        var list = this;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "hidden" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.label );

        var items = document.querySelector( `[ data-uuid = "${ scope.uuid } ]"` ) || document.createElement( "div" );
            items.innerHTML = null;
            items.style.textAlign = "left";
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "list" );
            items.setAttribute( "data-name", this.name );
            items.appendChild( this.element );

        scope.form.appendChild( wrap( items ) );
        space();

        this.refresh = ( params ) => this.data.source.getter( params, ( response ) =>
        {
            items.innerHTML = null;

            var columns = this.data.columns || [ this.name ];
                columns.forEach( column =>
                {
                    let heading = document.createElement( "div" );
                        heading.innerText = column;
                        heading.classList.add( "formheading" );
                        heading.style.display = "inline-block";
                        heading.style.width = "157px";

                    items.appendChild( heading );
                } );

            var data = this.data.source.map ? response.data[ this.data.source.map ] : response.data;

            data.forEach( ( object, i ) =>
            {
                var ordered = [];
                var row = document.createElement( "div" );
                    row.classList.add( "formitem" );
                    row.setAttribute( "data-index", i );

                // define border color
                var color = function( column, value )
                {
                    if ( column && value )
                        switch ( column.name )
                        {
                            case "color":
                                return ishex( value ) ? value : hex( value );

                            default:
                                return ishex( data[ value ].color ) ? data[ value ].color : hex( data[ value ].color );
                        }
                };

                // add rows and sort columns
                for ( let k in object )
                {
                    if ( object.hasOwnProperty( k ) )
                    {
                        let c = columns.findIndex( column => k == column );

                        if ( c > -1 )
                        {
                            ordered[ c ] = { name: k, value: object[ k ] };

                            items.appendChild( row );
                        }
                    }
                }

                // add handlers for row
                this.handlers.forEach( type => row.addEventListener( type.event, function()
                {
                    let event = new CustomEvent( type.event, { detail: { field: this, data: object, params: list.data.source.params } } );

                    type.handler( event );
                }, false ) );

                // render columns and data
                ordered.forEach( column =>
                {
                    let value = column.value || ""; //object[ column ]
                    let item = document.createElement( "div" );
                        item.innerText = value;
                        item.classList.add( "formlist" );
                        item.style.borderColor = color( column, value );
                        item.addEventListener( "click", function()
                        {
                            list.value = value;
                            list.element.value = value;
                        }, false );

                    row.appendChild( item );
                } );
            } );
        } );

        this.refresh( this.data.source.params );
    }

    function Options( parent, callback )
    {
        this.refresh = ( params ) => this.data.source.getter( params, ( response ) =>
        {
            var data = response.data;

            data.forEach( object =>
            {
                for ( let k in object )
                {
                    if ( object.hasOwnProperty( k ) && ( k == this.data.output || this.data.output === true ) )
                    {
                        // if output is not named use the key
                        let value = this.data.output === true ? k : object[ k ];
                        let item = document.createElement( "option" );
                            item.value = value;
                            item.text = value;

                        parent.appendChild( item );
                    }
                }
            } );

            if ( callback )
                callback( response.data );
        } );

        this.refresh( this.data.source.params );
    }

    function Select()
    {
        var select = this;

        this.required = true;

        this.element = document.querySelector( `[ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "select" );
        this.element.innerHTML = null;
        this.element.options = [];
        this.element.setAttribute( "id", scope.uuid );
        this.element.setAttribute( "data-uuid", scope.uuid );
        this.element.setAttribute( "data-name", this.name );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.label );
        this.element.addEventListener( "change", function()
        {
            select.value = this.options[ this.selectedIndex ].value;
            validate( select );
        }, false );
        this.parent.appendChild( wrap( this.element ) );

        Options.call( this, this.element,
            () =>
            {
                if ( this.element.selectedIndex < 0 )
                    this.element.selectedIndex = 0;

                this.value = this.element.options[ this.element.selectedIndex ].value;
                this.element.setAttribute( "value", this.value );
            } );
    }

    function Submit()
    {
        this.element.addEventListener( "click", () =>
        {
            scope.fields.forEach( field =>
            {
                if ( field.data.output )
                {
                    if ( field.required )
                    {
                        let valid = validate( field );

                        if ( valid )
                            scope.data[ field.name ] = field.value;
                        else
                            delete scope.data[ field.name ];
                    }
                    else
                    {
                        scope.data[ field.name ] = field.value;
                    }
                }
            } );

            if ( match() )
            {
                let params = this.data.destination.params;
                let event = new CustomEvent( "validated", { detail: { field: this, data: scope.data, params: params } } );

                this.data.destination.setter( params, scope.data, () =>
                {
                    this.element.dispatchEvent( event );
                } );
            }
        }, false );
    }

    function Tree()
    {
        var tree = this;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.label );
        this.element.setAttribute( "readonly", true );
        this.element.style.cursor = "pointer";
        this.element.addEventListener( "click", function()
        {
            items.classList.toggle( "formtreeexpand" );
        } );
        
        this.parent.appendChild( wrap( this.element ) );

        var items = this.parent.querySelector( `[ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
            items.innerHTML = null;
            items.classList.add( "formtree" );
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "tree" );
            items.setAttribute( "data-name", this.name );
        
        this.parent.appendChild( items );

        this.refresh = ( params ) => this.data.source.getter( params, ( response ) =>
        {
            var i = 0;
            var root;
            var data = app.utils.clone( response.data );
                data = params.map ? data[ params.map ] : data;

            // expand parent/name to tree data structure
            for ( let k in data )
            {
                if ( data.hasOwnProperty( k ) )
                {
                    let obj = data[ k ];

                    if ( !obj.parent )
                        root = obj;

                    let parent = data[ obj.parent ] || { name: obj.name, color: obj.color };
                        parent.children = [ ...parent.children || [], obj ];
                        parent.children.sort();
                }
            }

            var state = function( item, value )
            {
                items.querySelectorAll( ".formselected" ).forEach( item => item.classList.remove( "formselected" ) );

                if ( tree.value == value )
                    setTimeout( () => item.classList.add( "formselected" ), 500 );
            };

            var traverse = function( data, parent, path, level, index )
            {
                level = level || 0;
                index = index || 0;
                path = [ ...path, data.name ];

                var _i = i;
                var value = data[ tree.data.output ];
                var item = document.createElement( "li" );
                    item.classList.add( "formitem" );
                    item.innerText = value;
                    item.setAttribute( "data-index", _i );
                    item.setAttribute( "data-child", index );
                    item.setAttribute( "data-value", value );
                    item.addEventListener( "click", function()
                    {
                        tree.value = value;
                        tree.element.value = value;
                        state( this, value );
                        items.classList.remove( "formtreeexpand" );
                        
                        let event = new CustomEvent( "validated", { detail: { field: this, value: tree.value, params: { path: path, data: response.data, map: params.map } } } );
                        tree.element.dispatchEvent( event );
                    }, false );
                var ul = items.querySelector( `[ data-parent = "${ data.parent }" ]` ) || document.createElement( "ul" );
                    ul.setAttribute( "data-parent", data.parent );
                    ul.appendChild( item );

                state( item, value );

                parent.appendChild( ul );

                level++;
                i++;

                if ( data.hasOwnProperty( "children" ) )
                    data.children.forEach( ( child, index ) => traverse( child, ul, path, level, index ) );
            }.bind( this );

            items.innerHTML = null;

            if ( root )
                traverse( root, items, [] );
        } );

        this.refresh( this.data.source.params );
    }

    function Validate()
    {
        this.element.addEventListener( "click", () =>
        {
            scope.fields.forEach( field =>
            {
                if ( field.data.output )
                {
                    if ( field.required )
                    {
                        let valid = validate( field );

                        if ( valid )
                            scope.data[ field.name ] = field.value;
                        else
                            delete scope.data[ field.name ];
                    }
                    else
                    {
                        scope.data[ field.name ] = field.value;
                    }
                }
            } );

            if ( match() )
            {
                let params = this.data.destination.params;
                let event = new CustomEvent( "validated", { detail: { field: this, data: scope.data, params: params } } );

                this.element.dispatchEvent( event );
            }
        }, false );
    }

    function Vector()
    {
        var vector = this;
        var axes = Object.keys( this.value ).sort();

        this.element = document.createElement( "div" );
        this.element.setAttribute( "placeholder", this.label );

        axes.forEach( axis =>
        {
            var label = document.createElement( "div" );
                label.classList.add( "formlabel" );
                label.innerText = axis;
            var input = document.createElement( "input" );
                input.setAttribute( "type", "number" );
                input.setAttribute( "value", this.value[ axis ] );
                input.addEventListener( "input", function()
                {
                    vector.value[ axis ] = Number( this.value );
                    validate( vector );
                    console.log( scope.data );
                }, false );

            this.element.appendChild( label );
            this.element.appendChild( input );
        } );

        this.parent.appendChild( wrap( this.element ) );
    }
}