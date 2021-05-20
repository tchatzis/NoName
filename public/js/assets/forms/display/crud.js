import { Container } from '../modules/container.js';
import { Table } from '../modules/table.js';

export default function()
{
    var scope = this;

    this.display =
    {
        crud: ( args ) =>
        {
            args.parent.innerHTML = null;

            var container = new Container( { title: args.name, parent: args.parent, format: "tab-none" } );

            var table = new Table( { parent: container.element, autonumber: true, border: false, controls: true, vertical: true } );
                table.set( "handlers", { add: ( res ) => console.warn( "add", res ), delete: ( res ) => console.error( "delete", res ) } );
                table.define( { output: "field", name: "name", type: "text" } );
                table.define( { output: "field", name: "parent", type: "text" } );
                table.define( { output: "field", name: "color", type: "color" } );

                /*table.define( { output: "field", label: "", name: "submit", type: "submit", value: "submit",
                    destination: { key: "name", path: "projects/home/groups/", structure: "object" },
                    handlers: [ { event: "click", handler: ( data ) =>
                    {
                        var params = { ...data.field.destination };
                            params.value = data[ params.structure ];
                            params.path += params.value[ params.key ];

                        var callback = function( response )
                        {
                            refresh();
                            data.field.reset();
                        };

                        app.setters[ params.type ]( params, callback );
                    } } ] } );*/
                table.add();
                table.populate( { output: "static", path: "projects/home/groups", type: "db" } );
        }
    };

    this.process =
    {
        crud: () =>
        {

        }
    };
};