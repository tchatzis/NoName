import { Utils } from './form.utils.js';
import { Composite } from './form.composite.js';

export function Container( args )
{
    Object.assign( this, args );
    delete this.form;

    var scope = this;
    var form = args.form;
    var contents = Utils.create( "form-contents" );
    var container = Utils.create( "form-container" );
        container.appendChild( contents );
    var title = Utils.create( "formtitle" );
        title.innerText = this.title;
        title.addEventListener( "click", toggle, false );
    var element = Utils.create( "form-tabs" );
    var tabs = {};
    var data =
    {
        contents: {},
        elements: [],
        names: [],
        tabs: {}
    };

    this.parent = args.parent;
    this.element = Utils.create( "form" );
    this.element.appendChild( container );

    // add title
    if ( this.title )
        this.element.prepend( title );

    // collapse
    if ( this.collapsed )
    {
        container.classList.add( "hide" );
        title.classList.add( "formcollapsed" );
    }

    // do not add tabs
    if ( [ "box", "popup" ].every( format => this.format !== format ) )
        container.appendChild( element );

    if ( this.format !== "popup" )
        this.parent.appendChild( this.element );
    else
    {
        this.popup = new Popup( this.element );

        this.parent.appendChild( this.popup.element );
    }

    // private functions and constructors
    function toggle()
    {
        container.classList.toggle( "hide" );
        title.classList.toggle( "formcollapsed" );
    }

    function select()
    {
        for ( let i = 0; i < data.elements.length; i++ )
        {
            let tab = data.elements[ i ];
                tab.classList.remove( "form-tab-selected" );

            let content = data.contents[ tab.getAttribute( "data-name" ) ];
                content.classList.add( "hide" );

            if ( data.names[ i ].selected )
            {
                tab.classList.add( "form-tab-selected" );
                content.classList.remove( "hide" );
            }
        }
    }

    function Popup( form )
    {
        this.name = scope.title;

        var close = document.createElement( "div" );
            close.classList.add( "formswitch" );
            close.classList.add( "formright" );
            close.innerText = "x";
            close.addEventListener( "click", () => this.destroy(), false );

        var bar = document.createElement( "div" );
            bar.appendChild( close );

        form.prepend( bar );

        var popup = document.querySelector( `[ data-popup = "${ this.name }" ]` ) || document.createElement( "div" );
            popup.setAttribute( "data-popup", this.name );
            popup.classList.add( "popup" );
            popup.innerHTML = null;
            popup.appendChild( form );

        this.destroy = () => form.parentNode.remove();
        this.element = popup;
        this.x = 0;
        this.y = 0;

        // TODO: position popup
        /*this.init = () =>
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
        };*/
    }

    function Tab( args )
    {
        var click = function( name )
        {
            data.names.forEach( obj => obj.selected = false );

            var index = Number( tab.dataset.index );

            data.names[ index ].selected = true;

            scope.select( name );
        };

        var tab = element.querySelector( `[ data-name = "${ args.name }" ]` ) || Utils.create( "form-tab" );
            tab.innerText = args.name;
            tab.setAttribute( "data-name", args.name );
            tab.setAttribute( "data-index", data.elements.length );
            tab.onclick = () => click( args.name );

        var content = contents.querySelector( `[ data-name = "${ args.name }" ]` ) || Utils.create( "form-content" );
            content.setAttribute( "data-name", args.name );

        data.contents[ args.name ] = content;
        data.elements.push( tab );
        data.names.push( { name: args.name, child: !!args.child || !data.elements.length, selected: !!args.selected || data.elements.length == 1 } );
        data.tabs[ args.name ] = tab;

        if ( scope.format !== "box" )
            element.appendChild( tab );

        contents.appendChild( content );

        select();

        this.tab = tab;
        this.content = content;
    }

    // public methods
    this.add = ( args ) =>
    {
        var tab = new Tab( args );

        args.form = form;
        args.parent = tab.content;

        tabs[ args.name ] =
        {
            composite: new Composite( args ),
            name: args.name,
            elements: tab
        };

        form.composite = tabs[ args.name ].composite;
    };

    this.collapse = ( bool ) =>
    {
        this.collapsed = bool;

        if ( bool )
        {
            container.classList.add( "hide" );
            title.classList.add( "formcollapsed" );
        }
        else
        {
            container.classList.remove( "hide" );
            title.classList.remove( "formcollapsed" );
        }
    };

    this.remove =
    {
        children: () =>
        {
            var length = data.names.length - 1;

            data.names.forEach( ( tab, i ) =>
            {
                tab.selected = !tab.child;

                if ( tab.child )
                    this.remove.tab( tab );
                else
                    this.select( tab.name );
            } );

            // update names and elements arrays
            for ( let i = length; i > 0; i-- )
            {
                let tab = data.names[ i ];

                if ( tab.child )
                {
                    data.elements.splice( i, 1 );
                    data.names.splice( i, 1 );
                }
            }
        },

        form: () => form.remove(),

        popup: () => this.popup.destroy(),

        tab: ( tab ) =>
        {
            var name = tab.name || this.selected;

            // remove tab elements
            tabs[ name ].elements.tab.remove();
            tabs[ name ].elements.content.remove();

            // remove data
            delete data.contents[ name ];
            delete data.tabs[ name ];
            delete tabs[ name ];
            delete form.contents[ name ];
        }
    };

    this.select = ( name ) =>
    {
        data.names.map( tab => tab.selected = false );

        var tab = data.names.find( tab => tab.name == name );
            tab.selected = true;

        this.selected = name;

        form.composite = tabs[ name ].composite;

        select();
    };
}