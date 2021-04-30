import { Utils } from './form.utils.js';

export function Container( args )
{
    var container = this;
    var tabs = Utils.create( "form-tabs" );
    var contents = Utils.create( "form-contents" );
    var data =
    {
        contents: {},
        elements: [],
        names: []
    };

    this.element = Utils.create( "form" );
    this.element.appendChild( tabs );
    this.element.appendChild( contents );

    this.parent = args.parent;
    this.parent.appendChild( this.element );

    this.Tab = function( args )
    {
        var click = function( name )
        {
            data.names.forEach( obj => obj.selected = false );

            var index = Number( tab.dataset.index );

            data.names[ index ].selected = true;

            select( name );
        }.bind( this );

        var tab = tabs.querySelector( `[ data-name = "${ args.name }" ]` ) || Utils.create( "form-tab" );
            tab.innerText = args.name;
            tab.setAttribute( "data-name", args.name );
            tab.setAttribute( "data-index", data.elements.length );
            tab.onclick = () => click( args.name );

        var content = contents.querySelector( `[ data-name = "${ args.name }" ]` ) || Utils.create( "form-content" );
            content.setAttribute( "data-name", args.name );

        data.contents[ args.name ] = content;
        data.elements.push( tab );
        data.names.push( { name: args.name, selected: !!args.selected || data.elements.length == 1 } );

        tabs.appendChild( tab );
        contents.appendChild( content );

        select();
        
        this.tab = tab;
        this.content = content;
    };

    this.select = ( name ) =>
    {
        //data.contents[ name ].innerHTML = null;
        console.log( name, data.contents[ name ] );

        select();
    };

    function select()
    {
        for ( let i = 0; i < data.elements.length; i++ )
        {
            let tab = data.elements[ i ];

            let content = data.contents[ tab.getAttribute( "data-name" ) ];
                content.classList.add( "hide" );

            tab.classList.remove( "form-tab-selected" );

            if ( data.names[ i ].selected )
            {
                tab.classList.add( "form-tab-selected" );
                content.classList.remove( "hide" );
            }
        }
    }
}