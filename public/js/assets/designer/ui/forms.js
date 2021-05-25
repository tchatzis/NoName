import { Table } from '../../forms/modules/table.js';
import { Container } from '../../forms/modules/container.js';
import { UI } from '../../forms/modules/ui.js';
import { Process } from './process.js';

function Data()
{
    var data = {};

    this.get = ( prop ) => data[ prop ];
    this.set = ( args ) => Object.assign( data, args );
}

export const Forms = function()
{
    var forms = this;
    var shared =
    {
        settings: ( parent, data ) =>
        {
            var handlers = [ { event: "input", handler: ( field ) => this.process.project.settings( field ) } ];

            var settings = new Table( { parent: parent, border: false, vertical: true } );
                settings.define( { output: "divider", label: "Colors", name: "colors" } );
                settings.define( { output: "field", label: "x axis", name: "axis.x", type: "color", value: data.axis?.x || "#110000",
                    handlers: handlers } );
                settings.define( { output: "field", label: "y axis", name: "axis.y", type: "color", value: data.axis?.y || "#001100",
                    handlers: handlers } );
                settings.define( { output: "field", label: "z axis", name: "axis.z", type: "color", value: data.axis?.z || "#000011",
                    handlers: handlers } );
                settings.define( { output: "divider", label: "Cursor", name: "cursor" } );
                settings.define( { output: "field", label: "size", name: "cursor.size", type: "number", value: data.cursor?.size,
                    attributes: { min: 0, max: 1, step: 0.05 },
                    handlers: handlers } );
                settings.define( { output: "field", label: "add", name: "cursor.add", type: "color", value: data.cursor?.add || "#00FF00",
                    handlers: handlers } );
                settings.define( { output: "field", label: "edit", name: "cursor.edit", type: "color", value: data.cursor?.edit || "#FFFF00",
                    handlers: handlers } );
                settings.define( { output: "field", label: "select", name: "cursor.select", type: "color", value: data.cursor?.select || "#FFFFFF",
                    handlers: handlers } );
                settings.define( { output: "divider", label: "Grid", name: "grid",
                    handlers: handlers } );
                settings.define( { output: "field", label: "position", name: "grid.position", type: "vector", value: data.grid?.position,
                    handlers: handlers } );
                settings.define( { output: "field", label: "visibility", name: "grid.visible", type: "toggle", value: data.grid?.visible,
                    source: { type: "js", data: [ { text: "on", value: true }, { text: "off", value: false } ] },
                    handlers: handlers } );
                settings.define( { output: "field", label: "snap increment", name: "grid.snap", type: "number", value: data.grid?.snap,
                    attributes: { min: 0, max: 1, step: 0.1 },
                    handlers: handlers } );
                settings.define( { output: "divider", label: "Marker", name: "marker" } );
                settings.define( { output: "field", label: "size", name: "marker.size", type: "number", value: data.marker?.size,
                    attributes: { min: 0, max: 1, step: 0.05 },
                    handlers: handlers } );
                settings.define( { output: "field", label: "opacity", name: "marker.opacity", type: "number", value: data.marker?.opacity,
                    attributes: { min: 0, max: 1, step: 0.1 },
                    handlers: handlers } );
                // TODO: conditional data exists or needs to be saved
                settings.define( { output: "field", label: "", name: "next", type: "submit", value: "next",
                    handlers: [ { event: "click", handler: this.process.project.next } ] } );
                settings.add();

            return settings;
        }
    };

    this.data = new Data();

    this.process = new Process( forms );

    this.project =
    {
        init: ( args ) => this.project.container = new Container( { title: args.name, parent: args.parent, format: "tab-bottom" } ),
        
        select: () =>
        {
            this.project.container.tabs.add( { title: "projects" } );
            this.project.container.tabs.select( "projects" );

            var projects = new Table( { parent: this.project.container.get.element( "projects" ), border: false } );
                projects.define({ output: "field", name: "name", type: "combo",
                    source: { type: "db", key: "name", path: "projects", output: "static" } } );
                projects.define( { output: "field", label: "", name: "submit", type: "submit", value: "select", silent: true,
                    handlers: [ { event: "click", handler: ( args ) => this.process.project.select( args ) } ] } );
                projects.add();
        },

        settings: ( data ) =>
        {
            this.project.container.tabs.add( { title: "settings" } );
            this.project.container.tabs.select( "settings" );

            shared.settings( this.project.container.get.element( "settings" ), data );
        }
    };
    
    this.workspace =
    {
        init: () =>
        {
            UI.init( app.ui.widget );

            this.workspace.container = new Container( { title: "workspace", parent: app.ui.widget, format: "tab-top" } );
            this.workspace.container.tabs.add( { title: "modes" } );
            this.workspace.container.tabs.add( { title: "info" } );
            this.workspace.container.tabs.add( { title: "settings" } );
            this.workspace.container.tabs.select( "modes" );

            var modes = new Table( { parent: this.workspace.container.get.element( "modes" ), border: false, vertical: true } );
                // TODO: data-divider=name / collapse and expand
                modes.define( { output: "divider", label: "Modes", name: "modes" } );
                modes.define( { output: "field", name: "view", type: "buttons", settings: { horizontal: true },
                    source: { type: "js", data: [ { text: "2D", value: "2D" }, { text: "3D", value: "3D" } ] } } );
                modes.define( { output: "field", name: "mode", type: "buttons", settings: { horizontal: true },
                    source: { type: "js", data: [ { text: "view" }, { text: "select" }, { text: "edit", disabled: true }, { text: "add", disabled: true } ] } } );
                modes.add();

            var info = new Table( { parent: this.workspace.container.get.element( "info" ), border: false, vertical: true } );
                info.define( { output: "divider", label: "Info", name: "modes" } );
                // TODO: vector position not setting
                info.define( { output: "field", label: "camera", name: "camera.position", type: "vector" } );
                info.define( { output: "field", label: "cursor", name: "cursor.position", type: "vector", value: { x: 1, y: 1, z: 2 } } );
                info.add();

            shared.settings( this.workspace.container.get.element( "settings" ), forms.data.get( "project" ).settings );

            this.workspace.group();
        },

        group: () =>
        {
            var container = new Container( { title: "groups", parent: app.ui.widget, format: "tab-top" } );
                container.tabs.add( { title: "select" } );
                container.tabs.add( { title: "edit" } );
                container.tabs.select( "select" );
                container.tabs.disable( "edit" );

            var select = new Table( { parent: container.get.element( "select" ), border: false, vertical: true } );
                select.define( { output: "field", name: "group", type: "tree",
                    source: { type: "db", key: "name", path: `projects/${ forms.data.get( "project" ).name }/groups`, output: "static" },
                    handlers:
                    [
                        { event: "add", handler: this.process.group.add },
                        { event: "input", handler: ( item ) => this.process.group.select( container, item ) },                        
                        { event: "toggle", handler: this.process.group.toggle }
                    ] } );
                select.add();
            
            

            /*var groups = new Table( { parent: container.get.element( "groups" ), add: true, autonumber: true, border: false, controls: true, vertical: false } );
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
            await groups.populate( { output: "static", path: `projects/${ forms.data.get( "project" ).name }/groups`, type: "db" } );
                groups.lock( 1 );
                groups.visible( 0, "submit", false );
                groups.visible( 1, "submit", false );*/
        }
    }
};