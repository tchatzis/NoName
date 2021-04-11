DB.Forms = function()
{
    var scope = this;
    var ok = "formconfirm";
    var error = "formerror";
    var square = "\u2B1B ";
    var hash = "#";

    // public methods
    this.clear = () => scope.form.innerHTML = null;

    this.init = function( args )
    {            
        Object.assign( this, args );

        scope.uuid = uuid();
        scope.fields = [];
        scope.validate = [];
        scope.value = {};

        Form.call( this );
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

    function collapse( el )
    {
        el.classList.toggle( "formcollapsed" );
    }

    function dispatch( params )
    {
        var event = new CustomEvent( "validated", { detail: { field: this, params: params } } );

        this.element.dispatchEvent( event );
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
        var arr2 = Object.keys( scope.value ).sort();

        if ( arr1.length !== arr2.length ) return false;

        for ( var i = 0; i < arr1.length; i++ )
            if ( arr1[ i ] !== arr2[ i ] ) return false;

        return true;
    }

    function validate( field )
    {
        const is =
        {
            color: () => field.value.match( /#[a-f0-9]{6}$/gi ),
            date: () => true, // TODO: validate date
            datalist: () => is.text(),
            defined: () => typeof field.value !== "undefined",
            hidden: () => is.populated(),
            list: () => is.text(),
            notnull: () => field.value !== null,
            number: ( value ) => typeof Number( value ) == "number" && !isNaN( Number( value ) ),
            populated: () => field.value !== "" && is.notnull() && is.defined(),
            readonly: () => is.populated(),
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


    // private classes
    function Form()
    {
        var div = document.createElement( "div" );
            div.innerText = this.title;
            div.classList.add( "formtitle" );
            div.addEventListener( "click", () => collapse( this.form ), false );
        var existing = document.querySelector( `[ data-form = "${ this.name }" ]` );

        this.form = existing || document.createElement( "div" );
        this.form.innerHTML = null;
        this.form.classList.add( "form" );
        this.form.appendChild( div );
        this.form.setAttribute( "data-form", this.name || this.title );

        var state = function()
        {
            // collapsed
            if ( this.collapsed )
                this.form.classList.add( "formcollapsed" );
            else
                this.form.classList.remove( "formcollapsed" );
            // hidden
            if ( this.hidden )
                this.form.classList.add( "hide" );
            else
                this.form.classList.remove( "hide" );
        }.bind( this );

        state();

        if ( !this.parent )
            Popup.call( this );

        if ( !existing )
            this.parent.appendChild( this.form );

        this.message = new Message();
        this.message.init();

        this.update = ( args ) =>
        {
            for ( let key in args )
                if ( args.hasOwnProperty( key ) )
                    this[ key ] = args[ key ];

            state();
        }
    }

    function Label()
    {
        this.labeling = document.createElement( "div" );
        this.labeling.classList.add( "formlabel" );
        this.labeling.innerHTML = String( this.label ) ? this.label : "<br>";

        var div = document.createElement( "div" );
            div.classList.add( "formcolumn" );

            div.appendChild( this.labeling );
            div.appendChild( this.element );

        var el = ( this.hidden || this.element.type == "hidden" ) ? this.element : div;

        this.parent.appendChild( el );

        this.labeler = ( label ) =>
        {
            this.labeling.innerHTML = label;

            if ( !String( label ) )
                this.labeling.remove();
        };
    }

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
        };

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

    function Popup()
    {
        this.destroy = () => this.parent.remove();

        var close = document.createElement( "div" );
            close.classList.add( "formswitch" );
            close.classList.add( "formright" );
            close.innerText = "x";
            close.addEventListener( "click", this.destroy, false );

        var bar = document.createElement( "div" );
            bar.appendChild( close );

        this.form.prepend( bar );

        var popup = document.querySelector( `[ data-popup = "${ this.name }" ]` ) || document.createElement( "div" );
            popup.setAttribute( "data-popup", this.name );
            popup.classList.add( "popup" );
            popup.style.maxHeight = "100vh";

        document.body.appendChild( popup );

        this.parent = popup;
        this.x = 0;
        this.y = 0;

        this.popup = ( target ) =>
        {
            var abox = target.getBoundingClientRect();
            var bbox = popup.getBoundingClientRect();
            var x = abox.left + abox.width;
            var y = abox.top + abox.height;
            var left = x <= window.innerWidth ? x - ( abox.width + bbox.width ) : window.innerWidth - x;
            var top = Math.min( Math.max( 0, y - bbox.height ), window.innerHeight - bbox.height );

            this.x = left;
            this.y = top;

            this.position();
        };

        this.position = () =>
        {
            var px = "px";

            popup.style.left = this.x + px;
            popup.style.top = this.y + px;
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
            break;

            case "controls":
                Controls.call( this );
            break;

            case "datalist":
                DataList.call( this );
            break;

            case "list":
                List.call( this );
            break;

            case "select":
                Select.call( this );
            break;

            case "toggle":
                Toggle.call( this );
            break;

            case "tree":
                Tree.call( this );
            break;

            case "vector":
                Vector.call( this );
            break;

            case "vertical":
                Vertical.call( this );
            break;
        }

        // events
        switch( this.type )
        {
            case "array":
            case "vertical":
                // event handlers for arrays are set per item
            break;

            default:
                this.handlers.forEach( type =>
                {
                    this.element.removeEventListener( type.event, type.handler, false )
                    this.element.addEventListener( type.event, type.handler, false );
                } );
            break;
        }

        // hidden
        if ( this.hidden === true )
            this.element.parentNode.classList.add( "hide" );

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
        
        // update value of instance and element
        switch( this.type )
        {
            case "color":
            case "toggle":
            case "tree":
            case "vector":
            break;

            default:
                this.update = ( value ) =>
                {
                    this.value = value;
                    this.element.value = value;
                };
            break;
        }
        
        this.validate = () => validate( this );
    }

    function Arrays()
    {
        var field = this;
        var handlers = {};
        var dragged;

        this.element = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
        this.element.classList.add( "formarray" );
        this.element.setAttribute( "data-uuid", scope.uuid );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "placeholder", this.label );

        Label.call( this );

        this.handlers.forEach( type =>
        {
            handlers[ type.event ] = type.handler;
        } );

        this.refresh = ( params ) => this.data.source.getter( params, ( response ) =>
        {
            this.fields = [];
            this.element.innerHTML = null;

            var data = response.data;
                data.forEach( ( value, i ) =>
                {
                    var args = { name: i, label: i, value: value, data: data, drop: true,
                        buttons: [ { icon: "-", action: remove, title: "remove" } ],
                        handlers: [ { event: "input", handler: handlers.change } ] };

                    this.fields.push( row.call( this, args ) );
                } );

            // add field
            var args = { name: data.length, label: "add", value: { ...this.value }, data: data, buttons: [ { icon: "+", action: add, title: "add" } ] };
            this.fields.push( row.call( this, args ) );
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

            if ( handlers.delete )
                handlers.delete( { detail: args } );
        }

        function row( args )
        {
            args.parent = document.createElement( "div" );
            args.parent.setAttribute( "data-index", args.name );
            args.parent.classList.add( "formhighlight" );
            args.parent.addEventListener( "mouseover", () => mouseover( { index: Number( args.name ), value: args.data[ args.name ] } ), false );
            args.parent.addEventListener( "mouseout", () => mouseout( { index: Number( args.name ), value: args.data[ args.name ] } ), false );
            if ( args.drop )
            {
                args.parent.setAttribute( "draggable", true );
                args.parent.addEventListener( "dragstart", ( event ) => dragstart( event, args.name ), false );
                args.parent.addEventListener( "dragover", dragover, false );
                args.parent.addEventListener( "drop", drop, false );
            }

            Object.assign( args, this.data.field );

            var field = new Field( args );

            var controls = Object.assign( {}, args );
                controls.type = "controls";
            new Field( controls );

            this.element.appendChild( args.parent );

            return field;
        }

        function mouseover( args )
        {
            if ( handlers.mouseover )
                handlers.mouseover( args );
        }

        function mouseout( args )
        {
            if ( handlers.mouseout )
                handlers.mouseout( args );
        }

        function dragstart( event )
        {
            if ( event.target.hasAttribute( "draggable" ) )
            {
                event.dataTransfer.dropEffect = "move";
                dragged = event.target;
            }
            else
                event.preventDefault();
        }

        function dragover( event )
        {
            event.preventDefault();
        }

        function drop( event )
        {
            event.preventDefault();

            var dropped = event.target;

            // find the drop element
            while ( !dropped.hasAttribute( "draggable" ) )
                dropped = dropped.parentNode;

            var parent = dropped.parentNode;
                parent.insertBefore( dragged, dropped );

            if ( handlers.drop )
                handlers.drop( { dragged: dragged, dropped: dropped, field: field, parent: parent } );

            // reset the indices
            parent.childNodes.forEach( ( child, i ) => child.setAttribute( "data-index", i ) );
        }
    }

    function Color()
    {
        var hex = () => `${ hash }${ this.value.replace( hash, "" ) || Math.floor( Math.random() * 16777215 ).toString( 16 ) }`;
        var color = hex();
        var value = `${ square }${ color }`;
        var field = this;
            field.value = color;

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.value = value;
        this.element.style.color = color;
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "text" );
        this.element.setAttribute( "value", color );
        this.element.setAttribute( "placeholder", this.label );
        this.element.setAttribute( "maxlength", 9 );
        this.element.setAttribute( "size", 6 );
        this.element.setAttribute( "spellcheck", false );
        this.element.addEventListener( "input", function()
        {
            field.value = this.value;
            this.style.color = this.value.replace( square, "" );
            validate( field );
        }, false );

        Label.call( this );

        this.update = ( value ) =>
        {
            var color = value || hex();

            this.value = color;
            this.element.value = `${ square }${ color }`;
            this.element.style.color = color;
        };
    }

    function Controls()
    {
        this.element = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
        this.element.classList.add( "formcolumn" );
        this.element.setAttribute( "data-uuid", scope.uuid );
        this.element.setAttribute( "name", this.name );

        Label.call( this );
        this.labeler( "<br>" );

        this.buttons.forEach( button =>
        {
            var div = document.createElement( "div" );
                div.innerText = button.icon;
                div.classList.add( "formbutton" );
                div.setAttribute( "title", button.title );
                div.addEventListener( "click", () => button.action( this ) );
            if ( button.disabled )
                div.classList.add( "formdisabled" );

            button.element = div;
            this.element.appendChild( div );
        } );
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
        this.element.addEventListener( "click", () => this.update( "" ), false );
        this.element.addEventListener( "input", function()
        {
            list.value = this.value;
            validate( list );
        }, false );

        Label.call( this );

        var items = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "datalist" );
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

        Label.call( this );
    }

    function List()
    {
        var handlers = {};

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "hidden" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.label );

        Label.call( this );

        this.handlers.forEach( type =>
        {
            handlers[ type.event ] = type.handler;
        } );

        var items = this.parent.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "list" );
            items.setAttribute( "data-name", this.name );

        this.parent.appendChild( items );

        var state = function( label, value )
        {
            var spans = items.querySelectorAll( "span" )
                spans.forEach( span => span.classList.remove( "formselected" ) );

            if ( this.value == value )
                label.classList.add( "formselected" );
        }.bind( this );

        var render = function()
        {
            items.innerHTML = null;

            var params = this.data.source.params;
            var data = ( params.value ) ? params.data.filter( item => item[ params.key ] == params.value ) : params.data;
                data.forEach( obj =>
                {
                    var i = 0;
                    var keys = Object.keys( obj );
                        keys.sort();
                        keys.forEach( key =>
                        {
                            var value = obj[ key ];

                            if ( key !== params.key )
                            {
                                let label = document.createElement( "span" );
                                    label.innerText = key;
                                    label.addEventListener( "click", ( e ) =>
                                    {
                                        e.stopPropagation();

                                        this.update( key )

                                        state( label, key );

                                        if ( handlers.click )
                                            handlers.click( { detail: { data: value, field: this, item: item } } );
                                    }, false );
                                    label.addEventListener( "mouseover", () =>
                                    {
                                        if ( handlers.mouseover )
                                            handlers.mouseover( this, key );
                                    }, false );
                                    label.addEventListener( "mouseout", () =>
                                    {
                                        if ( handlers.mouseout )
                                            handlers.mouseout( this, key );
                                    }, false );

                                let item = document.createElement( "div" );
                                    item.classList.add( "formitem" );
                                    item.classList.add( "formmax" );
                                    item.setAttribute( "data-index", i );
                                    item.setAttribute( "data-value", key );
                                    item.appendChild( label );

                                let args =
                                {
                                    name: "controls", label: "", type: "controls", value: "", parent: item,
                                    buttons:
                                    [
                                        { icon: "\u2205", action: () => handlers.reset( this, key ), title: "reset" },
                                        { icon: "-", action: () => handlers.delete( this, key ), title: "delete" }
                                    ],
                                    data: { output: false }
                                };

                                let controls = Object.assign( {}, args );
                                    controls.type = "controls";
                                let field = new Field( controls );
                                    field.labeler( "" );

                                items.appendChild( item );
                                i++;
                            }
                            else
                            {
                                // label
                                let item = document.createElement( "div" );
                                    item.innerText = value;
                                    item.classList.add( "formlabel" );

                                items.prepend( item );
                            }
                        } );
                } );

            // add
            var label = document.createElement( "span" );

            var valid = function()
            {
                var valid = validate( segment );
                var button = field.buttons.find( button => button.title == "add" );
                    button.disabled = !valid;

                if ( valid )
                    button.element.classList.remove( "formdisabled" );
                else
                    button.element.classList.add( "formdisabled" );
            };

            var input =
            {
                name: "segment", label: "add", type: "text", value: "", parent: label, required: true,
                data: { output: true, key: "name" },
                handlers: [ { event: "keyup", handler: valid } ]
            };

            var segment = new Field( input );

            var add = document.createElement( "div" );
                add.classList.add( "formmax" );
                add.appendChild( label );

            var controls =
            {
                name: "controls", label: "<br>", type: "controls", value: "", parent: add,
                buttons:
                [
                    { icon: "+", action: () => handlers.add( segment ), title: "add", disabled: true }
                ],
                data: { output: false }
            };

            var field = new Field( controls );

            items.appendChild( add );
        }.bind( this );

        this.refresh = ( params, callback ) =>
        {
            callback = callback || render;

            this.data.source.getter( params, ( response ) => callback( response, params ) );
        };

        this.state = ( value ) =>
        {
            var item = items.querySelector( `[ data-value = "${ value }" ]` );
            var label = item.querySelector( "span" );

            state( label, value );
        };

        this.refresh( this.data.source.params, render );
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

        this.element = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "select" );
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
                            scope.value[ field.name ] = field.value;
                        else
                            delete scope.value[ field.name ];
                    }
                    else
                    {
                        scope.value[ field.name ] = field.value;
                    }
                }
            } );

            if ( match() )
            {
                let params = this.data.destination.params;
                    params.value = scope.value;

                this.data.destination.setter( params, ( data ) =>
                {
                    Object.assign( params, data );
                    dispatch.call( this, params )
                } );
            }
        }, false );
    }
    
    function Toggle()
    {
        var field = this;
        var span = document.createElement( "span" );
            span.innerText = text( this.value );
            span.value = bool( this.value );
            span.addEventListener( "click", () =>
            {
                var index = field.data.source.findIndex( data => data.hasOwnProperty( text( field.value ) ) );
                    index = ( index + 1 ) % field.data.source.length;

                field.update( field.data.source[ index ] );
            } );

        function bool( value )
        {
            return Object.values( value )[ 0 ];
        }

        function text( value )
        {
            return Object.keys( value )[ 0 ];
        }

        function cls( value )
        {
            var val = Object.values( value )[ 0 ];
            var action = val ? "add" : "remove";

            span.classList[ action ]( "formselected" );
        }

        this.element = document.createElement( "div" );
        this.element.setAttribute( "placeholder", this.label );
        this.element.classList.add( "formitem" );
        this.element.appendChild( span );

        Label.call( this );

        cls( this.value );

        this.update = ( value ) =>
        {
            this.value = value;
            span.innerText = text( value );
            span.value = bool( value );
            cls( value );
        };
    }

    function Tree()
    {
        var tree = this;
        var handlers = {};

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
        
        Label.call( this );

        this.handlers.forEach( type =>
        {
            handlers[ type.event ] = type.handler;
        } );

        var items = this.parent.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
            items.innerHTML = null;
            items.classList.add( "formtree" );
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "tree" );
            items.setAttribute( "data-name", this.name );
        
        this.parent.appendChild( items );

        var state = function( label, value )
        {
            var spans = items.querySelectorAll( "span" )
                spans.forEach( span => span.classList.remove( "formselected" ) );

            if ( this.value == value )
                label.classList.add( "formselected" );
        }.bind( this );

        var render = ( response, params ) =>
        {
            var i = 0;
            var root;
            var data = response.data;
            var keys = data.map( obj => obj[ params.key ] );
                keys.sort();
                keys.forEach( ( key, i ) =>
                {
                    var obj = data.find( obj => obj[ params.key ] == key );

                    var parent = data.find( parent => parent[ params.key ] == obj.parent ) || {};
                        parent.children = [ ...parent.children || [], obj ];

                    if ( !obj.parent )
                        root = obj;
                } );

            /*for ( let k of keys )
            {
                console.log( k, data[ k ] );

                obj = data[ k ];

                console.log( k, data[ obj.parent ] );

                let parent = data[ obj.parent ];// || { name: obj.name, color: obj.color };
                    parent.children = [ ...parent.children || [], obj ];

                console.log( k, parent, parent.children, obj );

                if ( !obj.parent )
                    root = obj;
            }*/

            // add child
            function show( add )
            {
                add.classList.toggle( "hide" );
            }

            function expansion( args )
            {
                var children = args.ul.querySelectorAll( "ul" );
                    children.forEach( child =>
                    {
                        if ( child.getAttribute( "data-parent" ) == args.value )
                        {
                            child.classList.toggle( "hide" );
                            this.innerText = child.classList.contains( "hide" ) ? "+" : "-";
                        }
                    } );

                    params.value = args.expand;

                var event = new CustomEvent( "expansion", { detail: { field: this, breadcrumbs: args.breadcrumbs, params: params } } );
                tree.element.dispatchEvent( event );
            }

            function click( args )
            {
                var value = args.value;

                tree.update( value );

                state( args.label, value );

                params.data = response.data;
                params.value = value;
                params.visible = args.data.visible;

                // custom event passes breadcrumbs and params.data
                let event = new CustomEvent( "selection", { detail: { field: tree, breadcrumbs: args.breadcrumbs, params: params } } );
                tree.element.dispatchEvent( event );
            }

            function traverse( args )
            {
                var data = args.data;
                var value = data[ params.key ];
                var parent = args.parent;
                var breadcrumbs = [ ...args.breadcrumbs, value ];
                var level = args.level || 0;
                var index = args.index || 0;
                var _i = i;

                // elements
                var icon = document.createElement( "div" );
                    icon.innerText = String.fromCodePoint( 8627 );
                    icon.classList.add( "formswitch" );
                    icon.setAttribute( "data-value", value );
                var label = document.createElement( "span" );
                    label.innerText = value;
                    label.classList.add( data.visible );
                    label.addEventListener( "click", ( e ) =>
                    {
                        e.stopPropagation();
                        click( { breadcrumbs: breadcrumbs, data: data, label: e.target, value: value } );
                    }, false );
                var item = document.createElement( "li" );
                    item.classList.add( "formitem" );
                    item.setAttribute( "data-index", _i );
                    item.setAttribute( "data-child", index );
                    item.setAttribute( "data-value", value );
                    item.appendChild( icon );
                    item.appendChild( label );
                var ul = items.querySelector( `[ data-parent = "${ data.parent }" ]` ) || document.createElement( "ul" );
                    ul.setAttribute( "data-parent", data.parent );
                    ul.appendChild( item );

                // toggle
                if ( data.hasOwnProperty( "children" ) )
                {
                    let args =
                    {
                        breadcrumbs: breadcrumbs,
                        expand: data.expand,
                        ul: ul,
                        value: value
                    };

                    icon.addEventListener( "click", () => expansion.call( icon, args ), false );
                }
                else
                {
                    icon.style.pointerEvents = "none";
                    icon.style.border = "1px solid transparent";
                }
                // add field
                if ( handlers.add )
                {
                    // new child ( toggled )
                    let add = document.createElement( "li" );
                        add.classList.add( "formadd" );
                        add.classList.add( "hide" );
                    let icon = document.createElement( "div" );
                        icon.innerText = String.fromCodePoint( 8627 );
                        icon.classList.add( "formswitch" );
                        icon.style.pointerEvents = "none";
                        icon.style.border = "1px solid transparent";
                    let input = document.createElement( "input" );
                        input.setAttribute( "size", 10 );
                        input.setAttribute( "name", value );
                        input.setAttribute( "type", "text" );
                        input.setAttribute( "placeholder", `add child to ${ value }` );
                    let action = document.createElement( "div" );
                        action.innerText = "+";
                        action.classList.add( "formbutton" );
                        action.setAttribute( "title", `add child to ${ value }` );
                        action.addEventListener( "click", () =>
                        {
                            params.data = response.data;
                            params.value = value;

                            tree.value = input.value;
                            tree.element.value = input.value;
                            handlers.add( { field: tree, breadcrumbs: breadcrumbs, params: params } );
                        }, false  );

                    add.appendChild( icon );
                    add.appendChild( input );
                    add.appendChild( action );
                    ul.appendChild( add );

                    // add child button ( showing )
                    let button = document.createElement( "div" );
                        button.innerText = String.fromCodePoint( 8627 );
                        button.classList.add( "formbutton" );
                        button.setAttribute( "title", `add child to ${ value }` );
                        button.addEventListener( "click", () => show( add, ul, value ), false );

                    item.appendChild( button );
                }

                if ( !data.expand )
                    ul.classList.add( "hide" );

                if ( args.expand )
                    ul.classList.remove( "hide" );

                state( label, value );

                parent.appendChild( ul );

                level++;
                i++;

                // reiterate
                if ( data.hasOwnProperty( "children" ) )
                {
                    icon.innerText = data.expand ? "-" : "+";

                    data.children.forEach( ( child, index ) =>
                    {
                        var args =
                        {
                            data: child,
                            parent: ul,
                            breadcrumbs: breadcrumbs,
                            expand: data.expand,
                            level: level,
                            index: index
                        };

                        traverse( args );
                    } );
                }
            }

            // clear the element
            items.innerHTML = null;

            // start the iteration
            if ( root )
            {
                let args =
                {
                    data: root,
                    parent: items,
                    breadcrumbs: [],
                    expand: data.expand
                };

                traverse( args );
            }
        };

        this.refresh = ( params, callback ) => this.data.source.getter( params, ( response ) => callback( response, params ) );
        this.refresh( this.data.source.params, render );

        this.state = ( value ) =>
        {
            var item = items.querySelector( `[ data-value = "${ value }" ]` );
            var label = item.querySelector( "span" );

            state( label, value );
        };

        this.update = ( value ) =>
        {
            this.value = value;
            this.element.value = value;
        };
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
                            scope.value[ field.name ] = field.value;
                        else
                            delete scope.value[ field.name ];
                    }
                    else
                    {
                        scope.value[ field.name ] = field.value;
                    }
                }
            } );

            if ( match() )
            {
                let params = this.data.destination.params;
                    params.value = scope.value;

                dispatch.call( this, params );
            }
        }, false );
    }

    function Vector()
    {
        var vector = this;

        if ( this.value )
        {
            let axes = Object.keys( this.value ).sort();

            this.element = document.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
            this.element.setAttribute( "data-uuid", scope.uuid );
            this.element.setAttribute( "data-name", this.name );
            this.element.setAttribute( "placeholder", this.label );
            this.components = [];

            axes.forEach( axis =>
            {
                var label = document.createElement( "div" );
                    label.classList.add( "formkey" );
                    label.innerText = axis;
                var input = document.createElement( "input" );
                    input.setAttribute( "name", axis );
                    input.setAttribute( "type", "number" );
                    input.setAttribute( "value", this.value[ axis ] );
                    input.addEventListener( "input", function()
                    {
                        vector.value[ axis ] = Number( this.value );
                        validate( vector );
                    }, false );

                this.components.push( input );
                this.element.appendChild( label );
                this.element.appendChild( input );
            } );

            Label.call( this );
        }

        this.update = ( value ) =>
        {
            Object.keys( value ).forEach( axis =>
            {
                this.value[ axis ] = value[ axis ];

                var input = this.components.find( input => input.name == axis );
                    input.value = value[ axis ];
            } );
        }
    }

    function Vertical()
    {
        var handlers = {};

        this.required = true;

        this.element = document.createElement( "input" );
        this.element.setAttribute( "name", this.name );
        this.element.setAttribute( "type", "hidden" );
        this.element.setAttribute( "value", this.value );
        this.element.setAttribute( "placeholder", this.label );

        Label.call( this );

        this.handlers.forEach( type =>
        {
            handlers[ type.event ] = type.handler;
        } );

        var items = this.parent.querySelector( `[ data-name = "${ this.name }" ][ data-uuid = "${ scope.uuid }" ]` ) || document.createElement( "div" );
            items.setAttribute( "data-uuid", scope.uuid );
            items.setAttribute( "data-maps", "vertical" );
            items.setAttribute( "data-name", this.name );

        this.parent.appendChild( items );

        var state = function( item, value )
        {
            items.childNodes.forEach( element => element.classList.remove( "formselected" ) );

            if ( this.value == value )
                item.classList.add( "formselected" );
        }.bind( this );

        var render = function()
        {
            items.innerHTML = null;

            var params = this.data.source.params;
            var data = ( params.value ) ? params.data.filter( item => item[ params.key ] == params.value ) : params.data;
                data.forEach( obj =>
                {
                    var keys = Object.keys( obj );
                        keys.sort();
                        keys.forEach( ( key, i ) =>
                        {
                            var value = obj[ key ];

                            if ( key !== params.key )
                            {
                                let item = document.createElement( "div" );
                                    item.innerText = key;
                                    item.classList.add( "formlink" );
                                    item.setAttribute( "data-index", i );
                                    item.setAttribute( "data-value", key );
                                    item.addEventListener( "click", () =>
                                    {
                                        this.update( key )
                                        this.data = value;

                                        state( item, key );

                                        if ( handlers.click )
                                            handlers.click( { detail: { data: value, field: this, item: item } } );
                                    } );

                                items.appendChild( item );
                            }
                            else
                            {
                                let item = document.createElement( "div" );
                                    item.innerText = value;
                                    item.classList.add( "formlabel" );

                                items.prepend( item );
                            }
                        } );
                } );
        }.bind( this );

        this.refresh = ( params, callback ) => this.data.source.getter( params, ( response ) => callback( response, params ) );
        this.refresh( this.data.source.params, render );
    }
};