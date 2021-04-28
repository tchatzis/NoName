import { Utils } from './form.utils.js';

export function Container( args )
{
    var tabs = Utils.create( "form-tabs" );
    var contents = Utils.create( "form-contents" );

    this.element = Utils.create( "form" );
    this.element.appendChild( tabs );
    this.element.appendChild( contents );

    this.parent = args.parent;
    this.parent.appendChild( this.element );

    this.tabs =
    {
        contents: {},
        elements: [],
        names: []
    };

    this.add = ( args ) =>
    {
        var click = function()
        {
            this.tabs.names.forEach( obj => obj.selected = false );

            var index = Number( tab.dataset.index );

            this.tabs.names[ index ].selected = true;

            this.select();
        }.bind( this );

        var tab = tabs.querySelector( `[ data-name = "${ args.name }" ]` ) || Utils.create( "form-tab" );
            tab.innerText = args.name;
            tab.setAttribute( "data-name", args.name );
            tab.setAttribute( "data-index", this.tabs.elements.length );
            tab.onclick = click;

        var content = Utils.create( "form-content" );
            content.setAttribute( "data-name", args.name );

        this.tabs.contents[ args.name ] = content;
        this.tabs.elements.push( tab );
        this.tabs.names.push( { name: args.name, selected: !!args.selected || this.tabs.elements.length == 1 } );

        tabs.appendChild( tab );
        contents.appendChild( content );

        this.select();
        
        return content;
    };

    this.change = ( value ) =>
    {
        // TODO: match value to name or index
        // find index and select tab
    };

    this.select = () =>
    {
        for ( let i = 0; i < this.tabs.elements.length; i++ )
        {
            let tab = this.tabs.elements[ i ];

            let content = this.tabs.contents[ tab.getAttribute( "data-name" ) ];
                content.classList.add( "hide" );

            tab.classList.remove( "form-tab-selected" );

            if ( this.tabs.names[ i ].selected )
            {
                tab.classList.add( "form-tab-selected" );
                content.classList.remove( "hide" );
            }
        }
    };
}