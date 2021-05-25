import { Constructors } from '../modules/constructors.js';
import { Container } from '../modules/container.js';
import { Table } from '../modules/table.js';

export default function()
{
    var scope = this;
    var constructors = new Constructors();

    this.display =
    {
        crud: async ( args ) =>
        {
            args.parent.innerHTML = null;

            var container = new Container( { title: args.name, parent: args.parent, format: "tab-bottom" } );
                container.tabs.add( { title: "projects" } );
                container.tabs.add( { title: "select" } );
                container.tabs.add( { title: "groups" } );
                container.tabs.add( { title: "settings" } );
                container.tabs.select( "select" );

            var select = new Table( { parent: container.get.element( "select" ), border: false } );
                select.define( { output: "field", name: "group", type: "tree",
                    source: { type: "db", key: "name", path: "projects/home/groups", output: "static" },
                    handlers:
                    [
                        { event: "add", handler: this.process.group },
                        //{ event: "toggle", handler: ( x ) => console.log( x ) }
                    ] } );
                select.add();

            var projects = new Table( { parent: container.get.element( "projects" ), border: false } );
                projects.define({ output: "field", name: "name", type: "combo",
                    source: { type: "db", key: "name", path: "projects", output: "static" } } );
                projects.define( { output: "field", label: "", name: "submit", type: "submit", value: "select", silent: true,
                    handlers: [ { event: "click", handler: ( args ) => this.process.select( Object.assign( args, { key: "name" } ) ) } ] } );
                projects.add();

            var groups = new Table( { parent: container.get.element( "groups" ), add: true, autonumber: true, border: false, controls: true, vertical: false } );
                groups.set.property( "handlers", { add: ( args ) => this.process.add( Object.assign( args, { key: "name" } ) ), delete: ( args ) => this.process.delete( Object.assign( args, { key: "name" } ) ) } );
                groups.define( { output: "field", name: "name", type: "text" } );
                groups.define( { output: "field", name: "parent", type: "text" } );
                groups.define( { output: "field", name: "color", type: "color" } );
                groups.define( { output: "field", name: "expand", type: "toggle", value: false,
                    source: { type: "js", data: [ { text: "expand", value: true }, { text: "collapse", value: false } ] } } );
                groups.define( { output: "field", label: "visibility", name: "visible", type: "toggle", value: false,
                    source: { type: "js", data: [ { text: "show", value: true }, { text: "hide", value: false } ] } } );
                groups.define( { output: "field", label: "", name: "submit", type: "submit", value: "update", silent: true,
                    handlers: [ { event: "click", handler: ( args ) => this.process.update( Object.assign( args, { key: "name" } ) ) } ] } );
                groups.add();
            await groups.populate( { output: "static", path: "projects/home/groups", type: "db" } );
                groups.lock( 1 );
                groups.visible( 0, "submit", false );
                groups.visible( 1, "submit", false );

            var handlers = [ { event: "input", handler: ( field ) => this.process.settings( field ) } ];

            var settings = new Table( { parent: container.get.element( "settings" ), border: false, vertical: true } );
                settings.define( { output: "divider", label: "Cursor", name: "cursor" } );
                settings.define( { output: "field", label: "size", name: "cursor.size", type: "number", value: 0.1,
                    attributes: { min: 0, max: 1, step: 0.05 },
                    handlers: handlers } );
                settings.define( { output: "field", label: "color", name: "cursor.color", type: "color", value: "#FFFFFF",
                    handlers: handlers } );
                settings.define( { output: "divider", label: "Grid", name: "grid",
                    handlers: handlers } );
                settings.define( { output: "field", label: "position", name: "grid.position", type: "vector",
                    handlers: handlers } );
                settings.define( { output: "field", label: "visibility", name: "grid.visible", type: "toggle", value: false,
                    source: { type: "js", data: [ { text: "on", value: true }, { text: "off", value: false } ] },
                    handlers: handlers } );
                settings.define( { output: "field", label: "snap increment", name: "grid.snap", type: "number", value: 0.5,
                    attributes: { min: 0, max: 1, step: 0.1 },
                    handlers: handlers } );
                settings.define( { output: "divider", label: "Marker", name: "marker" } );
                settings.define( { output: "field", label: "size", name: "marker.size", type: "number", value: 0.1,
                    attributes: { min: 0, max: 1, step: 0.05 },
                    handlers: handlers } );
                settings.define( { output: "field", label: "opacity", name: "marker.opacity", type: "number", value: 0.3,
                    attributes: { min: 0, max: 1, step: 0.1 },
                    handlers: handlers } );
                settings.add();
        }
    };

    this.process =
    {
        add: ( args ) =>
        {
            var value = { ...args.table.get.next() };
            var doc = value[ args.key ];
            var index = args.table.get.size().rows;
            var params =
            {
                output: "static",
                path: `projects/home/groups/${ doc }`,
                type: "db",
                value: value
            };
            var callback = () => args.table.highlight( index );

            app.setters[ params.type ]( params, callback );
        },

        delete: ( args ) =>
        {
            var doc = args.table.get.value( args.index, args.key );
            var params =
            {
                path: `projects/home/groups/${ doc }`
            };

            app.db.delete.data( params );
        },

        group: ( field, item ) =>
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
                    }
                } ) );

                field.render();
            };

            app.setters[ params.type ]( params, callback );
        },

        select: ( args ) =>
        {
            var value = { ...args.table.get.next() };

            console.log( args, value );
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
                path: `projects/home/settings/${ doc }`,
                type: "db",
                value: { [ map ]: field.selected.value }
            };

            var callback = () => field.table.highlight( index );

            console.warn( params );

            app.setters[ params.type ]( params, callback );
        },

        update: ( args ) =>
        {
            var doc = args.value[ args.key ];
            var params =
            {
                output: "static",
                path: `projects/home/groups/${ doc }`,
                type: "db",
                value: args.value
            };
            var callback = () => args.table.highlight( args.index );

            app.setters[ params.type ]( params, callback );
        }
    };
};