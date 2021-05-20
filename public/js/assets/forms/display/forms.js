import { Container } from '../modules/container.js';
import { Table } from '../modules/table.js';

export default function()
{
    var scope = this;

    this.display =
    {
        forms: ( args ) =>
        {
            var container = new Container( { title: args.name, parent: args.parent, format: "tab-bottom" } );
                container.tabs.add( { title: "tab 1" } );
                container.tabs.add( { title: "tab 2" } );
                container.tabs.add( { title: "tab 3" } );
                container.tabs.add( { title: "tab 4" } );
                container.tabs.disable( "tab 2" );
                container.tabs.disable( "tab 3" );
                container.tabs.select( "tab 1" );

                container.contents.fetch( { title: "tab 4", url: "/404.html" } );

            var data =
            {
                db: async () => await app.getters.db( { path: scope.current.path } ),
                js: () => [ { text: "a", value: 1 }, { text: "b", value: 2 }, { text: "c", value: 3 }, { text: "d", value: 4 } ]
            };

            var table = new Table( { parent: container.tabs.get( "tab 1" ).content.element, autonumber: true, border: false, controls: true } );
                //table.define( { output: "field", name: "buttons", type: "buttons", value: "db", source: { type: "js", data: [ { text: "js" }, { text: "db" } ] }, settings: { horizontal: true } } );
                //table.define( { output: "field", name: "code", type: "code", source: { url: "" } } );
                //table.define( { output: "field", name: "color", type: "color", value: "#669900" } );
                //table.define( { output: "field", name: "combo", type: "combo", value: "a", source: { type: "js", data: data.js() }, handlers: [ { event: "change", handler: () => {} } ] } );
                //table.define( { output: "field", name: "cycle", type: "cycle", value: "b", source: { type: "js", data: data.js() }, handlers: [ { event: "change", handler: () => {} } ] } );
                //table.define( { output: "field", name: "date", type: "date", value:new Date() } );
                //table.define( { output: "field", name: "email", type: "email" } );
                //table.define( { output: "field", name: "hidden", type: "hidden" } );
                //table.define( { output: "field", name: "label", type: "label", value:"label" } );
                //table.define( { output: "field", name: "match", type: "match", value: "match" } );
                //table.define( { output: "field", name: "number", type: "number", value: 2, attributes: { min: 0, step: 0.5 } } );
                //table.define( { output: "field", name: "object", type: "object", value: { female: "peanut", male: "flopsss" } } );
                //table.define( { output: "field", name: "password", type: "password" } );
                /*table.define( { output: "field", name: "preview", type: "preview", value: `this is
                 a test`, settings: { edit: true } } );*/
                //table.define( { output: "field", name: "range", type: "range", value: 8, attributes: { min: 2, max: 10, step: 0.1 } } );
                //table.define( { output: "field", name: "readonly", type: "readonly", value: "readonly" } );
                //table.define( { output: "field", name: "select", type: "select", value: "c", source: { type: "js", data: data.js() }, handlers: [ { event: "change", handler: () => {} } ] } );
                //table.define( { output: "field", label: "", name: "separator", type: "separator", settings: { width: 4, line: "dotted" } } );
                //table.define( { output: "field", name: "tel", type: "tel", value: "646-630-3799" } );
                //table.define( { output: "field", name: "text", type: "text", value: "text" } );
                //table.define( { output: "field", name: "time", type: "time", value: new Date() } );
                //table.define( { output: "field", name: "toggle", type: "toggle", value: true, source: { type: "js", data: [ { text: "peanut", value: true }, { text: "flops", value: false } ] } } );
                //table.define( { output: "field", name: "tree", type: "tree", value: "a", source: { type: "js", data: data.js() } } );
                //table.define( { output: "field", name: "underscore", type: "underscore", settings: { width: 4 } } );
                //table.define( { output: "field", name: "url", type: "url" } );
                //table.define( { output: "field", name: "vector", type: "vector" } );
                table.define( { output: "field", label: "", name: "submit", type: "submit", value: "submit" } );

                table.add();

                //table.get.cell( 0, "name" );

                /*table.onrow = () =>
                {
                    console.log( "cell", table.get.cell( 1, "select" ) );
                    console.log( "column", table.get.column( "buttons" ) );
                    console.log( "columns", table.get.columns() );
                    console.log( "field", table.get.field( 1, "select" ) );
                    console.log( "row", table.get.row( 1 ) );
                    console.log( "selected", table.get.selected( 2, "buttons" ) );
                    console.log( "size", table.get.size() );
                };*/
        }

        /*forms: async function( args )
        {
            args.parent.classList.remove( "hide" );

            var data =
            {
                db: async () => await app.getters.db( { path: scope.current.path } ),
                js: () => [ { text: "a", value: 1 }, { text: "b", value: 2 }, { text: "c", value: 3 }, { text: "d", value: 4 } ]
            };

            scope.add =
            {
                widget: async ( field ) =>
                {
                    var source = null;

                    scope.source.container.add( { name: "Widget", config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                    scope.source.container.select( "Widget" );

                    if ( field.selected.options )
                        source = { source: { data: data.js() } };

                    await scope.source.composite.init(
                    [
                        Object.assign( { label: `${ field.selected.text } widget`, name: "widget", type: field.selected.text, settings: { edit: true } }, source ),

                        { label: "output value", name: "output", type: "code", source: { form: scope.source, bind: "widget" } },
                        { name: "selected", type: "preview", settings: { stringify: true }, source: { form: scope.source, bind: "widget" } }
                    ] );
                }
            };

            scope.source = new Form( { collapsed: false, parent: args.parent, title: "Field Test", format: "tabs" } );
            scope.source.container.add( { name: "Select Input", selected: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );

            await scope.source.composite.init(
            [
                { name: "value", type: "click" },
                { name: "type", type: "select", value:"text" }, source: { data: Utilities.lookup.call( scope.source ) }, handlers: [ { event: "change", handler: scope.add.widget } ] },
                { name: "source", type: "buttons", value:"js" }, source: { data: [ { text: "js" }, { text: "db" } ] }, settings: { horizontal: true } }
                //{ name: "value", type: "preview", settings: { edit: true } },
                //
                //{ name: "options", type: "preview", value: Utilities.format( array ), settings: { edit: false } }
            ] );


            return true;
        }*/
    };

    this.process =
    {
        forms: function()
        {
            return {

            };
        }
    };
};