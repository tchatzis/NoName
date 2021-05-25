import { UI } from '../../forms/modules/ui.js';

export const Process = function( forms )
{
    this.project =
    {
        select: async ( args ) =>
        {
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

            forms.data.set( { project: Object.assign( project, { settings: settings } ) } );
            forms.project.settings( settings );
        },

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

        save: ( args ) =>
        {

            var callback = this.project.next;


        },

        next: () =>
        {
            UI.cancel( app.ui.modal );
            forms.workspace.init();
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
        
        select: ( container, item ) =>
        {
            console.warn( item.selected );
            container.tabs.enable( "edit" );
            container.tabs.select( "edit" );
        },

        // TODO: save toggle state
        toggle: ( args ) =>
        {
            console.log( args );
            args.breadcrumbs.forEach( parent => field.options.map( item =>
            {
                if ( item.name == parent )
                {
                    item.expand = true;
                }
            } ) );
        }
    }
};