import { Table } from '../../forms/modules/table.js';
import { Container } from '../../forms/modules/container.js';
import { UI } from '../../forms/modules/ui.js';
import { Process } from './process.js';

function Data()
{
    var data = {};

    this.get = ( prop ) => prop ? data[ prop ] : data;

    this.set = ( prop, value ) =>
    {
        if ( !prop )
        {
            Object.assign( data, value );
            return data;
        }
        else
        {
            if ( data.hasOwnProperty( prop ) )
            {
                Object.assign( data[ prop ], value );
                return data[ prop ];
            }
            else
            {
                data[ prop ] = value;
                return data[ prop ];
            }
        }
    };
}

export const Forms = function( scope )
{
    var forms = this;

    this.data = new Data();

    this.process = new Process( scope, forms );

    this.project =
    {
        init: () => 
        {
            this.project.container = new Container( { title: "project", parent: app.ui.modal, format: "tab-bottom" } );
            this.process.project.init();
        },

        select: ( parent ) =>
        {
            this.project.container.tabs.select( "projects" );

            var projects = new Table( { parent: parent, border: false } );
                projects.define({ output: "field", name: "name", type: "combo",
                    source: { type: "db", key: "name", path: "projects", output: "static" } } );
                projects.define( { output: "field", label: "", name: "submit", type: "submit", value: "select", silent: true,
                    handlers: [ { event: "click", handler: ( args ) => this.process.project.select( args ) } ] } );
                projects.add();
        },

        settings: ( parent, data ) =>
        {
            this.project.container.tabs.select( "settings" );

            this.workspace.common.settings( parent, data );
        }
    };
    
    this.workspace =
    {
        init: () =>
        {
            UI.init( app.ui.widget );

            this.workspace.container =
            {
                common: new Container( { title: "common", parent: app.ui.widget, format: "tab-top" } ),
                //group: new Container( { title: "groups", parent: app.ui.widget, format: "tab-top" } )
                view: new Container( { title: "view", parent: app.ui.widget, format: "tab-top" } )
            };
            
            this.process.workspace.init();
        },

        common:
        {
            info: ( parent ) =>
            {
                var info = new Table( { parent: parent, border: false, vertical: true } );
                    //info.define( { output: "divider", label: "Info", name: "modes" } );
                    info.define( { output: "field", label: "camera", name: "camera.position", type: "vector", bind: { object: app.stage.camera, key: "position" } } );
                    info.define( { output: "field", label: "cursor", name: "cursor.position", type: "vector", value: { x: 1, y: 1, z: 2 } } );
                    info.add();
            },

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
                    settings.define( { output: "field", label: "size", name: "grid.size", type: "vector", value: data.grid?.size,
                        handlers: handlers } );
                    settings.define( { output: "field", label: "spacing", name: "grid.spacing", type: "vector", value: data.grid?.spacing,
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
                    settings.define( { output: "field", label: "", name: "next", type: "submit", value: "apply",
                        handlers: [ { event: "click", handler: this.process.project.next } ] } );
                    settings.add();
            }
        },

        group:
        {
            select: ( parent ) =>
            {
                var select = new Table( { parent: parent, border: false, vertical: true } );
                    select.define( { output: "field", name: "select", type: "buttons", settings: { horizontal: true },
                        source: { type: "js", data: [ { text: "group" }, { text: "segment" }, { text: "type" } ] },
                        handlers: [ { event: "input", handler: this.process.group.select } ] } );
                    select.add();

            },

            view: ( parent ) =>
            {
                var project = forms.data.get( "project" ).name;
                var path = `projects/${ project }/groups`;
                var select = new Table( { parent: parent, border: false, vertical: true } );
                    select.define( { output: "field", name: "group", type: "tree",
                        source: { type: "db", key: "name", path: path, output: "static" },
                        handlers:
                        [
                            //{ event: "add", handler: this.process.group.add },
                            { event: "input", handler: this.process.group.view },
                            { event: "toggle", handler: this.process.group.toggle }
                        ] } );
                    select.add();
            },

            edit: () =>
            {
                var data = forms.data.get( "selected" ).group.data;
                console.warn( data );
                var edit = new Table( { parent: this.workspace.groups.get.element( "edit" ), add: false, autonumber: false, border: false, controls: false, vertical: true } );
                    edit.set.property( "handlers", { add: ( args ) => this.process.add( Object.assign( args, { key: "name" } ) ), delete: ( args ) => this.process.delete( Object.assign( args, { key: "name" } ) ) } );
                    edit.define( { output: "field", name: "name", type: "text" } );
                    edit.define( { output: "field", name: "parent", type: "text" } );
                    edit.define( { output: "field", name: "color", type: "color" } );
                    edit.define( { output: "field", name: "expand", type: "toggle", value: false,
                        source: { type: "js", data: [ { text: "expand", value: true }, { text: "collapse", value: false } ] } } );
                    edit.define( { output: "field", label: "visibility", name: "visible", type: "toggle", value: false,
                        source: { type: "js", data: [ { text: "show", value: true }, { text: "hide", value: false } ] } } );
                    edit.define( { output: "field", label: "", name: "submit", type: "submit", value: "update", silent: true,
                        handlers: [ { event: "click", handler: ( args ) => this.process.update( Object.assign( args, { key: "name" } ) ) } ] } );
                    edit.add();
                //await groups.populate( { output: "static", path: `projects/${ forms.data.get( "project" ).name }/groups`, type: "db" } );
                //    groups.lock( 1 );
                //    groups.visible( 0, "submit", false );
                //    groups.visible( 1, "submit", false );*/
            }
        },

        view:
        {
            orthographic: ( parent ) =>
            {
                var modes = new Table( { parent: parent, border: false, vertical: true } );
                    modes.define( { output: "field", name: "mode", type: "buttons", settings: { horizontal: true },
                        source: { type: "js", data: [ { text: "add", disabled: false }, { text: "edit", disabled: true } ] },
                        handlers: [ { event: "input", handler: this.process.modes.mode } ] } );
                    modes.add();
            },

            perspective: ( parent ) =>
            {

            }
        }
    }
};