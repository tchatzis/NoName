import { Utilities } from './utilities.js';

export function Container( config )
{
    var container = this;

    this.element = Utilities.create( "form-container" );
    this.element.classList.add( config.format );
    this.tabs = new TabMethods();
    this.tabs.map = new Map();
    this.contents = new ContentMethods();

    ContainerMethods.call( this );

    config.parent.appendChild( this.element );
    config.parent.classList.remove( "hide" );

    function ContainerMethods()
    {
        this.get =
        {
            element: ( title ) => this.tabs.get( title ).content.element
        };
    }

    function Content()
    {
        this.element = Utilities.create( "form-content" );
        this.element.classList.add( config.format );
    }

    function ContentMethods()
    {
        this.clear = ( title ) =>
        {
            select( title, ( data ) => data.content.element.innerHTML = null );
        };

        this.fetch = ( args ) =>
        {
            select( args.title, async ( data ) =>
            {
                var response = await fetch( args.url );
                var text = await response.text();
                var parser = new DOMParser();
                var html = parser.parseFromString( text, 'text/html' );
                var body = html.querySelector( "body" );

                data.content.element.innerHTML = body.innerHTML;
            } );
        };

        this.html = ( args ) =>
        {
            select( args.title, ( data ) => data.content.element.innerHTML = args.html );
        };

        this.text = ( args ) =>
        {
            select( args.title, ( data ) => data.content.element.innerText = args.text );
        }
    }

    function Popup( data )
    {
        var close = document.createElement( "div" );
            close.classList.add( "formswitch" );
            close.classList.add( "formright" );
            close.innerText = "x";
            close.addEventListener( "click", () => container.tabs.restore( data ), false );

        this.title = document.createElement( "div" );
        this.title.classList.add( "form-bar" );
        this.title.classList.add( "formselected" );
        this.title.appendChild( close );
        this.title.onmousedown = ( event ) => container.tabs.mousedown( event, this.element );

        this.element = Utilities.create( "popup" );
        this.element.classList.add( "form-popup" );
        this.element.appendChild( this.title );
        this.element.setAttribute( "draggable", true );

        config.parent.appendChild( this.element );
    }

    function PopupMethods()
    {
        var px = "px";

        this.create = ( data ) =>
        {
            data.tab.element.classList.remove( "form-tab" );

            var container = Utilities.bubble( data.tab.element, "form-container" );
            var popup = new Popup( data );
                popup.title.appendChild( data.tab.element );
                popup.element.appendChild( data.content.element );

            position.call( this, container, popup.element );
        };

        this.destroy = ( data ) =>
        {
            var popup = Utilities.bubble( data.tab.element, "popup" );
                popup.remove();
        };

        this.mousedown = ( event, element ) =>
        {
            event.preventDefault();

            this.x = event.clientX;
            this.y = event.clientY;

            document.onmouseup = nodrag;
            document.onmousemove = ( event ) => drag.call( this, event, element );
        };

        this.position = ( element, x, y ) =>
        {
            element.style.left = element.offsetLeft - x + px;
            element.style.top  = element.offsetTop  - y + px;
        };

        this.restore = ( data ) =>
        {
            this.destroy( data );

            data.tab.element.classList.add( "form-tab" );

            var tabs = container.tabs.map.get( data.tab.title );
            var children = [ ...tabs.tabsElement.children ];
            var next = children[ data.tab.index ];

            if ( next )
                tabs.tabsElement.insertBefore( data.tab.element, next );
            else
                tabs.tabsElement.appendChild( data.tab.element );

            container.element.appendChild( data.content.element );

            this.select( data.tab.title );
        };

        function drag( event, element )
        {
            event.preventDefault();

            this.position( element, ( this.x - event.clientX ), ( this.y - event.clientY ) );

            this.x = event.clientX;
            this.y = event.clientY;
        }

        function nodrag()
        {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        function position( base, element )
        {
            var bbox = base.getBoundingClientRect();
            var ebox = element.getBoundingClientRect();
            //var x = Math.max( 0, bbox.left - bbox.width );//left <= window.innerWidth ? left - ( abox.width + bbox.width ) : window.innerWidth - left;
            var x = Math.max( 0, bbox.left - ebox.width );
            var y = Math.max( 0, bbox.top - ebox.height );

            // TODO: set bounds
            this.position( element, x, y );
        }
    }

    function Tab( args )
    {
        this.element = Utilities.create( "form-tab" );
        this.element.classList.add( config.format );
        this.element.innerText = args.title;
        this.element.onclick = () => container.tabs.select( args.title );
        this.element.ondblclick = () => container.tabs.popup( args.title );
    }

    function Tabs()
    {
        this.element = Utilities.create( "form-tabs" );
        this.element.classList.add( config.format );
    }

    function TabMethods()
    {
        this.add = ( args ) =>
        {
            var content = new Content();
                content.title = args.title;
            var tab = new Tab( args );
                tab.title = args.title;
                tab.index = this.index;

            container.tabs.map.set( args.title, { tabsElement: this.element, tab: tab, content: content } );

            switch ( config.format )
            {
                case "tab-left":
                case "tab-top":
                    this.element.appendChild( tab.element );
                    container.element.prepend( this.element );
                    container.element.appendChild( content.element );
                break;

                case "tab-right":
                case "tab-bottom":
                    this.element.appendChild( tab.element );
                    container.element.prepend( content.element );
                    container.element.appendChild( this.element );
                break;

                default:
                    this.element.appendChild( tab.element );
                    this.element.classList.add( "hide" );
                    container.element.appendChild( content.element );
                    container.element.appendChild( this.element );
                break;
            }

            this.index++;

            return container.tabs.map.get( args.title );
        };

        this.disable = ( title ) =>
        {
            select( title, ( data ) => data.tab.element.classList.add( "formdisabled" ) );
        };

        this.enable = ( title ) =>
        {
            select( title, ( data ) => data.tab.element.classList.remove( "formdisabled" ) );
        };

        this.get = ( title ) =>
        {
            for ( let [ key, data ] of container.tabs.map )
                if ( key == title )
                    return data;
        };

        this.hide = ( title ) =>
        {
            select( title, ( data ) =>
            {
                data.content.element.classList.add( "hide" );
                data.tab.element.classList.add( "hide" );
            } );
        };

        this.index = 0;

        this.popup = ( title ) =>
        {
            select( title, ( data ) => this.create( data ) );
        };

        this.rename = ( title, newTitle ) =>
        {
            select( title, ( data ) => data.tab.element.innerText = newTitle );
        };

        this.show = ( title ) =>
        {
            select( title, ( data ) =>
            {
                data.content.element.classList.remove( "hide" );
                data.tab.element.classList.remove( "hide" );
            } );
        };

        this.select = ( title ) =>
        {
            container.tabs.map.forEach( ( data, key ) =>
            {
                if ( data.tab.element.classList.contains( "form-tab" ) )
                    if ( title !== key )
                    {
                        data.tab.element.classList.remove( "formselected" );
                        data.content.element.classList.add( "hide" );
                    }
                    else
                    {
                        data.tab.element.classList.add( "formselected" );
                        data.content.element.classList.remove( "hide" );
                        container.tabs.selected = key;
                    }
            } );

            return container.tabs.map.get( container.tabs.selected );
        };

        PopupMethods.call( this );
        Tabs.call( this );
    }

    function select( title, callback )
    {
        container.tabs.map.forEach( ( data, key ) =>
        {
            if ( title == key )
                callback( data );
        } );
    }
}