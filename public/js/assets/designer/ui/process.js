import { UI } from '../../forms/modules/ui.js';

export const Process = function( forms )
{
    this.project =
    {
        init: () =>
        {
            var tab = forms.project.container.tabs.add( { title: "projects" } );

            forms.project.select( tab.content.element );
        },
        
        select: async ( args ) =>
        {
            var tab = forms.project.container.tabs.add( { title: "settings" } );
            var project = { ...args.table.get.next() };
            var params =
            {
                key: "name",
                output: "static",
                path: `projects/${ project.name }/settings`,
                type: "db"
            };
            var settings = {};
            var response = await app.getters[ params.type ]( params );
                response.data.forEach( row =>
                {
                    settings[ row[ params.key ] ] = row;
                    delete row[ params.key ];
                } );

            forms.data.set( "project", Object.assign( project, { settings: settings } ) );
            forms.project.settings( tab.content.element, settings );
        },

        // save individual settings
        settings: ( field ) =>
        {
            var name = field.name.split( "." );
            var doc = name.shift();
            var map = name.join( "." );
            var index = field.settings.row;
            var params =
            {
                output: "static",
                path: `projects/${ forms.data.get( "project" ).name }/settings/${ doc }`,
                type: "db",
                value: { [ map ]: field.selected.value }
            };

            var callback = () => field.table.highlight( index );

            app.setters[ params.type ]( params, callback );
        },

        // save entire table
        save: ( args ) =>
        {
            // TODO: save new setings
            var callback = this.project.next;
            console.log( args );

        },

        next: () =>
        {
            UI.cancel( app.ui.modal );
            forms.workspace.init();
        }
    };
    
    this.workspace =
    {
        // modes/info/settings tabs
        init: () =>
        {
            var modes = forms.workspace.container.common.tabs.add( { title: "modes" } );
            var info = forms.workspace.container.common.tabs.add( { title: "info" } );
            var settings = forms.workspace.container.common.tabs.add( { title: "settings" } );

            forms.workspace.container.common.tabs.select( "modes" );

            forms.workspace.common.modes( modes.content.element );
            forms.workspace.common.info( info.content.element );
            forms.workspace.common.settings( settings.content.element, forms.data.get( "project" ).settings );

            this.modes.init();
        }
    };

    this.modes =
    {
        // [ modes ] no tabs
        init: () =>
        {
            [ "view", "select" ].forEach( mode =>
            {
                var tab = forms.workspace.container.group.tabs.add( { title: mode } );
                forms.workspace.group[ mode ]( tab.content.element );
                forms.workspace.container.group.tabs.hide( mode );
            } );
        },
        
        camera: ( field ) =>
        {
            forms.data.set( "modes", { camera: field.selected.value } );

            switch ( field.selected.value )
            {
                case "orthographic":
                    UI.init( app.ui.modal );
                break;

                case "perspective":
                    UI.cancel( app.ui.modal );
                break;
            }
        },

        // switch [ mode ]
        mode: ( field ) =>
        {
            forms.data.set( "modes", { mode: field.selected.value } );

            //forms.workspace.container.group.tabs.show( field.selected.value );
            forms.workspace.container.group.tabs.select( field.selected.value );
        }
    };

    this.group =
    {
        add: ( field, item ) =>
        {
            var doc = item[ field.source.key ];
            var value =
            {
                color: `#${ app.utils.hex() }`,
                expand: false,
                [ field.source.key ]: doc,
                parent: item.parent,
                visible: true
            };
            var params =
            {
                output: "static",
                path: `projects/home/groups/${ doc }`,
                type: "db",
                value: value
            };
            var callback = async ( response ) =>
            {
                var added = response.data;
                    added.item = item;
                var breadcrumbs = [];

                while ( added.item )
                {
                    added = added.item;
                    breadcrumbs.push( added.parent );
                }

                field.options = await field.refresh.items();

                breadcrumbs.forEach( parent => field.options.map( item =>
                {
                    if ( item.name == parent )
                    {
                        item.expand = true;

                        return item;
                    }
                } ) );

                field.render();
            };

            app.setters[ params.type ]( params, callback );
        },
        
        select: ( field ) =>
        {
            forms.data.set( "selected", { group: { field: field, data: field.selected } } );
            forms.data.set( "modes", { select: field.selected.value } );
            

            console.warn( forms.data.get() );
            

            //container.tabs.enable( "edit" );
            //container.tabs.select( "edit" );
        },
        
        toggle: ( args ) =>
        {
            var doc = args.selected.name;
            var map = "expand";
            var params =
            {
                output: "static",
                path: `projects/${ forms.data.get( "project" ).name }/groups/${ doc }`,
                type: "db",
                value: { [ map ]: !args.selected[ map ] }
            };

            app.setters[ params.type ]( params );
        },

        view: ( field ) =>
        {
            var doc = field.selected.name;
            var map = "visible";
            field.selected[ map ] = !field.selected[ map ];
            var params =
            {
                output: "static",
                path: `projects/${ forms.data.get( "project" ).name }/groups/${ doc }`,
                type: "db",
                value: { [ map ]: field.selected[ map ] }
            };
            var callback = async () =>
            {
                field.options = await field.refresh.items();
                forms.data.set( "selected", { group: { field: field, data: field.selected } } );
                field.render();
            };

            app.setters[ params.type ]( params, callback );
        }
    };
};