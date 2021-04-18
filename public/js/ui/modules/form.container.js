import { Utils } from './form.utils.js';

export function Container( args )
{
    this.parent = args.parent;

    this.element = Utils.create( "form" );
    this.parent.appendChild( this.element );

    //var fill = Utils.create( "form-tab-fill" );
    var tabs = Utils.create( "form-tabs" );
    //    tabs.appendChild( fill );
    this.element.appendChild( tabs );

    var contents = Utils.create( "form-contents" );
    this.element.appendChild( contents );

    this.tabs =
    {
        names: [],
        contents: {}
    };

    this.add = ( args ) =>
    {
        var tab = Utils.create( "form-tab" );
            tab.innerText = args.name;
        var content = Utils.create( "form-content" );

        this.tabs.names.push( args.name );
        this.tabs.contents[ args.name ] = content;

        tabs.appendChild( tab );
        contents.appendChild( content );
        
        return content;
    };
}