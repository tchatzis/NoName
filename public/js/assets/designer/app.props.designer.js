const Designer = function()
{
    var app = {};
    var scope = this;
    var axes = [ "x", "y", "z" ];
    var colors = [ 0x110000, 0x001100, 0x000011 ];

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.groups = [];
        scope.colors = [];
        scope.current = {};

        scope.settings =
        {
            marker: 0.05,
            opacity: 0.25,
            snap: 0.5,
            grid:
            {
                size: { x: 40, y: 10, z: 40 },
                spacing: { x: 5, y: 1, z: 5 },
                position: { x: 0, y: -1, z: 0 }
            }
        };

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.grid = {};
        scope.grid.group = new THREE.Group();
        scope.grid.group.position.copy( scope.settings.grid.position );
        scope.grid.group.name = "grid";
        scope.grid.group.userData.ui = true;
        Object.assign( scope.grid, new Helpers.Grid() );
        scope.group.add( scope.grid.group );

        scope.markers = {};
        scope.markers.group = new THREE.Group();
        scope.markers.group.name = "markers";
        scope.markers.group.userData.ui = true;
        scope.group.add( scope.markers.group );

        scope.cursor = {};
        scope.cursor.group = new THREE.Group();
        scope.cursor.group.name = "cursor";
        scope.cursor.group.visible = Raycaster.enabled;
        scope.cursor.group.userData.ui = true;
        Object.assign( scope.cursor, new Helpers.Marker( scope.cursor.group, 0.1, "white" ) );
        scope.group.add( scope.cursor.group );

        scope.crosshairs = {};
        scope.crosshairs.group = new THREE.Group();
        scope.crosshairs.group.name = "crosshairs";
        scope.crosshairs.group.visible = Raycaster.enabled;
        scope.crosshairs.group.userData.ui = true;
        Object.assign( scope.crosshairs, new Helpers.Crosshairs() );
        scope.group.add( scope.crosshairs.group );

        /*scope.planes = {};
        scope.planes.group = new THREE.Group();
        scope.planes.group.name = "planes";
        Object.assign( scope.planes, new Helpers.Planes( scope.planes.group ) );
        scope.group.add( scope.planes.group );*/

        scope.current = new Data();

        Process.init();
    };

    /*const Data =
    {
        Entity: function( args )
        {
            Object.assign( this, args );

            this.add = ( points ) =>
            {
                var index = this.points.findIndex( item => item.label == points.label );

                if ( index === -1 )
                    this.points.push( points );
            };

            console.log( this );
        },
        Point: function ( args )
        {
            this.index = args.index || 0;
            this.label = args.label || "";
            this.position = args.position;
            this.parent = args.parent;
            this.object = args.object;

            const params =
            {
                name: "point.text",
                parent: this.parent,
                message: this.label,
                font: app.assets.fonts[ "Arial_Regular" ].font,
                geometry:
                {
                    size: 0.1,
                    height: 0.001,
                    curveSegments: 1,
                    bevelEnabled: false,
                    bevelThickness: 0,
                    bevelSize: 0,
                    bevelOffset: 0,
                    bevelSegments: 1
                }
            };

            this.text = new Text();
            this.text.init.call( app, params );
            this.text.group.position.copy( this.position ).add( new THREE.Vector3( 0, 0.1, 0 ) );
        }
    };*/

    function Data()
    {
        this.params = {};

        Object.defineProperty( this, "assign",
        {
            enumerable: false,
            value: ( key, object ) => Object.assign( this[ key ], object )
        } );

        Object.defineProperty( this, "get",
        {
            enumerable: false,
            value: ( key ) => this[ key ]
        } );

        Object.defineProperty( this, "set",
        {
            enumerable: false,
            value: ( key, value ) => this[ key ] = value
        } );

        Object.defineProperty( this, "setGroup",
        {
            enumerable: false,
            value: ( name, group, parent ) =>
            {
                this.name = name;
                this.group = group || new THREE.Group();
                this.group.name = name;
                this.group.userData.group = name;

                parent.add( this.group );
            }
        } );

        Object.defineProperty( this, "setGroups",
        {
            enumerable: false,
            value: ( breadcrumbs ) =>
            {
                function traverse( index, parent )
                {
                    var name = breadcrumbs[ index ];
                    var group = parent.children.find( child => child.name == name );

                    index++;

                    if ( name )
                    {
                        this.setGroup( name, group, parent );

                        traverse.call( this, index, this.group );
                    }
                }

                traverse.call( this, 0, scope.parent );
            }
        } );

        Object.defineProperty( this, "watch",
        {
            enumerable: false,
            value: () =>
            {
                for ( let key in this )
                    if ( this.hasOwnProperty( key ) )
                        console.warn( key, this[ key ] );
            }
        } );
    }

    /*function Params( args )
    {
        this.key    = args.key || null;
        this.map    = Array.isArray( args.map ) ? args.map.join( "." ) : args.map ? args.map : null;
        this.output = args.output || "static";
        this.path   = Array.isArray( args.path ) ? args.path.join( "/" ) : args.path;
        this.value  = args.value || null;
    }*/

    const Process =
    {
        grid:
        {
            toggle: ( event ) => scope.grid.group.visible = event.target.value,
            translate: ( event ) =>
            {
                var input = event.target;
                var axis = input.name;
                var value = Number( input.value );

                Raycaster.snap[ axis ] = value % 1 || scope.settings.snap;
                scope.grid.group.position[ axis ] = value;

                // update the add field in the array
                if ( Process.hooks.points && Process.hooks.points.array )
                {
                    let field = Process.hooks.points.array.fields.find( field => field.label == "add" );
                        field.update( scope.grid.group.position.clone() );
                }
            }
        },
        group:
        {
            add: ( detail ) =>
            {
                var delim = "/";
                var name = detail.field.value;
                var breadcrumbs = [ ...detail.breadcrumbs ];
                    breadcrumbs.push( name );
                var path = detail.params.path.split( delim );
                    path.push( name );
                var params = Object.assign( {}, detail.params );
                    params.path = path.join( delim );
                    params.value = { color: "#" + app.utils.hex(), name: name, parent: detail.params.value, visible: true, expand: false };
                var data = detail.params.data;
                    data.push( params.value );

                scope.current.set( "name", name );
                scope.current.setGroups( breadcrumbs );

                app.setters.db( params, Forms.points.segments );
            },
            breadcrumbs: ( map, detail, callback ) =>
            {
                // traverse breadcrumbs
                detail.breadcrumbs.forEach( name =>
                {
                    var path = detail.params.path.split( "/" );
                        path.push( name );

                    var params = { ...detail.params };
                        params.map = map;
                        params.path = path.join( "/" );
                        params.value = name !== detail.params.value || !detail.params[ map ];

                    app.setters.db( params, () => callback( { name: name, value: params.value, data: detail.params.data } ) );
                } );
            },
            define: ( key, data ) =>
            {
                var root = {};
                var keys = data.map( obj => obj[ key ] );
                    keys.sort();
                    keys.forEach( k =>
                    {
                        var obj = data.find( obj => obj[ key ] == k );

                        var parent = data.find( parent => parent[ key ] == obj.parent ) || {};
                            parent.children = [ ...parent.children || [], obj ];

                        if ( !obj.parent )
                        {
                            root.data = obj;
                            root.group = scope.group;
                        }
                    } );

                function traverse( args )
                {
                    var data = args.data;
                    var parent = args.group;

                    scope.groups.push( parent );

                    // reiterate
                    if ( data.hasOwnProperty( "children" ) )
                    {
                        data.children.forEach( child =>
                        {
                            var group = scope.group.getObjectByName( child.name, true ) || new THREE.Group();
                                group.name = child.name;
                                group.userData.group = child.name;
                                group.userData.color = child.color;
                                group.visible = child.visible;

                            parent.add( group );

                            var args =
                            {
                                data: child,
                                group: group
                            };

                            traverse( args );
                        } );
                    }
                }

                traverse( root );
            },
            expansion: ( event ) =>
            {
                var group = event.detail.field.getAttribute( "data-value" );
                var params = { ...event.detail.params };
                    params.map = "expand";
                    params.path = params.path + `/${ group }`;
                    params.value = !params.value;

                app.setters.db( params );
            },
            opacity: ( obj ) =>
            {
                obj.children.forEach( ( child ) => Process.group.opacity( child ) );

                if ( obj.material && !obj.parent.userData.ui )
                    obj.material.opacity = obj.parent.name == scope.current.name ? 1 : scope.settings.opacity;
            },
            select: ( event ) =>
            {
                var name = event.detail.field.value;

                scope.current.set( "name", name );
                scope.current.set( "group", scope.group.getObjectByName( name ) );

                if ( Process.hooks.points && Process.hooks.points.popup )
                    Process.hooks.points.popup.destroy();

                Process.group.visibility( event );

                Forms.points.segments();
            },
            visibility: ( event ) =>
            {
                var map = "visible";

                Process.group.breadcrumbs( map, event.detail, visibility );

                function visibility( args )
                {
                    scope.groups.forEach( group =>
                    {
                        if ( group.name == args.name )
                        {
                            group[ map ] = args.value;
                            Process.group.opacity( group );
                        }
                    } );
                }
            }
        },
        hooks: {},
        init: () =>
        {
            UI.init();
            Forms.project.select();
            Raycaster.mode = "move";
            Process.mode.set( { points: Raycaster.mode } );
        },
        lines:
        {
            close: () => Objects.lines.close()
        },
        mode:
        {
            reset: ( key ) => delete Process.mode.status[ key ],
            set: ( status ) => Object.assign( Process.mode.status, status ),
            status: {}
        },
        points:
        {
            add: ( field ) =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = data[ field.value ];

                Process.segments.path( params );
                Process.points.save( params );
            },
            change: ( field ) =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = data[ field.value ];

                Process.segments.path( params );
                Process.points.save( params );
            },
            /*create: () =>
            {
                // create new set
                // points > set > control > +

                // move up the map to set the object
                var data = {};
                var map = scope.current.params.map.split( "." ).reverse();
                    map.forEach( ( key, i ) => data = { [ key ]: i ? data : [] } );
                var set = map[ 0 ];

                // set the new value to the current data
                function traverse( object, data )
                {
                    for ( let key in object )
                    {
                        if ( object.hasOwnProperty( key ) && data.hasOwnProperty( key ) )
                        {
                            if ( typeof object[ key ] == "object" )
                            {
                                traverse( object[ key ], data[ key ] );
                                // append the value
                                Object.assign( object[ key ], data[ key ] );
                                // clone the objects
                                Object.assign( data[ key ], object[ key ] );
                            }
                        }
                    }
                }

                traverse( scope.current.params.data, data );

                Process.hooks.points.points.refresh( { data: scope.current.params.value } );
                Process.hooks.points.points.element.parentNode.classList.remove( "hide" );
                Process.hooks.points.check( set );

                //Process.points.save();
            },*/
            delete: ( field ) =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = data[ field.value ];

                Process.segments.path( params );
                Process.points.save( params );
            },
            highlight: ( args ) =>
            {
                // group > set > array > mouseover()
                if ( args.value )
                    Objects.markers.highlight( args );
            },
            move: () =>
            {
                Objects.cursor.visibility( Raycaster.enabled );
                Objects.crosshairs.visibility( Raycaster.enabled );
            },
            reorder: ( args ) =>
            {
                var key = args.field.data.source.params.key;
                var data = scope.current.data.points.find( obj => obj[ key ] == scope.current.name );
                var dragged = Number( args.dragged.dataset.index );
                var dropped = Number( args.dropped.dataset.index );
                var array = data[ args.segment ];
                // get item at dragged and delete ( 1 )
                var item = array.splice( dragged, 1 )[ 0 ];
                    //  add item to array in dropped position and delete ( 0 )
                    array.splice( dropped, 0, item );
                var params = {};
                    params.map = args.segment;
                    params.output = "realtime";
                    params.value = array;

                Process.segments.path( params );
                Process.points.save( params );
            },
            reset: () =>
            {
                console.warn( "not implemented" );
            },
            save: ( params ) =>
            {
                console.warn( "save", params );

                // save to db
                app.setters.db( params, () => Objects.plot.group( scope.current.group ) );
            },
            select: () =>
            {
                var name = Raycaster.selected.group;
                var data = scope.current.data.points.find( object => object.name == name );
                var detail =
                {
                    data: data[ Raycaster.selected.segment ],
                    field: { value: Raycaster.selected.segment }
                };

                if ( Mouse.enabled && Raycaster.enabled )
                {
                    // update current object
                    scope.current.set( "name", name );
                    scope.current.set( "group", scope.group.getObjectByName( name ) );

                    // update the group tree
                    Process.hooks.group.name.update( name );
                    Process.hooks.group.name.state( name );

                    // update the segments
                    Forms.points.segments();
                    Process.hooks.points.segment.update( Raycaster.selected.segment );
                    Process.hooks.points.segment.state( Raycaster.selected.segment );

                    // update the popup
                    if ( Process.hooks.points && Process.hooks.points.popup )
                        Process.hooks.points.popup.destroy();

                    Forms.points.edit( detail );
                }
            },
            set: () =>
            {
                var data = scope.current.data.points.find( obj => obj.name == Raycaster.selected.group );
                var params = {};
                    params.map = Raycaster.selected.segment;
                    params.output = "realtime";
                    params.value = data[ Raycaster.selected.segment ];

                Process.segments.path( params );

                // set from mouse click
                if ( params.value && Process.hooks.points )
                {
                    let position = scope.cursor.object.position.clone();
                    let vector = {};

                    // convert from THREE.Vector3
                    Object.keys( position ).forEach( axis => vector[ axis ] = position[ axis ] );

                    params.value.push( vector );

                    Process.hooks.points.array.refresh( { data: params.value } );
                    Process.points.save( params );
                }
            },
            unlight: ( args ) =>
            {
                // group > set > array > mouseout()
                if ( args.value )
                    Objects.markers.unlight( args );
            }
        },
        project:
        {
            load: async ( field ) =>
            {
                UI.cancel( app.ui.modal );
                UI.reset( app.ui.widget );

                var delim = "/";
                var key = "name";
                var cell = field.Row.cols.find( col => col.field[ key ] == key );
                var collections = [ "groups", "points" ];

                if ( cell )
                {
                    let project = cell.field.value;

                    scope.current.set( "project", project );
                    scope.current.set( "name", scope.group.name );
                    scope.current.set( "data", {} );

                    // resolve all promises
                    async function get()
                    {
                        var promises = [];

                        for ( let collection of collections )
                        {
                            let source = new field.Source( cell.field.source );
                                source.path = source.path + delim + project + delim + collection;
                            let response = await app.db.get( source );

                            scope.current.data[ collection ] = response.data;

                            if ( collection == "groups" )
                                Process.group.define( key, response.data );

                            promises.push( { [ collection ]: response } );
                        }

                        return Promise.all( promises );
                    }

                    // proceed
                    get().then( ( data ) =>
                    {
                        scope.current.set( "raw", data );

                        Objects.plot.all();
                        Forms.grid.settings();
                        Forms.group.select();

                        // TODO: move further down the pipeline
                        Raycaster.initialize();
                        Listeners.initialize();
                    } );
                }

                // TODO: define tools
                //app.ui.toolbar.prepend( { icon: parseInt( "1F50E", 16 ), title: "Inspect", action: () => {} } );
                //app.ui.toolbar.prepend( { icon: 9776, title: "Layer Visibility", action: () => {} } );*/

            },
            select: () =>
            {
                UI.cancel( app.ui.modal );
                UI.reset( app.ui.widget );

                Forms.group.select();
            }
        },
        raycaster:
        {
            move: () => Process.points.move(),
            select: ( args ) =>
            {
                var group = scope.group.getObjectByName( args.group );

                Raycaster.intersects.forEach( line =>
                {
                     Process.segments.unlight( line.parent, line.userData.segment );
                } );

                Process.segments.highlight( group, args.segment );
                Raycaster.selected = args;
            }
        },
        segments:
        {
            add: ( field ) =>
            {
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = [];

                Process.segments.path( params );

                // append the new segment
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                    data[ field.value ] = params.value;

                // save the data
                app.setters.db( params, () =>
                {
                     // load the points form
                    var detail =
                    {
                        field: field,
                        data: params.value
                    };

                    Forms.points.edit( detail );

                    // refresh the segments list
                    var refresh =
                    {
                        data: scope.current.data.points,
                        key: field.data.key,
                        value: scope.current.name
                    };

                    Process.hooks.points.segment.refresh( refresh );
                } );
            },
            change: ( event ) =>
            {
                Forms.points.edit( event.detail );
            },
            delete: ( field, key ) =>
            {
                var params = {};
                    params.map = key;
                    params.output = "realtime";

                Process.segments.path( params );

                // delete the segment
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                delete data[ key ];

                app.db.deleteField( params, () =>
                {
                    // refresh the segments list
                    var refresh =
                    {
                        data: scope.current.data.points,
                        value: scope.current.name
                    };

                    Process.hooks.points.segment.refresh( refresh );

                    // clear the drawing
                    var args =
                    {
                        group: scope.current.group,
                        segment: key
                    };

                    Objects.plot.delete( args );
                } );

                if ( Process.hooks.points.popup )
                    Process.hooks.points.popup.destroy();
            },
            highlight: ( group, key ) =>
            {
                group.children.forEach( ( child ) =>
                {
                    if ( child.material )
                        if ( child.userData.segment == key )
                        {
                            child.material.color = new THREE.Color();
                            child.material.opacity = 1;
                        }
                } );
            },
            path: ( params ) =>
            {
                params.path = [ "projects" ];
                params.path.push( scope.current.project );
                params.path.push( "points" );
                params.path.push( scope.current.name );
                params.path = params.path.join( "/" );
            },
            reset: ( field, key ) =>
            {
                var params = {};
                    params.map = key;
                    params.output = "realtime";
                    params.value = [];

                Process.segments.path( params );

                // reset the segment
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                    data[ key ] = params.value;

                // save the data
                app.setters.db( params, () =>
                {
                     // load the points form
                    var detail =
                    {
                        field: field,
                        data: params.value
                    };

                    Forms.points.edit( detail );

                    // refresh the segments list
                    var refresh =
                    {
                        data: scope.current.data.points,
                        key: field.data.key,
                        value: scope.current.name
                    };

                    Process.hooks.points.segment.refresh( refresh );
                } );
            },
            unlight: ( group, key ) =>
            {
                group.children.forEach( ( child ) =>
                {
                    if ( child.material )
                        if ( child.userData.segment == key )
                        {
                            child.material.color = new THREE.Color( child.parent.userData.color );
                            child.material.opacity = child.userData.group == group.name ? 1 : scope.settings.opacity;
                        }
                } );
            }
        }
    };

    const Forms =
    {
        grid:
        {
            settings: () =>
            {
                /*var form = new DB.Forms();
                    form.init( { parent: app.ui.widget, title: "Grid" } );
                    form.add( { name: "position", label: "position", type: "vector", value: scope.grid.group.position.clone(), parent: "", required: true,
                        data: { output: false },
                        handlers: [ { event: "input", handler: Process.grid.translate } ] } );
                    form.add( { name: "visibility", label: "visibility", type: "toggle", value: { on: true }, parent: "", required: true,
                        data: { output: false, source: [ { on: true }, { off: false } ] },
                        handlers: [ { event: "click", handler: Process.grid.toggle } ] } );*/
            }
        },
        project:
        {
            select: () =>
            {
                var form = new DB.Forms( { parent: app.ui.modal, type: "single" } );
                var tab = form.add( { name: "Select Project" } );
                var project = new form.Composite( { parent: tab, config: { numbers: false, headings: true } } );
                    project.init(
                    [
                        new project.Col( { name: "name", type: "combo", value: null, source: new project.Source( { key: "name", path: "projects", output: "static" } ) } ),
                        new project.Col( { name: null, type: "submit", value: "select", handlers: [ new project.Handler( { event: "click", handler: Process.project.load  } ) ] } )
                    ] );

                //console.log( project );
                
                /*var test = new form.Composite( { name: "test", parent: document.body } );
                    test.init(
                    [
                        new test.Col( { name: "color", type: "color", value: "996666" } ),
                        new test.Col( { name: "combo", type: "combo", value: "tito", params: { key: "name", path: "projects", output: "static" } } ),
                        new test.Col( { name: "cycle", type: "cycle", value: "three", options: [ new test.Option( "one", 1 ), new test.Option( "two", 2 ), new test.Option( "three", 3 ) ] } ),
                        new test.Col( { name: "input", type: "range", value: 10 } ),
                        new test.Col( { name: "select", type: "select", value: "two", options: [ new test.Option( "one", 1 ), new test.Option( "two", 2 ), new test.Option( "three", 3 ) ] } ),
                        new test.Col( { name: "toggle", type: "toggle", options: [ new test.Option( "on", true ), new test.Option( "off", false ) ] } ),
                        new test.Col( { name: "vector", type: "vector" } ),
                        new test.Col( { name: null, type: "click", handlers: [ { event: "click", handler: test.action } ] } )
                    ] );

                    test.element.addEventListener( "loaded", () =>
                    {
                        console.log( "data", test.get.data() );
                        console.log( "defaults", test.get.defaults() );
                        console.log( "field", test.get.field( 0, 3 ) );
                        console.log( "schema", test.get.schema() );
                        console.log( "size", test.get.size() );
                        console.log( "value", test.get.value( 0, "select" ) );
                    }, false );

                    test.element.addEventListener( "next", ( e ) => console.log( e.detail ) );*/
            }
        },
        group:
        {
            select: () =>
            {
                /*var path = [ "projects", scope.current.project, "groups" ];
                var select = new DB.Forms();
                    select.init( { parent: app.ui.widget, title: "Select Group" } );
                var tree = select.add( { name: "name", label: "name", type: "tree", value: "", parent: "",
                        data: { output: true, source: { getter: app.getters.db, params: new Params( { key: "name", output: "realtime", path: path } ) } },
                        handlers: [ { event: "add", handler: Process.group.add }, { event: "selection", handler: Process.group.select }, { event: "expansion", handler: Process.group.expansion } ]
                    } );

                Process.hooks.group =
                {
                    name: tree
                };*/
            }
        },
        points:
        {
            edit: ( detail ) =>
            {
                /*var key = detail.field.value;
                var form = new DB.Forms();
                    form.init( { name: "points", parent: null, title: "Points" } );
                var array = form.add( { name: "array", label: key, type: "array", value: scope.grid.group.position.clone(), parent: "", required: true,
                        data: { output: true, field: { type: "vector" }, source: { getter: app.getters.object, params: { data: detail.data, key: "name" } } },
                        handlers:
                        [
                            { event: "add",    handler: () => Process.points.add( detail.field ) },
                            { event: "change", handler: () => Process.points.change( detail.field ) },
                            { event: "delete", handler: () => Process.points.delete( detail.field ) },
                            { event: "mouseover", handler: ( args ) => { args.segment = key; Process.points.highlight( args ) } },
                            { event: "mouseout",  handler: ( args ) => { args.segment = key; Process.points.unlight( args ) } },
                            { event: "drop",      handler: ( args ) => { args.segment = key; Process.points.reorder( args ) } }
                        ]
                    } );

                Process.hooks.points.popup = form;
                Process.hooks.points.array = array;

                form.popup( Process.hooks.points.target.form );*/
            },
            segments: () =>
            {
                /*var data = scope.current.data.points;
                var form = new DB.Forms();
                    form.init( { name: "segments", parent: app.ui.widget, title: "Segments" } );
                var group = form.add( { name: "group", label: "group", type: "hidden", value: scope.current.name, parent: "", required: true,
                        data: { output: true } } );
                var segment = form.add( { name: "segment", label: "segment name", type: "list", value: "", parent: "", required: true,
                        data: { output: true, source: { getter: app.getters.object, params: { data: data, key: "name", value: scope.current.name } } },
                        handlers:
                        [
                            { event: "click", handler: Process.segments.change },
                            { event: "add", handler: ( field ) => Process.segments.add( field ) },
                            { event: "reset", handler: ( field, key ) => Process.segments.reset( field, key ) },
                            { event: "delete", handler: ( field, key ) => Process.segments.delete( field, key ) },
                            { event: "mouseover", handler: ( field, key ) => Process.segments.highlight( scope.current.group, key ) },
                            { event: "mouseout", handler: ( field, key ) => Process.segments.unlight( scope.current.group, key ) }
                        ]
                    } );

                Process.hooks.points =
                {
                    target: form,
                    segment: segment
                };*/
            }
        }
    };

    const Helpers =
    {
        Crosshairs: function()
        {
            axes.forEach( ( axis, i ) =>
            {
                var a = ( axes[ i ] === axis ) ? 0.5 : 0;
                var min = new THREE.Vector3();
                    min[ axis ] = -scope.settings.grid.size[ axis ] * a;
                var p = new THREE.Vector3().add( min );
                var max = new THREE.Vector3();
                    max[ axis ] = scope.settings.grid.size[ axis ] * a;
                var q = new THREE.Vector3().add( max );
                var args =
                {
                    group: scope.crosshairs.group,
                    points: [ p, q ],
                    color: new THREE.Color( 0x111111 )//colors[ i ]
                };

                this[ axis ] = Objects.lines.add( args );
                this[ axis ].name = `${ axis }-axis`;
                this[ axis ].userData.type = "crosshairs";
                this[ axis ].userData.axis = axis;
            } );
        },
        Grid: function()
        {
            const size = scope.settings.grid.size;
            const spacing = scope.settings.grid.spacing;
            const lines = [ new THREE.Color( 0x030303 ), new THREE.Color( 0x010101 ) ];
            const y = -0.01;

            this.object = new THREE.Mesh( new THREE.PlaneBufferGeometry( size.x, size.z, 1, 1 ).rotateX( -Math.PI * 0.5 ), new THREE.MeshBasicMaterial( { color: new THREE.Color( 0x010101 ), transparent: true, opacity: 0.75 } ) );
            this.object.name = "grid.plane";
            this.object.userData.type = "grid";
            this.object.position.y = y * 2;
            scope.grid.group.add( this.object );

            for ( let x = -size.x / 2; x <= size.x / 2; x++ )
            {
                let points = [];
                    points.push( new THREE.Vector3( x, y, -size.z / 2 ) );
                    points.push( new THREE.Vector3( x, y, size.z / 2 ) );

                const index = !( x % spacing.x ) ? 0 : 1;
                const color = x ? lines[ index ] : new THREE.Color( colors[ 2 ] );
                const args =
                {
                    group: scope.grid.group,
                    points: points,
                    color: color
                };

                Objects.lines.add( args );
            }

            for ( let z = -size.z / 2; z <= size.z / 2; z++ )
            {
                let points = [];
                    points.push( new THREE.Vector3( -size.x / 2, y, z ) );
                    points.push( new THREE.Vector3( size.x / 2, y, z ) );

                const index = !( z % spacing.z ) ? 0 : 1;
                const color = z ? lines[ index ] : new THREE.Color( colors[ 0 ] );
                const args =
                {
                    group: scope.grid.group,
                    points: points,
                    color: color
                };

                Objects.lines.add( args );
            }
        },
        Marker: function( group, size, color )
        {
            size = size || scope.settings.marker;

            this.object = Objects.box.add( group, size, new THREE.Color( color ) );
            this.object.name = "marker" + this.object.id;
            this.object.userData.type = "marker";
        },
        Planes: function( group )
        {
            var _axes = [ "X", "Z", "Y" ];

            axes.forEach( ( axis, i ) =>
            {
                var _axis = axes[ ( i + 2 ) % 3 ];
                var angle = Math.PI / 2;
                var fn = `rotate${ _axes[ i ] }`;
                var geometry = new THREE.PlaneBufferGeometry( scope.settings.grid.size[ axis ], scope.settings.grid.size[ _axis ] );
                    geometry[ fn ]( angle );
                var material = new THREE.MeshBasicMaterial( { color: colors[ i ], transparent: true, opacity: 0.2, side: THREE.DoubleSide, visible: false } );
                this[ axis ] = new THREE.Mesh( geometry, material );
                this[ axis ].name = `${ axis }-plane`;
                this[ axis ].userData.type = "plane";
                this[ axis ].userData.axis = axis;

                group.add( this[ axis ] );
            } );
        }
    };

    const Listeners =
    {
        initialize: () =>
        {
            //document.addEventListener( 'keydown',   Listeners.keydown, false );
            //document.addEventListener( 'keyup',     Listeners.keyup, false );
            document.addEventListener( 'mousemove', Mouse.move, false );
            document.addEventListener( 'mousedown', Mouse.down, false );
            //document.addEventListener( 'mouseup',   Mouse.up, false );
            document.addEventListener( 'click',     Listeners.click, false );
            document.addEventListener( 'dblclick',  () => UI.cancel( app.ui.modal ), false );
        },
        click: ( event ) =>
        {
            event.preventDefault();

            if ( Process.mode.status.points )
                Process.points[ Process.mode.status.points ]();
        },
        /*keydown: ( event ) =>
        {
            if ( event.key === "Shift" )
            {
                Process.mode.set( { points: "set" } );
                Raycaster.set( "add" );
                Raycaster.first = true;
            }
        },
        keyup: ( event ) =>
        {
            if ( event.key === "Shift" )
            {
                Process.mode.set( { points: "select" } );
                Raycaster.set( "move" );
                Raycaster.first = false;
            }
        }*/
    };

    const Mouse =
    {
        direction: new THREE.Vector3( 1, 0, 1 ),
        enabled: true,
        down: () => Mouse.enabled = false,
        move: ( event ) =>
        {
            var renderer = app.stage.renderer;

            Mouse.enabled = event.target.tagName == "CANVAS";

            if ( Mouse.enabled )
            {
                Mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
                Mouse.y = -( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

                Raycaster.update();
            }
        }
        //up: () => Mouse.enabled = true
    };
    
    const Objects = 
    {
        box:
        {
            add: ( group, size, color ) =>
            {
                var geometry = new THREE.BoxBufferGeometry( size, size, size );
                var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
                var mesh = new THREE.Mesh( geometry, material );
                    mesh.userData = group.userData;

                group.add( mesh );
    
                return mesh;
            }
        },
        clear: ( group ) =>
        {
            for ( let c = group.children.length - 1; c >= 0; c-- )
            {
                let object = group.children[ c ];
                group.remove( object );
            }

            group.children = [];
        },
        crosshairs:
        {
            move: ( position ) =>
            {
                axes.forEach( ( axis, i ) =>
                {
                    var line = scope.crosshairs[ axis ];
                        line.geometry.attributes.position.needsUpdate = true;
                    var positions = line.geometry.attributes.position.array;
                    var _axes = [ ...axes ];
                        _axes.splice( i, 1 );
                        _axes.forEach( _axis =>
                        {
                            var _i = axes.indexOf( _axis );
                            positions[ _i ] = position[ _axis ];
                            positions[ _i + 3 ] = position[ _axis ];
                        } );
                } );
            },
            visibility: ( bool ) => scope.crosshairs.group.children.forEach( child => child.visible = bool )
        },
        cursor:
        {
            move: ( position ) => scope.cursor.object.position.copy( position ),
            visibility: ( bool ) => scope.cursor.object.visible = bool
        },
        dispose: ( parent, object ) =>
        {
            object.geometry.dispose();
            object.material.dispose();

            parent.remove( object );
        },
        /*labels:
        {
            add: ( point, label ) =>
            {
                point.label = label;
                point.text.update( label );

                return label;
            },
            remove: ( point ) => point.parent.remove( point.text.group )
        },*/
        lines:
        {
            /*close: () =>
            {
                var args =
                {
                    group: scope.group.getObjectByName( scope.current.name, true ),
                    points: [ scope.current.params.value[ scope.current.params.value.length - 1 ], scope.current.params.value[ 0 ] ],
                    color: scope.current.color
                };

                Objects.lines.add( args );
            },*/
            add: ( args ) =>
            {
                var geometry = new THREE.BufferGeometry().setFromPoints( args.points );
                var material = new THREE.LineBasicMaterial( { color: args.color } );
                    material.transparent = true;
                    material.opacity = scope.settings.opacity;
                var lines = new THREE.Line( geometry, material );
                    lines.name = "line";
                    lines.userData.group = args.group.name;
                    lines.userData.segment = args.segment;

                args.group.add( lines );

                return lines;
            },
            // get all visible segments for Raycaster
            all: ( object, array ) =>
            {
                if ( object.visible )
                    object.children.filter( object =>
                    {
                        if ( object.userData.segment )
                            array.push( object );

                        if ( object.children )
                            Objects.lines.all( object, array );
                    } );

                return array;
            },
            remove: ( args ) =>
            {
                args.group.children.forEach( line =>
                {
                    if ( line.userData.segment == args.segment )
                        Objects.dispose( args.group, line );
                } );
            }
        },
        markers:
        {
            add: ( args ) =>
            {
                var marker = new Helpers.Marker( scope.markers.group, scope.settings.marker, args.color );
                    marker.object.position.copy( args.point );
                    marker.object.userData.group = args.group.name;
                    marker.object.userData.segment = args.segment;
                    marker.object.userData.index = args.index;
            },
            highlight: ( args ) =>
            {
                args.point = args.point || args.value;
                args.color = args.color || "white";
                args.group = args.group || scope.current.group;

                Objects.markers.add( args );
            },
            remove: ( args ) =>
            {
                args.group = args.group || scope.current.group;

                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == args.group.name && child.userData.segment == args.segment )
                        Objects.dispose( scope.markers.group, child );
                } );
            },
            toggle: ( args ) =>
            {
                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == args.group.name )
                        child.visible = !child.visible;
                } );
            },
            unlight: ( args ) =>
            {
                args.group = args.group || scope.current.group;

                Objects.markers.remove( args );
            }
        },
        planes:
        {
            hide: () => scope.planes.group.children.forEach( plane => plane.visible = false ),
            move: ( position ) =>
            {
                axes.forEach( ( axis, i ) =>
                {
                    var _i = ( i + 1 ) % 3;
                    var p = position[ axes[ _i ] ];
                    var plane = scope.planes[ axis ];
                        plane.geometry.attributes.position.needsUpdate = true;
                    var positions = plane.geometry.attributes.position.array;
                        positions[ _i ] = p;
                        positions[ _i + 3 ] = p;
                        positions[ _i + 6 ] = p;
                        positions[ _i + 9 ] = p;
                } );
            },
            show: ( planes ) =>
            {
                Objects.planes.hide();
                planes.forEach( plane => plane.visible = true )
            }
        },
        plot:
        {
            all: () =>
            {
                var points = scope.current.data.points;
                    points.forEach( obj =>
                    {
                        let group = scope.groups.find( group => obj.name == group.name );

                        if ( group )
                            Objects.plot.group( group );
                    } );
            },
            delete: ( args ) =>
            {
                Objects.lines.remove( args );
                Objects.markers.remove( args );
            },
            group: ( group ) =>
            {
                var points = scope.current.data.points.find( obj => obj.name == group.name );
                var groups = scope.current.data.groups;
                var color  = Tools.color( groups.find( obj => obj.name == group.name ).color );

                for ( let segment in points )
                    if ( points.hasOwnProperty( segment ) )
                    {
                        let args =
                        {
                            group: group,
                            segment: segment,
                            points: points[ segment ],
                            color: color
                        };

                        if ( Tools.isArray( args.points ) )
                            Objects.plot.points( args );
                    }
            },
            points: ( args ) =>
            {
                Objects.lines.remove( args );

                if ( args.points.length > 1 )
                    Objects.lines.add( args );
            }
        },
        /*points:
        {
            add: ( points, point ) => points.push( point ),
            delete: ( args ) =>
            {
                var index = Number( args.target.dataset.index );
                var points = args.object;
                var point = points[ index ];
                var marker = point.object;
                var group = point.parent;

                Process.points.index = index;
                Objects.labels.remove( point );
                Objects.points.remove( points );
                Objects.remove( group, marker );

                for ( let name in args.elements )
                    if ( args.elements.hasOwnProperty( name ) )
                        if ( name.includes( point.index ) )
                        {
                            args.elements[ name ].remove();
                            delete args.elements[ name ];
                        }
            },
            remove: ( points, point ) => points.splice( Process.points.index, 1 ),
            replace: ( points, point ) => points.splice( Process.points.index, 0, point )
        },
        remove: ( group, object ) =>
        {
            var objects = Tools.isArray( object ) ? object : [ object ];
                objects.forEach( object => group.remove( object ) );
        },
        select: ( group, type ) =>
        {
            var objects = [];

            group.children.forEach( child =>
            {
                var predicate = ( type && type.toLowerCase() === child.type.toLowerCase() ) || !type;

                if ( predicate )
                    objects.push( child );
            } );

            return objects;
        },*/
        /*toggle: ( breadcrumbs ) =>
        {
            var array = [ ...breadcrumbs ].shift();

            function bubble( group )
            {
                if ( array.indexOf( group.name ) > -1 )
                    group.visible = true;
            }

            scope.current.visible = !scope.current.visible;

            scope.current.group.visible = scope.current.visible;

            if ( scope.current.group.visible )
                scope.current.group.traverseAncestors( bubble );
        }*/
    };

    const Raycaster =
    {
        enabled: false,
        initialize: () =>
        {
            Raycaster.raycaster = new THREE.Raycaster();
            Raycaster.snap = new THREE.Vector3( scope.settings.snap, scope.settings.snap, scope.settings.snap );
            Raycaster.update();
        },
        intersect: [],
        intersects: [],
        objects: () =>
        {
            switch ( Raycaster.mode )
            {
                case "add":
                    Raycaster.intersects = [ scope.grid.object ];
                    Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                    Raycaster.position = ( point ) =>
                    {
                        var position = Tools.snap( point, Raycaster.snap.clone() );

                        return new THREE.Vector3().fromArray( position );
                    };
                break;

                case "move":
                    Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                    Raycaster.position = ( point ) => point;
                break

                case "select":
                    Raycaster.intersects = Objects.lines.all( scope.group, [] );
                    Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                    Raycaster.position = ( point ) => point;
                break;
            }

            Raycaster.intersect = Raycaster.raycaster.intersectObjects( Raycaster.intersects );
        },
        update: () =>
        {
            Raycaster.raycaster.setFromCamera( Mouse, app.stage.camera );
            Raycaster.objects();
            Raycaster.enabled = !!Raycaster.intersect.length && Mouse.enabled;

            var index = Raycaster.first ? 0 : Raycaster.intersect.length - 1;

            if ( Raycaster.enabled )
            {
                let position = new THREE.Vector3();
                    position.copy( Raycaster.position( Raycaster.intersect[ index ].point ) );
                let data = Raycaster.intersect[ index ].object.userData;

                Raycaster.action( data );

                Objects.cursor.move( position );
                Objects.crosshairs.move( position );
            }
        }
    };

    const Tools =
    {
        color: ( value ) => value.substring( value.length - 7 ),
        snap: ( point, spacing ) =>
        {
            spacing = spacing || scope.grid.spacing;

            return axes.map( axis => Math.round( point[ axis ] / spacing[ axis ] ) * spacing[ axis ] );
        },
        isArray: ( obj ) => Object.prototype.toString.call( obj ) === '[object Array]',
        isObject: ( obj ) => ( typeof obj === 'object' ) && ( obj !== null ),
        isNonValue: ( value ) => ( value == "" ) || ( value == null ) || ( value == undefined ),
        mapToDoc: ( path, map ) =>
        {
            app.db.get( new Params( { map: map, output: "static", path: path } ), ( response ) =>
            {
                var data = response.data;

                path.push( map );

                for ( let key in data )
                {
                    if ( data.hasOwnProperty( key ) )
                        app.db.addDoc( new Params( { key: key, output: "static", path: path, value: data[ key ] } ) );
                }

            } );
        },
        traverse:
        {
            //Tools.traverse.down( scope.groups, "uuid", data.parent );
            up: ( object, key, value ) =>
            {

            },
            down: ( object, key, value ) =>
            {
                var result;

                const traverseArray = ( arr ) => arr.forEach( obj => traverse( obj ) );
                const traverseObject = ( obj ) =>
                {
                    for ( var prop in obj )
                    {
                        if ( obj.hasOwnProperty( prop ) && prop == key && obj[ prop ] == value )
                            result = obj;
                        else if ( obj.hasOwnProperty( prop ) && prop !== "parent" )
                            traverse( obj[ prop ] );
                    }
                };

                function traverse( obj )
                {
                    if ( Tools.isArray( obj ) )
                        traverseArray( obj );
                    else if ( Tools.isObject( obj ) )
                        traverseObject( obj );
                }

                traverse( object );

                return result;
            }
        }
    };

    const UI =
    {
        add: ( element, parent ) => parent.appendChild( element ),
        cancel: ( parent ) =>
        {
            UI.clear( parent );
            UI.hide( parent );
        },
        clear: ( parent ) => parent.innerHTML = null,
        hide: ( parent ) => parent.classList.add( "hide" ),
        init: () =>
        {
            UI.reset( app.ui.modal );

        },
        message: ( message ) => console.warn( message ),
        reset: ( parent ) =>
        {
            UI.clear( parent );
            UI.show( parent );
        },
        show: ( parent ) => parent.classList.remove( "hide" )
    };
};