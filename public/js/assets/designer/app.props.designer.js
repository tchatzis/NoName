const Designer = function()
{
    var app = {};
    var scope = this;
    var axes = [ "x", "y", "z" ];
    var colors = [ 0x110000, 0x001100, 0x000011 ];
    var delim = "/";

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.groups = [];
        scope.current = new Data();

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        Process.init();
    };

    // TODO: add dimensions
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
                this.group.userData.name = name;

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

    // TODO: consider implementation
    /*function Params( args )
    {
        this.key    = args.key || null;
        this.map    = Array.isArray( args.map ) ? args.map.join( "." ) : args.map ? args.map : null;
        this.output = args.output || "static";
        this.path   = Array.isArray( args.path ) ? args.path.join( "/" ) : args.path;
        this.value  = args.value || null;
    }*/
    
    const Handles =
    {
        forms: {},
        get:
        {
            forms: ( path ) =>
            {
                var r = Handles.forms;
                var p = path.split( delim );

                    if ( p.length > 2 )
                    {
                        p.splice( 2, 0, "fields" );
                        p.push( "field" );
                    }

                    p.forEach( prop => r = r[ prop ] );

                return r;
            }
        }
    };

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

                Raycaster.snap[ axis ] = value % 1 || scope.settings.grid.snap;
                scope.grid.group.position[ axis ] = value;

                // update the add field in the array
                if ( Handles.forms.points && Handles.forms.points.array )
                {
                    let field = Handles.forms.points.array.fields.find( field => field.label == "add" );
                        field.update( scope.grid.group.position.clone() );
                }
            }
        },
        group:
        {
            add: ( args ) =>
            {
                var name = args.value;
                var path = scope.current.path + "groups" + delim + name;
                var field = args.field;
                var source = field.source;
                var data =
                {
                    color: "#" + app.utils.hex(),
                    name: name,
                    parent: args.data[ source.key ],
                    visible: true
                };
                var params =
                {
                    output: "static",
                    path: path,
                    value: data
                };
                var breadcrumbs = [ ...args.breadcrumbs ];
                    breadcrumbs.push( name );

                scope.current.set( "name", name );
                scope.current.set( "group", scope.group.getObjectByName( name ) );

                app.setters.db( params, callback );

                function callback()
                {
                    var parent = source.data.find( parent => parent[ source.key ] == data.parent ) || {};
                        parent.children = [ ...parent.children || [], data ];
                        parent.expand = true;

                    source.data.push( data );

                    scope.current.setGroups( breadcrumbs );

                    field.render();
                    field.update( name );

                    Forms.group.edit();
                    Forms.points.segments();
                }
            },
            breadcrumbs: ( map, args, callback ) =>
            {
                var path = scope.current.path + "groups";

                // traverse breadcrumbs
                args.breadcrumbs.forEach( name =>
                {
                    var params =
                    {
                        map: map,
                        output: "static",
                        path: path + delim + name,
                        value: name !== args.value || !args.data[ map ]
                    };

                    app.setters.db( params, ( response ) => callback( { name: name, value: response.data, data: args.data } ) );
                } );
            },
            color: ( event ) =>
            {
                var field = event.detail;
                var params =
                {
                    map: "color",
                    output: "static",
                    path: scope.current.path + "groups" + delim + scope.current.name,
                    value: field.value
                };

                app.setters.db( params, callback );

                function callback()
                {
                    scope.current.group.children.forEach( ( line ) =>
                    {
                        if ( line.material )
                            line.material.color = new THREE.Color( params.value );
                    } );
                }
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
                                group.userData.name = child.name;
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
            delete: ( field ) =>
            {
                var params =
                {
                    path: scope.current.path + "groups" + delim + field.value
                };

                [ "groups", "points" ].forEach( prop =>
                {
                    var data = scope.current.data[ prop ].find( obj => obj.name == field.value );
                    var index = scope.current.data[ prop ].findIndex( obj => obj.name == field.value );

                    // remove from parent.children
                    if ( data )
                    {
                        let parent = scope.current.data[ prop ].find( obj => obj.name == data.parent );
                            parent.children.splice( parent.children.findIndex( obj => obj.name == field.value ), 1 );
                    }

                    if ( index > -1 )
                        scope.current.data[ prop ].splice( index, 1 );
                } );

                var group = scope.group.getObjectByName( field.value );
                var parent = group.parent;
                    parent.remove( group );

                scope.current.set( "name", scope.group.name );
                scope.current.set( "group", scope.group );

                app.db.delete.data( params, callback );

                function callback()
                {
                    field.form.container.remove.children();

                    var tree = field.form.composite.get.field( field.row, field.col );
                        tree.render();
                        tree.update( scope.group.name );
                        tree.state( scope.group.name );
                }
            },
            opacity: ( name, obj ) =>
            {
                obj.children.forEach( ( child ) => Process.group.opacity( name, child ) );

                if ( obj.material && !obj.parent.userData.ui )
                    obj.material.opacity = obj.parent.name == name ? 1 : scope.settings.appearance.opacity;
            },
            select: ( args ) =>
            {
                scope.current.set( "name", args.value );
                scope.current.set( "group", scope.group.getObjectByName( args.value ) );

                Process.group.visibility( args );
                Forms.group.edit();
                Forms.points.segments();
            },
            toggle: ( args ) =>
            {
                var map = "expand";

                Process.group.breadcrumbs( map, args, callback );

                function callback( args )
                {
                    args.data[ map ] = args.value;
                }
            },
            // TODO: consider
            /*unlight: ( group ) =>
            {
                group.children.forEach( ( child ) =>
                {
                    if ( child.material )
                    {
                        child.material.color = new THREE.Color( child.parent.userData.color );
                        child.material.opacity = child.userData.name == scope.current.name ? 1 : scope.settings.appearance.opacity;
                    }
                } );
            },*/
            visibility: ( args ) =>
            {
                var map = "visible";
                var label = args.element;

                Process.group.breadcrumbs( map, args, callback );

                function callback( args )
                {
                    label.classList.remove( !args.value );
                    label.classList.add( args.value );

                    args.data[ map ] = args.value;

                    var group = scope.group.getObjectByName( args.name );
                        group[ map ] = args.value;

                    Process.group.opacity( args.name, group );
                }
            }
        },
        helpers:
        {
            all: () =>
            {
                Process.helpers.crosshairs();
                Process.helpers.cursor();
                Process.helpers.grid();
                Process.helpers.markers();
                //Process.helpers.planes();
            },
            crosshairs: () =>
            {
                scope.crosshairs = {};
                scope.crosshairs.group = new THREE.Group();
                scope.crosshairs.group.name = "crosshairs";
                scope.crosshairs.group.visible = false;
                scope.crosshairs.group.userData.ui = true;
                Object.assign( scope.crosshairs, new Helpers.Crosshairs() );
                scope.group.add( scope.crosshairs.group );
            },
            cursor: () =>
            {
                scope.cursor = {};
                scope.cursor.group = new THREE.Group();
                scope.cursor.group.name = "cursor";
                scope.cursor.group.visible = false;
                scope.cursor.group.userData.ui = true;
                Object.assign( scope.cursor, new Helpers.Marker( scope.cursor.group, scope.settings.appearance.cursor.size, scope.settings.appearance.cursor.color ) );
                scope.group.add( scope.cursor.group );
            },
            grid: () =>
            {
                scope.grid = {};
                scope.grid.group = new THREE.Group();
                scope.grid.group.position.copy( scope.settings.grid.position );
                scope.grid.group.name = "grid";
                scope.grid.group.userData.ui = true;
                scope.grid.group.visible = scope.settings.grid.visible;
                Object.assign( scope.grid, new Helpers.Grid() );
                scope.group.add( scope.grid.group );
            },
            markers: () =>
            {
                scope.markers = {};
                scope.markers.group = new THREE.Group();
                scope.markers.group.name = "markers";
                scope.markers.group.userData.ui = true;
                scope.group.add( scope.markers.group );
            },
            planes: () =>
            {
                scope.planes = {};
                scope.planes.group = new THREE.Group();
                scope.planes.group.name = "planes";
                Object.assign( scope.planes, new Helpers.Planes( scope.planes.group ) );
                scope.group.add( scope.planes.group );
            },
            visibility: ( name, value ) =>
            {
                scope[ name ].group.visible = value;
            }
        },
        init: () =>
        {
            UI.init();
            Forms.project.select();
        },
        listeners:
        {
            add: () => {},
            edit: () =>
            {
                var segments = Handles.get.forms( "group/groups/Group Segments/segments" );
                    segments.update( Raycaster.current.segment );

                Process.segments.select( segments );
            },
            select: async () =>
            {
                if ( Raycaster.selected )
                {
                    Process.mode.set( { name: "points", value: "edit" } );

                    let name = Raycaster.selected.name;

                    scope.current.set( "name", name );
                    scope.current.set( "group", Raycaster.selected.group );
                    scope.current.set( "segment", Raycaster.selected.segment );

                    await Forms.group.select();

                    let mode = Handles.forms.widget.mode.fields[ "Mode" ][ "points" ].field;
                        mode.update( Process.mode.status.points );

                    let group = Handles.get.forms( "group/groups/Select Group/name" );
                        group.update( name );
                        group.state( name );

                    await Forms.points.segments();

                    let container = Handles.forms.group.groups.container;
                        container.collapse( false );
                        container.select( "Group Segments" );

                    let segments = await Handles.get.forms( "group/groups/Group Segments/segments" );
                        segments.update( Raycaster.selected.segment );

                    Process.segments.select( segments );
                }
            },
            view: () => {}
        },
        mode:
        {
            init: () =>
            {
                Forms.widget.common();
                Process.helpers.all();
                Raycaster.initialize();
                Listeners.initialize();
                Objects.plot.all();
            },
            reset: ( key ) => delete Process.mode.status[ key ],
            set: ( field ) =>
            {
                Object.assign( Process.mode.status, { [ field.name ]: field.value } );

                Process[ field.name ][ field.value ]( field );
            },
            status: {}
        },
        points:
        {
            // modes
            add: ( field ) =>
            {
                Raycaster.mode = field.value;
                Process.helpers.visibility( "crosshairs", true );
                Process.helpers.visibility( "cursor", true );
                Process.helpers.visibility( "grid", true );
            },
            edit: ( field ) =>
            {
                Raycaster.mode = field.value;
                Process.helpers.visibility( "crosshairs", false );
                Process.helpers.visibility( "cursor", true );
                Process.helpers.visibility( "grid", true );
            },
            select: ( field ) =>
            {
                Raycaster.mode = field.value;
                Process.helpers.visibility( "crosshairs", false );
                Process.helpers.visibility( "cursor", false );
            },
            view: ( field ) =>
            {
                Raycaster.mode = field.value;
                Process.helpers.visibility( "crosshairs", false );
                Process.helpers.visibility( "cursor", false );
                Process.helpers.visibility( "grid", false );
            }


            /*change: ( field ) =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = data[ field.value ];

                Process.segments.path( params );
                Process.points.save( params );
            },*/
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

                Handles.forms.points.points.refresh( { data: scope.current.params.value } );
                Handles.forms.points.points.element.parentNode.classList.remove( "hide" );
                Handles.forms.points.check( set );

                //Process.points.save();
            },*/
            /*delete: ( field ) =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name );
                var params = {};
                    params.map = field.value;
                    params.output = "realtime";
                    params.value = data[ field.value ];

                Process.segments.path( params );
                Process.points.save( params );
            },*/

            /*highlight: ( args ) =>
            {
                // group > set > array > mouseover()
                if ( args.value )
                    Objects.markers.highlight( args );
            },*/
            /*move: () =>
            {
                Objects.cursor.visibility( Raycaster.enabled );
                Objects.crosshairs.visibility( Raycaster.enabled );
            },*/
            /*reorder: ( args ) =>
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
            },*/
            /*reset: () =>
            {
                console.warn( "not implemented" );
            },*/
            /*save: ( params ) =>
            {
                console.warn( "save", params );

                // save to db
                app.setters.db( params, () => Objects.plot.group( scope.current.group ) );
            },*/

                /*
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
                    Handles.forms.group.name.update( name );
                    Handles.forms.group.name.state( name );

                    // update the segments
                    //Forms.points.segments();
                    Handles.forms.points.segment.update( Raycaster.selected.segment );
                    Handles.forms.points.segment.state( Raycaster.selected.segment );

                    // update the popup
                    if ( Handles.forms.points && Handles.forms.points.popup )
                        Handles.forms.points.popup.destroy();


                }*/
            /*set: () =>
            {
                var data = scope.current.data.points.find( obj => obj.name == Raycaster.selected.name );
                var params = {};
                    params.map = Raycaster.selected.segment;
                    params.output = "realtime";
                    params.value = data[ Raycaster.selected.segment ];

                Process.segments.path( params );

                // set from mouse click
                if ( params.value && Handles.forms.points )
                {
                    let position = scope.cursor.object.position.clone();
                    let vector = {};

                    // convert from THREE.Vector3
                    Object.keys( position ).forEach( axis => vector[ axis ] = position[ axis ] );

                    params.value.push( vector );

                    Handles.forms.points.array.refresh( { data: params.value } );
                    Process.points.save( params );
                }
            },*/
            /*unlight: ( args ) =>
            {
                // group > set > array > mouseout()
                if ( args.value )
                    Objects.markers.unlight( args );
            },*/

        },
        project:
        {
            load: async ( field ) =>
            {
                UI.cancel( app.ui.modal );
                UI.reset( app.ui.widget );

                var key = "name";
                var cell = field.row.cols.find( col => col.field[ key ] == key );
                var collections = [ "groups", "points" ];

                if ( cell )
                {
                    let project = cell.field.value;

                    scope.current.set( "project", project );
                    scope.current.set( "path", "projects" + delim + project + delim );
                    scope.current.set( "name", scope.group.name );
                    scope.current.set( "group", scope.group );
                    scope.current.set( "data", {} );

                    // resolve all promises
                    async function get()
                    {
                        var promises = [];

                        for ( let collection of collections )
                        {
                            let source = new field.form.composite.Source( cell.field.source );
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
                        scope.current.set( "response", data );

                        Process.settings.get();
                    } );
                }

                // TODO: define tools to UI.init
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
            add: () =>
            {

            },
            edit: ( args ) =>
            {
                Raycaster.intersects.forEach( line =>
                {
                     Process.segments.unlight( line.parent, line.userData.segment );
                } );

                Process.segments.highlight( args.group, args.segment );
            },
            select: ( args ) =>
            {
                Raycaster.intersects.forEach( line =>
                {
                     Process.segments.unlight( line.parent, line.userData.segment );
                } );

                Process.segments.highlight( args.group, args.segment );

                Raycaster.selected = { group: args.group, name: args.name, segment: args.segment };
                Raycaster.fields.name.update( args.name );
                Raycaster.fields.selected.update( args.segment );
            }
        },
        segments:
        {
            add: ( submit ) =>
            {
                var key = "new segment";
                var object = submit.data.find( row => row[ key ] );
                var value = object[ key ];
                var params =
                {
                    map: value,
                    output: "static",
                    path: scope.current.path + "groups" + delim + scope.current.name,
                    value: []
                };
                var fields = submit.form.composite.get.schema();
                var option = new submit.form.composite.Option( value, [] )
                var labels = fields[ `segments.${ submit.row }` ];
                    labels.options.push( option );
                    labels.render();
                var input = fields[ `new segment.${ submit.row }` ];

                app.setters.db( params, callback );

                function callback()
                {
                    input.update( "" );

                    submit.reset();

                    Process.segments.select( input.data );
                }
            },
            /*change: ( event ) =>
            {
                //Forms.points.edit( event.detail );
            },*/
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

                    Handles.forms.points.segment.refresh( refresh );

                    // clear the drawing
                    var args =
                    {
                        group: scope.current.group,
                        segment: key
                    };

                    Objects.plot.delete( args );
                } );

                if ( Handles.forms.points.popup )
                    Handles.forms.points.popup.destroy();
            },
            highlight: ( group, segment ) =>
            {
                var predicate = Process.mode.status.points == "edit" ? group.visible && group.name == scope.current.name : group.visible;

                if ( predicate )
                    group.children.forEach( ( child ) =>
                    {
                        if ( child.material )
                            if ( child.userData.segment == segment )
                            {
                                child.material.color = new THREE.Color();
                                child.material.opacity = 1;
                            }
                    } );
            },
            /*reset: ( field, key ) =>
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

                    //Forms.points.edit( detail );

                    // refresh the segments list
                    var refresh =
                    {
                        data: scope.current.data.points,
                        key: field.data.key,
                        value: scope.current.name
                    };

                    Handles.forms.points.segment.refresh( refresh );
                } );
            },*/
            select: ( field ) =>
            {
                Raycaster.selected = { group: scope.current.group, name: scope.current.name, segment: field.selected.text };
                Process.raycaster.select( Raycaster.selected );

                Forms.points.edit( field );
            },
            unlight: ( group, segment ) =>
            {
                group.children.forEach( ( child ) =>
                {
                    if ( child.material && child.parent.userData.color )
                        if ( child.userData.segment == segment )
                        {
                            child.material.color = new THREE.Color( child.parent.userData.color );
                            child.material.opacity = child.userData.name == scope.current.name ? 1 : scope.settings.appearance.opacity;
                        }
                } );
            }
        },
        settings:
        {
            appearance:
            {
                cursor: ( field ) =>
                {
                    var value = field.type == "number" ? Number( field.value ) : field.value;

                    var params =
                    {
                        map: `cursor.${ field.name }`,
                        key: "name",
                        output: "static",
                        path: scope.current.path + "settings" + delim + "appearance",
                        value: value
                    };

                    switch( field.name )
                    {
                        case "color":
                            scope.cursor.object.material.color = new THREE.Color( value );
                        break;

                        case "size":
                            scope.cursor.object.scale.set( value, value, value );
                        break;
                    }

                    app.setters.db( params );
                },
                marker: ( field ) =>
                {
                    console.warn( field.label, "not implemented" );
                    Process.settings.save( field, "appearance" );
                },
                opacity: ( field ) =>
                {
                    console.warn( field.label, "not implemented" );
                    Process.settings.save( field, "appearance" );
                }
            },
            get: async () =>
            {
                var params =
                {
                    key: "name",
                    output: "static",
                    path: scope.current.path + "settings"
                };

                scope.settings = await Tools.query( params );

                Process.mode.init();
            },
            grid:
            {
                position: ( field ) =>
                {
                    scope.grid.group.position.copy( scope.settings.grid.position );
                    Process.settings.save( field, "grid" );
                },
                size: ( field ) =>
                {
                    Objects.remove( scope.grid.group );

                    delete scope.grid;

                    Process.helpers.grid();
                    Process.settings.save( field, "grid" );
                },
                snap: ( field ) =>
                {
                    field.element.step = scope.settings.grid.snap;
                    Raycaster.snap = new THREE.Vector3( field.value, field.value, field.value );
                    Process.settings.save( field, "grid" )
                },
                visible: ( field ) =>
                {
                    Process.helpers.visibility( "grid", field.value );
                    Process.settings.save( field, "grid" );
                }
            },
            save: ( field, name ) =>
            {
                var value = field.type == "number" ? Number( field.value ) : field.value;

                var params =
                {
                    map: field.name,
                    key: "name",
                    output: "static",
                    path: scope.current.path + "settings" + delim + name,
                    value: value
                };

                app.setters.db( params );
            }
        }
    };

    const Forms =
    {
        group:
        {
            edit: async () =>
            {
                var form = Handles.forms.group.form;
                    form.container.add( { name: "Edit Group", child: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                await form.composite.init(
                    [
                        {
                            name: "delete", type: "match", icon: String.fromCodePoint( 10799 ), value: scope.current.name,
                            handlers: [ { event: "click", handler: Process.group.delete } ]
                        },
                        {
                            break: true,
                            name: "color", type: "color", value: scope.current.data.groups.find( obj => obj.name == scope.current.name ).color,
                            handlers: [ { event: "valid", handler: Process.group.color } ]
                        }
                    ] );

                return true;
            },
            select: async () =>
            {
                var groups = new DB.Forms( { collapsed: true, parent: app.ui.widget, title: "Groups", format: "tabs" } );
                    groups.container.add( { name: "Select Group", selected: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                await groups.composite.init(
                    [
                        {
                            name: "name", type: "tree", value: "",
                            handlers: [ { event: "add", handler: Process.group.add }, { event: "click", handler: Process.group.select }, { event: "toggle", handler: Process.group.toggle } ],
                            source: { key: "name", data: scope.current.data.groups }
                        }
                    ] );

                Handles.forms.group =
                {
                    groups: groups
                };

                return true;
            }
        },
        points:
        {
            edit: async ( field ) =>
            {
                var popup = new DB.Forms( { parent: document.body, title: "Points", format: "popup" } );
                    popup.container.add( { name: "segment", config: { add: true, borders: false, hover: false, numbers: true, headings: true } } );
                await popup.composite.init(
                    [
                        { name: field.selected.text, type: "vector" },
                        { name: null, type: "click" }
                    ] );
                    popup.composite.source.option( field );

                return true;

                // TODO: drag and drop
                //console.log( field, option );
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

                Handles.forms.points.popup = form;
                Handles.forms.points.array = array;

                form.popup( Handles.forms.points.target.form );*/
            },
            segments: async () =>
            {
                var data = scope.current.data.points.find( obj => obj.name == scope.current.name ) || [];
                var form = Handles.forms.group.groups;
                    form.container.add( { name: "Group Segments", child: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                await form.composite.init(
                    [
                        { name: "group", type: "label", value: scope.current.name },
                        { break: true, name: "segments", type: "buttons", multiple: false,
                            options: form.composite.from.object.to.options( { key: "name", data: data } ),
                            handlers: [ { event: "click", handler: Process.segments.select } ]
                        },
                        { break: true, name: "new segment", type: "text" },
                        { name: null, type: "submit", value: "add", handlers: [ { event: "click", handler: Process.segments.add } ] }
                    ] );

                return true;
                // TODO: clear this shit out
                //console.log( data, form.composite.from.object.to.options( { key: "name", data: data } ) );

                //var options = segment.from.object.to.options( new segment.Source( { key: "name", data: data } ) );

                //console.log( segment );

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

                Handles.forms.points =
                {
                    target: form,
                    segment: segment
                };*/
            }
        },
        project:
        {
            select: async () =>
            {
                var form = new DB.Forms( { title: "Select Project", parent: app.ui.modal, format: "box" } );
                    form.container.add( { name: "Select Project", config: { numbers: false, headings: true } } );
                await form.composite.init(
                    [
                        { name: "name", type: "combo", source: { key: "name", path: "projects", output: "static" } },
                        { name: null, type: "submit", value: "select", handlers: [ { event: "click", handler: Process.project.load } ] }
                    ] );

                return true;
            }
        },
        widget:
        {
            common: async () =>
            {
                var mode = new DB.Forms( { parent: app.ui.widget, title: "Mode", format: "box" } );
                    mode.container.add( { name: "Mode", selected: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                    mode.composite.init(
                    [
                        { name: "points", type: "buttons", value: "view", horizontal: true,
                            options: [ { text: "view" }, { text: "select" }, { text: "edit" }, { text: "add" } ],
                            handlers: [ { event: "click", handler: Process.mode.set } ]
                        }
                    ] );

                var info = new DB.Forms( { parent: app.ui.widget, title: "Info", format: "tabs" } );
                    info.container.add( { name: "Raycaster", selected: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                await info.composite.init(
                    [
                        { label: "cursor position", name: "cursor", type: "vector" },
                        { break: true, label: "group", name: "name", type: "label", value: scope.current.name },
                        { break: true, label: "selected segment", name: "selected", type: "label", value: scope.current.segment },
                        { break: true, label: "current segment", name: "current", type: "label", value: scope.current.segment }
                    ] );

                var settings = new DB.Forms( { collapsed: true, parent: app.ui.widget, title: "Settings", format: "tabs" } );
                    settings.container.add( { name: "Grid", selected: true, config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                    settings.composite.init(
                    [
                        { name: "position", type: "vector", value: scope.settings.grid.position,
                            handlers: [ { event: "click", handler: Process.settings.grid.position } ]
                        },
                        { break: true, name: "size", type: "vector", value: scope.settings.grid.size,
                            handlers: [ { event: "input", handler: Process.settings.grid.size } ]
                        },
                        { break: true, name: "snap unit", type: "number", value: scope.settings.grid.snap,
                            attributes: { step: scope.settings.grid.snap },
                            handlers: [ { event: "input", handler: Process.settings.grid.snap } ]
                        },
                        { break: true, label: "visibility", name: "visible", type: "toggle", value: scope.settings.grid.visible,
                            options: [ { text: "on", value: true }, { text: "off", value: false } ],
                            handlers: [ { event: "click", handler: Process.settings.grid.visible } ]
                        }
                    ] );
                    settings.container.add( { name: "Appearance", config: { add: false, borders: false, hover: false, numbers: false, headings: true } } );
                    settings.composite.init(
                    [
                        { label: "cursor color", name: "color", type: "color", value: scope.settings.appearance.cursor.color,
                            handlers: [ { event: "valid", handler: Process.settings.appearance.cursor } ]
                        },
                        { label: "cursor size", name: "size", type: "number", value: scope.settings.appearance.cursor.size,
                            attributes: { step: 0.1, min: 0.1, max: 1 },
                            handlers: [ { event: "click", handler: Process.settings.appearance.cursor } ]
                        },
                        { break: true, label: "marker size", name: "marker", type: "number", value: scope.settings.appearance.marker,
                            attributes: { step: 0.05, min: 0.05, max: 1 },
                            handlers: [ { event: "input", handler: Process.settings.appearance.marker } ]
                        },
                        { break: true, label: "line opacity", name: "opacity", type: "number", value: scope.settings.appearance.opacity,
                            attributes: { step: 0.05, min: 0, max: 1 },
                            handlers: [ { event: "input", handler: Process.settings.appearance.opacity } ]
                        }
                    ] );

                Handles.forms.widget =
                {
                    mode: mode,
                    info: info
                };

                Raycaster.fields =
                {
                    cursor: Handles.get.forms( "widget/info/Raycaster/cursor" ),
                    name: Handles.get.forms( "widget/info/Raycaster/name" ),
                    selected: Handles.get.forms( "widget/info/Raycaster/selected" ),
                    current: Handles.get.forms( "widget/info/Raycaster/current" )
                };

                return true;
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
            const lines = [ new THREE.Color( 0x030303 ), new THREE.Color( 0x020202 ) ];
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
            size = size || scope.settings.appearance.marker;

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
            var canvas = document.getElementById( "renderer" );
                canvas.addEventListener( 'dblclick', Listeners.dblclick, false );
                canvas.addEventListener( 'mousemove', Mouse.move, false );
                canvas.addEventListener( 'mousedown', Mouse.down, false );

            //document.addEventListener( 'keydown',   Listeners.keydown, false );
            //document.addEventListener( 'keyup',     Listeners.keyup, false );

            //document.addEventListener( 'mouseup',   Mouse.up, false );

            //document.addEventListener( 'dblclick',  () => UI.cancel( app.ui.modal ), false );
        },
        dblclick: ( event ) =>
        {
            event.preventDefault();

            if ( Process.mode.status.points )
                Process.listeners[ Process.mode.status.points ]();
        }
        // TODO: clean up listeners
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
                var geometry = new THREE.BoxBufferGeometry();
                var material = new THREE.MeshBasicMaterial( { color: color, wireframe: false } );
                var mesh = new THREE.Mesh( geometry, material );
                    mesh.userData = group.userData;
                    mesh.scale.set( size, size, size )

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
                    material.opacity = scope.settings.appearance.opacity;
                var lines = new THREE.Line( geometry, material );
                    lines.name = "line";
                    lines.userData.name = args.group.name;
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
                var marker = new Helpers.Marker( scope.markers.group, scope.settings.appearance.marker, args.color );
                    marker.object.position.copy( args.point );
                    marker.object.userData.name = args.group.name;
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
                    if ( child.userData.name == args.group.name && child.userData.segment == args.segment )
                        Objects.dispose( scope.markers.group, child );
                } );
            },
            /*toggle: ( args ) =>
            {
                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.name == args.group.name )
                        child.visible = !child.visible;
                } );
            },*/
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
        remove: ( obj ) => obj.parent.remove( obj )
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
            Raycaster.selected = null;
            Raycaster.snap = new THREE.Vector3( scope.settings.grid.snap, scope.settings.grid.snap, scope.settings.grid.snap );
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
                    Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, Raycaster.snap ) );
                break;

                case "edit":
                    Raycaster.first = true;
                    Raycaster.intersects = Objects.lines.all( scope.current.group, [] ).concat( scope.grid.object );
                    Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                    Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, new THREE.Vector3() ) );
                break;

                case "select":
                    Raycaster.first = false;
                    Raycaster.intersects = Objects.lines.all( scope.group, [] );
                    Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                    Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, new THREE.Vector3() ) );
                break;

                case "view":
                    Raycaster.intersects = [];
                break
            }

            Raycaster.intersect = Raycaster.raycaster.intersectObjects( Raycaster.intersects );
        },
        update: () =>
        {
            Raycaster.raycaster.setFromCamera( Mouse, app.stage.camera );
            Raycaster.enabled = !!Raycaster.intersect.length && Mouse.enabled;
            Raycaster.objects();

            var index = Raycaster.first ? 0 : Raycaster.intersect.length - 1;

            if ( Raycaster.enabled && Raycaster.intersect[ index ] )
            {
                let position = new THREE.Vector3().copy( Raycaster.position( Raycaster.intersect[ index ].point ) );
                let args = {};

                Raycaster.current = Object.assign( { group: Raycaster.intersect[ index ].object.parent }, Raycaster.intersect[ index ].object.userData );

                switch ( Raycaster.mode )
                {
                    case "edit":
                        args = Raycaster.selected;
                        Raycaster.fields.cursor.update( new THREE.Vector3().fromArray( Tools.snap( position, Raycaster.snap ) ) );
                    break;

                    case "select":
                        args = Raycaster.current;
                        Raycaster.fields.cursor.update( Tools.vector.round( position, 2 ) );
                    break;
                }

                Raycaster.action( args );
                Raycaster.fields.current.update( Raycaster.current.segment || "" );
                Objects.cursor.move( position );
                Objects.crosshairs.move( position );
            }
        }
    };

    const Tools =
    {
        color: ( value ) => value.substring( value.length - 7 ),
        isArray: ( obj ) => Object.prototype.toString.call( obj ) === '[object Array]',
        isObject: ( obj ) => ( typeof obj === 'object' ) && ( obj !== null ),
        isValue: ( value ) => !( ( value == "" ) || ( value == null ) || ( typeof value == "undefined" ) ),
        precision: ( value, decimals ) => Math.round( value * Math.pow( 10, decimals ) ) / Math.pow( 10, decimals ),
        query: async ( params ) =>
        {
            var response = await app.getters.db( params );
            var data = {};

            if ( !params.key )
                return response.data;
            else
                response.data.forEach( obj =>
                {
                    var key = obj[ params.key ];
                    delete obj[ params.key ];
                    data[ key ] = obj;
                } );

            return data;
        },
        snap: ( point, spacing ) => axes.map( axis =>
        {
            if ( scope.settings.grid.snap && spacing[ axis ] )
                return Math.round( point[ axis ] / spacing[ axis ] ) * spacing[ axis ];
            else
                return point[ axis ];
        } ),
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
        },
        unset: ( set ) =>
        {
            // Set() to value
            var value;

            for ( let item of set )
                value = item;

            return value;
        },
        vector:
        {
            round: ( vector, decimals ) => new THREE.Vector3().fromArray( Object.values( vector ).map( value => Tools.precision( value, decimals ) ) )
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