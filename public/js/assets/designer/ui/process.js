import { UI } from '../../forms/modules/ui.js';

export const Process = function( scope, forms )
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
            var settings = {};
            var tab = forms.project.container.tabs.add( { title: "settings" } );
            var project = { ...args.table.get.next() };
            var params =
            {
                key: "name",
                output: "static",
                path: `projects/${ project.name }/settings`,
                type: "db"
            };
            var response = await app.getters[ params.type ]( params );
                response.data.forEach( row =>
                {
                    settings[ row[ params.key ] ] = row;
                    delete row[ params.key ];
                } );

            forms.data.set( "project", Object.assign( project, { settings: settings } ) );
            forms.project.settings( tab.content.element, settings );

            scope.settings = forms.data.get( "project" ).settings;
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
        init: () =>
        {
            var info = forms.workspace.container.common.tabs.add( { title: "info" } );
            var settings = forms.workspace.container.common.tabs.add( { title: "settings" } );
            var orthographic = forms.workspace.container.view.tabs.add( { title: "orthographic" } );
            var perspective = forms.workspace.container.view.tabs.add( { title: "perspective" } );

            forms.workspace.container.common.tabs.select( "info" );
            forms.workspace.common.info( info.content.element );
            forms.workspace.common.settings( settings.content.element, forms.data.get( "project" ).settings );

            this.modes.init();

            forms.workspace.container.view.tabs.select( "orthographic" );
            forms.workspace.container.view.tabs.callback.set( this.modes.camera );
            forms.workspace.container.view.tabs.callback.invoke();
            forms.workspace.view.orthographic( orthographic.content.element );
            forms.workspace.view.perspective( perspective.content.element );
        }
    };

    this.modes =
    {
        init: () =>
        {
            scope.raycaster.initialize();
            scope.listeners.initialize();
        },

        camera: ( camera ) =>
        {
            forms.data.set( "modes", { camera: camera } );

            app.stage.camera = app.stage[ camera ];

            // TODO: y position

            switch ( camera )
            {
                case "orthographic":
                    let scale = 20;
                    let aspect = window.innerWidth / window.innerHeight;

                    app.stage.camera.lookAt( new THREE.Vector3() );
                    app.stage.camera.position.y = scale * 2;
                    app.stage.camera.left   = -aspect * scale;
                    app.stage.camera.right  =  aspect * scale;
                    app.stage.camera.top    =  scale;
                    app.stage.camera.bottom = -scale;
                    app.stage.camera.near   = 0;
                    app.stage.camera.far    = app.stage.camera.position.y + app.stage.camera.near + 2;
                    app.stage.camera.zoom   = 0.9;
                    app.stage.camera.updateProjectionMatrix();
                break;

                default:
                    scope.raycaster.disable();
                break;
            }

            app.animate.stop();
            app.animate.autoclear();
            
            this.helpers.grid();
        },

        mode: ( field ) =>
        {
            forms.data.set( "modes", { mode: field.selected.value } );

            scope.raycaster.mode = field.selected.value;
            
            switch ( field.selected.value )
            {
                case "add":
                case "edit":
                    this.helpers.crosshairs();
                    scope.raycaster.enable();
                break;


            }

            console.log( field.selected.value );

            //forms.workspace.container.group.tabs.show( field.selected.value );
            //forms.workspace.container.group.tabs.select( field.selected.value );
        }
    };

    this.helpers =
    {
        crosshairs: () =>
        {
            scope.crosshairs = {};
            scope.crosshairs.group = new THREE.Group();
            scope.crosshairs.group.name = "crosshairs";
            scope.crosshairs.group.userData.ui = true;
            scope.crosshairs.group.visible = true;
            Object.assign( scope.crosshairs, new scope.helpers.Crosshairs() );

            console.log( scope.crosshairs );
            scope.group.add( scope.crosshairs.group ); 
        },
        
        grid: () =>
        {
            scope.grid = {};
            scope.grid.group = new THREE.Group();
            scope.grid.group.position.copy( scope.settings.grid.position );
            scope.grid.group.name = "grid";
            scope.grid.group.userData.ui = true;
            scope.grid.group.visible = true;
            Object.assign( scope.grid, new scope.helpers.Grid() );
            scope.group.add( scope.grid.group );
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

            //scope.raycaster.enable();
            

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