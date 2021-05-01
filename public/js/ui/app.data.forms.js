import { Container } from './modules/form.container.js';

DB.Forms = function( args )
{
    args.form = this;

    this.container = new Container( args );

    this.fields = {};

    // TODO: clear this crap out
    /*function Form()
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
    }*/

    /*function Message()
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
    }*/

    /*function Popup()
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
    }*/

    /* tbr
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
    }*/
};