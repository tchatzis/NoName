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
        names: [],
        contents: {}
    };

    this.add = ( args ) =>
    {
        var tab = Utils.create( "form-tab" );
            tab.innerText = args.name;
            tab.setAttribute( "data-tab", args.name );
        var content = Utils.create( "form-content" );
            content.setAttribute( "data-tab", args.name );

        this.tabs.names.push( args.name );
        this.tabs.contents[ args.name ] = content;

        tabs.appendChild( tab );
        contents.appendChild( content );
        
        return content;
    };
}