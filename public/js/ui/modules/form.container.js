import { Utils } from './form.utils.js';
import { Composite } from './form.composite.js';

export function Container( args )
{
    Object.assign( this, args );
    delete this.form;

    var scope = this;
    var form = args.form;
    var container = Utils.create( "form-container" );
    var title = Utils.create( "formtitle" );
        title.innerText = this.title;
        title.addEventListener( "click", collapse, false );
    var element = Utils.create( "form-tabs" );
    var contents = Utils.create( "form-contents" );
    var tabs = {};
    var data =
    {
        contents: {},
        elements: [],
        names: [],
        tabs: {}
    };

    this.element = Utils.create( "form" );
    if ( this.title )
        this.element.appendChild( title );
    this.element.appendChild( container );

    container.appendChild( element );
    container.appendChild( contents );
    
    if ( this.collapsed )
    {
        container.classList.add( "hide" );
        title.classList.add( "formcollapsed" );
    }

    this.parent = args.parent;
    this.parent.appendChild( this.element );

    const Tab = function( args )
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

        element.appendChild( tab );
        contents.appendChild( content );

        select();
        
        this.tab = tab;
        this.content = content;
    };

    function collapse()
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
        var i = data.names.findIndex( tab => tab.name == name );
        data.names[ i ].selected = true;

        this.selected = name;

        form.composite = tabs[ name ].composite;

        select();
    };
}