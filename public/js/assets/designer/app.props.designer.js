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
            snap: 0.5,
            grid:
            {
                size: { x: 40, y: 10, z: 40 },
                spacing: { x: 5, y: 1, z: 5 }
            }
        };

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.grid = {};
        scope.grid.group = new THREE.Group();
        scope.grid.group.name = "grid";
        Object.assign( scope.grid, new Helpers.Grid() );
        scope.group.add( scope.grid.group );

        scope.markers = {};
        scope.markers.group = new THREE.Group();
        scope.markers.group.name = "markers";
        scope.group.add( scope.markers.group );

        scope.cursor = {};
        scope.cursor.group = new THREE.Group();
        scope.cursor.group.name = "cursor";
        Object.assign( scope.cursor, new Helpers.Marker( scope.cursor.group, 0.1, "white" ) );
        scope.group.add( scope.cursor.group );

        scope.crosshairs = {};
        scope.crosshairs.group = new THREE.Group();
        scope.crosshairs.group.name = "crosshairs";
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
                if ( Process.hooks.points )
                {
                    let field = Process.hooks.points.points.fields.find( field => field.label == "add" );
                        field.update( scope.grid.group.position.clone() );
                }
            }
        },
        group:
        {
            add: ( detail ) =>
            {
                var name = detail.field.value;
                var params = Object.assign( {}, detail.params );
                    params.value = { color: "#" + app.utils.hex(), name: name, parent: detail.params.value };
                    params.map = detail.params.map + "." + name;

                scope.current.assign( "params", params );
                scope.current.setGroups( detail.breadcrumbs );

                if ( name )
                {
                    // initialize group
                    let group = new THREE.Group();
                        group.name = name;
                        group.userData.group = name;

                    let parent = scope.current.group;
                        parent.add( group );

                    scope.current.set( "data", params.data );
                    scope.current.set( "group", group );
                    scope.current.set( "name", name );

                    scope.current.data.groups[ name ] = params.value;

                    // save group to db
                    app.setters.db( scope.current.params );

                    // initialize points
                    let map = [];
                        map.push( "points" );
                        map.push( name );

                    let points =
                    {
                        map: map.join( "." ),
                        path: scope.current.params.path,
                        value: scope.current.data.points[ name ] || {}
                    };

                    scope.current.data.points[ name ] = points.value;
                    scope.current.watch();

                    // save points to db
                    app.setters.db( points, Forms.points.edit );
                }
            },
            breadcrumbs: ( key, detail ) =>
            {
                var delim = ".";

                detail.breadcrumbs.forEach( name =>
                {
                    var value = name == scope.group.name || !detail.params.value;

                    var map = detail.params.map.split( delim );
                        map.push( name );
                        map.push( key );

                    var params =
                    {
                        path: detail.params.path,
                        map: map.join( delim ),
                        value: value
                    };

                    app.setters.db( params );
                } );
            },
            define: ( data ) =>
            {
                // scene graph
                var root = {};
                var sorted = Object.keys( data ).sort();

                for ( let k of sorted )
                {
                    let obj = data[ k ];

                    if ( !obj.parent )
                    {
                        root.data = obj;
                        root.group = scope.group;
                    }

                    let parent = data[ obj.parent ] || { name: obj.name, color: obj.color };
                        parent.children = [ ...parent.children || [], obj ];
                }

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
                Process.group.breadcrumbs( "expand", event.detail );
            },
            select: ( event ) =>
            {
                Forms.points.edit();

                Process.group.visibility( event );
            },
            visibility: ( event ) =>
            {
                event.detail.params.value = event.detail.params.visible;

                delete event.detail.params.visible;

                Process.group.breadcrumbs( "visible", event.detail );
            }
        },
        hooks: {},
        init: () =>
        {
            UI.init();
            Forms.project.select();
            Process.mode.set( { points: "select" } );
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
            add: () =>
            {
                // points > array > vector > +
                var map = scope.current.params.map.split( "." );
                var set = map[ map.length - 1 ];
                var points = scope.current.params.data.points[ scope.current.name ];
                    points[ set ] = scope.current.params.value;

                Process.points.save();
            },
            change: () =>
            {
                // change from form
                Process.points.save();
            },
            create: () =>
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

                Process.points.save();
            },
            delete: () =>
            {
                // points > set > controls > -
                app.db.deleteField( scope.current.params, ( response ) =>
                {
                    var map = scope.current.params.map.split( "." );
                    var set = map.pop();
                    var args =
                    {
                        group: scope.current.group,
                        set: set
                    };
                    var points = scope.current.params.data.points[ scope.current.name ];

                    // remove the map and update the data
                    scope.current.assign( "params", { data: response.data, map: map.join( "." ), set: set } );

                    delete scope.current.params.value;
                    delete points[ set ];

                    // hide the array
                    Process.hooks.points.points.element.parentNode.classList.add( "hide" );
                    // change button states
                    Process.hooks.points.check( set );
                    // reset the field value
                    Process.hooks.points.set.update( "" );
                    // update the points array
                    Process.hooks.points.points.refresh( { data: [] } );

                    // clear the drawing
                    Objects.plot.delete( args );
                } );
            },
            highlight: ( point ) =>
            {
                // group > set > array > mouseover()
                if ( point )
                    Objects.markers.highlight( point );
            },
            remove: () =>
            {
                // points > set > array > vector > -
                Process.points.save();
            },
            reorder: ( elements ) =>
            {
                // group > set > array > drag()
                var array = { ...scope.current.params.data };
                var map = scope.current.params.map.split( "." );
                    map.forEach( key => array = array[ key ] );
                var dragged = Number( elements.dragged.dataset.index );
                var dropped = Number( elements.dropped.dataset.index );
                // get item at dragged and delete ( 1 )
                var item = array.splice( dragged, 1 )[ 0 ];
                //  add item to array in dropped position and delete ( 0 )
                array.splice( dropped, 0, item );

                scope.current.params.value = array;

                Process.points.save();
            },
            reset: () =>
            {
                // points > set > controls > []
                var map = scope.current.params.map.split( "." );
                var set = map.pop();

                scope.current.assign( "params", { value: [] } );
                scope.current.params.data.points[ scope.current.name ][ set ] = scope.current.params.value;

                Process.hooks.points.set.update( set );
                Process.hooks.points.points.refresh( { data: scope.current.params.value } );

                Process.points.save();
            },
            save: () =>
            {
                //console.warn( "save", scope.current );

                // save to db
                app.setters.db( scope.current.params, () => Objects.plot.group( scope.current.group ) );
            },
            select: () =>
            {
                // when shift is up, markers are intersected and group > set > points are displayed
                Raycaster.select = true;

                Raycaster.intersect.forEach( intersection =>
                {
                    if ( intersection.object.userData.type == "marker" )
                    {
                        let marker = intersection.object;
                        let set = Process.hooks.points.set;
                            set.update( marker.userData.set );
                        let event = set.handlers.find( handler => handler.event == "select" );
                            event.handler( marker.userData.group, marker.userData.set );

                        Forms.points.highlight( marker.userData.index );
                    }
                } );
            },
            set: () =>
            {
                // set from mouse click
                if ( scope.current.params.data.hasOwnProperty( "points" ) )
                {
                    let points = scope.current.params.data.points[ scope.current.name ];
                    let position = scope.cursor.object.position.clone();
                    let vector = {};
                    let map = scope.current.params.map.split( "." );
                    let set = map[ map.length - 1 ];

                    // convert from THREE.Vector3
                    Object.keys( position ).forEach( axis => vector[ axis ] = position[ axis ] );

                    //console.log( scope.current.name, points, set, map );

                    if ( points.hasOwnProperty( set ) )
                    {
                        scope.current.params.value.push( vector );
                        points[ set ] = scope.current.params.value;

                        Process.hooks.points.points.refresh( { data: scope.current.params.value } );
                        Process.points.save();
                    }
                }
            },
            unlight: ( point ) =>
            {
                // group > set > array > mouseout()
                if ( point )
                    Objects.markers.unlight( point );
            }
        },
        project:
        {
            load: ( event ) =>
            {
                UI.cancel( app.ui.modal );
                UI.reset( app.ui.widget );

                Process.group.define( event.detail.params.data.groups );

                scope.current.set( "project", event.detail.params.value.name );
                scope.current.set( "params", event.detail.params );
                scope.current.set( "name", scope.group.name );

                //console.warn( event.detail );
                //

                Objects.plot.all();

                // TODO: move further down the pipeline
                Raycaster.initialize();
                Listeners.initialize();

                // TODO: define toools
                //app.ui.toolbar.prepend( { icon: parseInt( "1F50E", 16 ), title: "Inspect", action: () => {} } );
                //app.ui.toolbar.prepend( { icon: 9776, title: "Layer Visibility", action: () => {} } );
                Forms.grid.settings();
                Forms.group.select();
            },
            select: () =>
            {
                UI.cancel( app.ui.modal );
                UI.reset( app.ui.widget );

                Forms.group.select();
            }
        }
    };

    const Forms =
    {
        grid:
        {
            settings: () =>
            {
                var form = new DB.Forms();
                    form.init( { parent: app.ui.widget, title: "Grid" } );
                    form.add( { name: "position", label: "position", type: "vector", value: { x: 0, y: 0, z: 0 }, parent: "", required: true,
                        data: { output: false },
                        handlers: [ { event: "input", handler: Process.grid.translate } ] } );
                    form.add( { name: "visibility", label: "visibility", type: "toggle", value: { on: true }, parent: "", required: true,
                        data: { output: false, source: [ { on: true }, { off: false } ] },
                        handlers: [ { event: "click", handler: Process.grid.toggle } ] } );
            }
        },
        project:
        {
            select: () =>
            {
                var path = [ "projects" ];
                var form = new DB.Forms();
                    form.init( { parent: app.ui.modal, title: "Project" } );
                    form.add( { name: "name", label: "select", type: "datalist", value: "", parent: "", required: true,
                        data: { output: "name", source: { getter: app.getters.db, params: { path: path.join( "/" ) } } },
                        handlers: [ { event: "input", handler: function() 
                        {
                            var _path = [ ...path ];
                                _path.push( this.value );
                            submit.data.destination.params = { path: _path.join( "/" ) };
                        } } ] } );
                var submit = form.add( { name: "submit", label: "", type: "submit", value: "select", parent: "",
                        data: { output: false, destination: { setter: app.setters.db } },
                        handlers: [ { event: "validated", handler: Process.project.load } ] } );
            }
        },
        group:
        {
            select: () =>
            {
                var path = [ "projects", scope.current.project ];
                var map = "groups";
                var select = new DB.Forms();
                    select.init( { parent: app.ui.widget, title: "Select Group" } );
                var tree = select.add( { name: "parent", label: "name", type: "tree", value: "", parent: "", add: Process.group.add,
                        data: { output: "name", source: { getter: app.getters.db, params: { path: path.join( "/" ), map: map } } },
                        handlers: [ { event: "validated", handler: Process.group.select }, { event: "expansion", handler: Process.group.expansion } ]
                    } );
            }
        },
        points:
        {
            edit: () =>
            {
                var map = "points";
                var data = scope.current.params.data;
                var object = data[ map ][ scope.current.name ] || {};
                var array = [];

                // change set
                function change( group, set )
                {
                    if ( set )
                    {
                        let _map = [];
                            _map.push( map );
                            _map.push( group );
                            _map.push( set );

                        array = object[ set ] || [];
                        
                        Process.hooks.points.points.refresh( { data: array } );

                        scope.current.assign( "params",
                        {
                            value: array,
                            map: _map.join( "." )
                        } );

                        Process.hooks.points.controls.element.parentNode.classList.remove( "hide" );
                        Process.hooks.points.points.element.parentNode.classList.remove( "hide" );
                    }
                    else
                        Forms.points.hide();

                    check( set );
                }

                // set control states
                function check( set )
                {
                    var object = scope.current.params.data[ map ][ scope.current.name ] || {};
                    var add = Process.hooks.points.controls.buttons.find( button => button.title == "add" );
                        add.disabled = object[ set ];
                    var reset = Process.hooks.points.controls.buttons.find( button => button.title == "reset" );
                        reset.disabled = !add.disabled;
                    var del = Process.hooks.points.controls.buttons.find( button => button.title == "delete" );
                        del.disabled = !add.disabled;

                    if ( add.disabled )
                    {
                        add.element.classList.add( "formdisabled" );
                        reset.element.classList.remove( "formdisabled" );
                        del.element.classList.remove( "formdisabled" );

                        Process.hooks.points.points.element.parentNode.classList.remove( "hide" );
                    }
                    else
                    {
                        add.element.classList.remove( "formdisabled" );
                        reset.element.classList.add( "formdisabled" );
                        del.element.classList.add( "formdisabled" );

                        Process.hooks.points.points.element.parentNode.classList.add( "hide" );
                    }
                }

                var form = new DB.Forms();
                    form.init( { name: "points", parent: app.ui.widget, title: `${ scope.current.name } Points` } );
                var group = form.add( { name: "group", label: "group", type: "hidden", value: scope.current.name, parent: "", required: true,
                        data: { output: true } } );
                var set = form.add( { name: "set", label: "segment name", type: "datalist", value: "", parent: "", required: true,
                        data: { output: true, source: { getter: app.getters.object, params: { data: object } } },
                        handlers:
                        [
                            { event: "input", handler: ( e ) => change( scope.current.name, e.target.value ) },
                            { event: "select", handler: change }
                        ]
                    } );
                var controls = form.add( { name: "controls", label: "", type: "controls", value: "", parent: "", hidden: true,
                        buttons:
                        [
                            { icon: "+", action: Process.points.create, title: "add", disabled: true },
                            { icon: "[]", action: Process.points.reset, title: "reset" },
                            { icon: "-", action: Process.points.delete, title: "delete" }
                        ],
                        data: { output: false }
                    } );
                var points = form.add( { name: "array", label: "points", type: "array", value: { x: 0, y: scope.grid.group.position.y, z: 0 }, parent: "", required: true, hidden: true,
                        data: { output: true, field: { type: "vector" }, source: { getter: app.getters.object, params: { data: array } } },
                        handlers:
                        [
                            { event: "add", handler: Process.points.add },
                            { event: "remove", handler: Process.points.remove },
                            { event: "input", handler: Process.points.change },
                            { event: "mouseover", handler: Process.points.highlight },
                            { event: "mouseout", handler: Process.points.unlight },
                            { event: "drop", handler: Process.points.reorder }
                        ]
                    } );

                Process.hooks.points =
                {
                    group: group,
                    set: set,
                    controls: controls,
                    points: points,
                    check: check
                };
            },
            hide: () =>
            {
                Process.hooks.points.controls.element.parentNode.classList.add( "hide" );
                Process.hooks.points.points.element.parentNode.classList.add( "hide" );
            },
            highlight: ( index ) =>
            {
                var children = Array.from( Process.hooks.points.points.element.children );
                    children.forEach( child =>
                    {
                        if ( child.hasAttribute( "draggable" ) && child.getAttribute( "data-index" ) == index )
                            child.classList.add( "formselected" );
                        else
                            child.classList.remove( "formselected" );
                    } );
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
            size = size || 0.1;
            color = color ? new THREE.Color( color ) : scope.current.color;
            this.object = Objects.box.add( group, size, color );
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
            document.addEventListener( 'keydown',   Listeners.keydown, false );
            document.addEventListener( 'keyup',     Listeners.keyup, false );
            document.addEventListener( 'mousemove', Mouse.move, false );
            document.addEventListener( 'mousedown', Mouse.down, false );
            document.addEventListener( 'mouseup',   Mouse.up, false );
            document.addEventListener( 'click',     Listeners.click, false );
            document.addEventListener( 'dblclick',  () => UI.cancel( app.ui.modal ), false );
        },
        click: ( event ) =>
        {
            event.preventDefault();

            if ( Process.mode.status.points )
                Process.points[ Process.mode.status.points ]();
        },
        keydown: ( event ) =>
        {
            if ( event.key === "Control" )
                Raycaster.set( "y" );

            if ( event.key === "Shift" )
                Process.mode.set( { points: "set" } );
        },
        keyup: ( event ) =>
        {
            if ( event.key === "Control" )
                Raycaster.set( "xz" );

            if ( event.key === "Shift" )
                Process.mode.set( { points: "select" } );
        }
    };

    const Mouse =
    {
        direction: new THREE.Vector3( 1, 0, 1 ),
        enabled: true,
        down: () => Mouse.enabled = false,
        move: ( event ) =>
        {
            if ( Mouse.enabled )
            {
                Mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                Mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

                Raycaster.update();
            }
        },
        up: () => Mouse.enabled = true
    };
    
    const Objects = 
    {
        box:
        {
            add: ( group, size, color ) =>
            {
                var geometry = new THREE.BoxBufferGeometry( size, size, size );
                var material = new THREE.MeshBasicMaterial( { color: color, wireframe: true } );
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
            }
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
                var lines = new THREE.Line( geometry, material );
                    lines.name = "line";
                    lines.userData.group = args.group.name;
                    lines.userData.set = args.set;

                args.group.add( lines );

                return lines;
            },
            remove: ( args ) =>
            {
                args.group.children.forEach( line =>
                {
                    if ( line.userData.set == args.set )
                        Objects.dispose( args.group, line );
                } );
            }
        },
        markers:
        {
            add: ( args ) =>
            {
                var marker = new Helpers.Marker( scope.markers.group, 0.1, args.color );
                    marker.object.position.copy( args.point );
                    marker.object.userData.group = args.group.name;
                    marker.object.userData.set = args.set;
                    marker.object.userData.index = args.index;
            },
            highlight: ( point ) =>
            {
                var position = new THREE.Vector3();
                var map = scope.current.params.map.split( "." );
                var set = map.pop();

                Object.keys( point ).forEach( axis => position[ axis ] = point[ axis ] );

                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == scope.current.name && child.userData.set == set && child.position.equals( position ) )
                         child.material.color = new THREE.Color();
                } );
            },
            remove: ( args ) =>
            {
                /*var count = scope.markers.group.children.length;

                for ( let i = count - 1; i > 0; i-- )
                {
                    let child = scope.markers.group.children[ i ];

                    console.warn ( child.userData.set, args.set, child.userData.set == args.set )
                    console.log ( scope.markers.group.children.length )

                    if ( child.userData.group == args.group.name && child.userData.set == args.set )
                        Objects.dispose( scope.markers.group, child );

                }*/

                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == args.group.name && child.userData.set == args.set )
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
            unlight: ( point ) =>
            {
                var position = new THREE.Vector3();
                var map = scope.current.params.map.split( "." );
                var set = map.pop();

                Object.keys( point ).forEach( axis => position[ axis ] = point[ axis ] );

                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == scope.current.name && child.userData.set == set && child.position.equals( position ) )
                         child.material.color = scope.current.get( "color" );
                } );
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
                var points = scope.current.params.data.points;

                for ( let name in points )
                    if ( points.hasOwnProperty( name ) )
                    {
                        let group = scope.groups.find( group => name == group.name );

                        Objects.plot.group( group );
                    }

                //scope.groups.forEach( group => console.log( group.name, group.parent.name, group.visible ) );
            },
            delete: ( args ) =>
            {
                Objects.lines.remove( args );
                Objects.markers.remove( args );
            },
            group: ( group ) =>
            {
                console.warn( group, scope.current.name );

                var points = scope.current.params.data.points[ group.name ];
                var groups = scope.current.params.data.groups;
                var color  = Tools.color( groups[ group.name ].color );// || scope.current.color;



                //group.visible = scope.group.name == scope.current.name || !groups[ scope.current.name ].visible;

                //scope.current.set( "color", new THREE.Color( color ) );

                for ( let set in points )
                    if ( points.hasOwnProperty( set ) )
                    {
                        let args =
                        {
                            group: group,
                            set: set,
                            points: points[ set ],
                            color: color
                        };

                        Objects.plot.points( args );
                    }
            },
            points: ( args ) =>
            {
                /*args.points.forEach( ( point, i ) =>
                {
                    args.point = point;
                    args.index = i;

                    Objects.markers.remove( args );
                    Objects.markers.add( args );
                } );*/

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
        mode: "xz",
        objects: () =>
        {
            switch ( Raycaster.mode )
            {
                /*case "y":
                    Raycaster.intersects = [ scope.planes.y, scope.planes.z ];
                break;*/

                case "xz":
                    Raycaster.intersects = [ scope.grid.object ];//[ scope.planes.x ];
                break;
            }

            //if ( Raycaster.select )
            //    Raycaster.intersects = [ scope.planes.x ].concat( scope.markers.group.children );

            Raycaster.intersect = Raycaster.raycaster.intersectObjects( Raycaster.intersects );
        },
        set: ( mode ) => Raycaster.mode = mode,
        select: true,
        update: () =>
        {
            Raycaster.raycaster.setFromCamera( Mouse, app.stage.camera );
            Raycaster.objects();
            Raycaster.enabled = !!Raycaster.intersect.length;

            if ( Raycaster.enabled )
            {
                let position = new THREE.Vector3();
                    position.set( ...Tools.snap( Raycaster.intersect[ 0 ].point, Raycaster.snap.clone() ) );

                Objects.cursor.move( position );
                Objects.cursor.visibility( Process.points.enabled );
                Objects.crosshairs.move( position );
                //Objects.planes.move( position );
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