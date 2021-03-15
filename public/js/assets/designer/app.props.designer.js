const Designer = function()
{
    var scope = this;
    var axes = [ "x", "y", "z" ];
    var colors = [ 0x110000, 0x001100, 0x000011 ];

    scope.init = function( args )
    {
        Object.assign( scope, args );

        scope.groups = {};
        scope.colors = [];
        scope.current = {};

        scope.settings =
        {
            snap: 0.5,
            grid:
            {
                size: { x: 60, y: 10, z: 60 },
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

        scope.planes = {};
        scope.planes.group = new THREE.Group();
        scope.planes.group.name = "planes";
        Object.assign( scope.planes, new Helpers.Planes( scope.planes.group ) );
        scope.group.add( scope.planes.group );

        scope.current =
        {
            data: {},
            group: scope.group.name,
            params: {},
            path: []
        };

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

    const Process =
    {
        group:
        {
            add: ( event ) =>
            {
                Forms.points.edit( event );
            },
            select: ( event ) =>
            {
                scope.current.group = event.detail.value;
                scope.current.data = event.detail.params.data;

                var parent = scope.group;

                // tree selection to groups hierarchy
                event.detail.breadcrumbs.forEach( name =>
                {
                    var group = parent.getObjectByName( name );

                    if ( !group )
                    {
                        group = new THREE.Group();
                        group.name = name;
                        group.userData.group = name;
                    }

                    if ( parent !== group )
                        parent.add( group );

                    parent = group;
                } );

                // plot if points defined
                if ( scope.current.data.points.hasOwnProperty( scope.current.group ) )
                    Objects.plot.group( scope.current.group );

                Forms.points.edit( event );
            }
        },
        hooks: {},
        init: () =>
        {
            UI.modal.clear();
            UI.modal.show();
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
                // add from form
                Process.points.close();
                Process.points.save();
            },
            close: () =>
            {
                // close path button visibility
                if ( scope.current.params.value.length > 2 )
                    Process.hooks.points.close.element.parentNode.classList.remove( "hide" );
                else
                    Process.hooks.points.close.element.parentNode.classList.add( "hide" );
            },
            change: () =>
            {
                // change from form
                Process.points.save();
            },
            delete: () =>
            {
                // group > set > controls > delete( map )
                app.db.deleteField( scope.current.params, () =>
                {
                    var map = scope.current.params.map.split( "." );
                        map.pop();
                    
                    delete scope.current.params.value;
                    
                    scope.current.params.map = map.join( "." );

                    Process.hooks.points.points.element.parentNode.classList.add( "hide" );
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
                // remove from form
                Process.points.close();
                Process.points.save();
            },
            reorder: ( elements ) =>
            {
                // group > set > array > drag()
                var array = { ...scope.current.data };
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
                // group > set > controls > reset( value = [] )
                var map = scope.current.params.map.split( "." );
                var name = map.pop();

                scope.current.params.value = [];
                scope.current.data.points[ scope.current.group ][ name ] = scope.current.params.value;

                Process.hooks.points.points.refresh( { data: scope.current.params.value } );

                Process.points.save();
            },
            save: () =>
            {
                // save to db
                app.setters.db( scope.current.params, scope.current.params.value, () =>
                {
                    //console.log( scope.current.group, scope.current.params );
                    Objects.plot.group( scope.current.group );
                } );
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
                            set.value = marker.userData.set;
                            set.element.value = set.value;
                        let event = set.handlers.find( handler => handler.event == "select" );
                            event.handler( marker.userData.group, marker.userData.set );

                        Forms.points.highlight( marker.userData.index );
                    }
                } );
            },
            set: () =>
            {
                // set from mouse click
                if ( Object.keys( scope.current.params ).length )
                {
                    var position = scope.cursor.object.position.clone();
                    var vector = {};

                    // convert from THREE.Vector3
                    Object.keys( position ).forEach( axis => vector[ axis ] = position[ axis ] );

                    scope.current.params.value.push( vector );

                    Process.hooks.points.points.refresh( { data: scope.current.params.value } );
                    Process.points.save();
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
                UI.modal.cancel();
                UI.widget.clear();
                UI.widget.show();

                Raycaster.initialize();
                Listeners.initialize();

                Forms.group.select( event );
            },
            select: ( event ) =>
            {
                UI.modal.clear();
                UI.modal.show();
                Forms.group.select( event );
            }
        }
    };

    const Forms =
    {
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
            select: ( event ) =>
            {
                var path = [ "projects", event.detail.data.name ];
                var map = "groups";
                var select = new DB.Forms();
                    select.init( { parent: app.ui.widget, title: "Select Group" } );
                    select.add( { name: "parent", label: "name", type: "tree", value: scope.current.group, parent: "",
                        data: { output: "name", source: { getter: app.getters.db, params: { path: path.join( "/" ), map: map } } },
                        handlers: [ { event: "validated", handler: function( event )
                        {
                            parent.value = this.value;
                            parent.element.value = this.value;
                            Process.group.select( event );
                        } } ]
                    } );
                var create = new DB.Forms();
                    create.init( { parent: app.ui.widget, title: "Add Group", collapsed: true } );
                var parent = create.add( { name: "parent", label: "parent", type: "hidden", value: scope.current.group, parent: "", required: true,
                        data: { output: true } } );
                    create.add( { name: "name", label: "name", type: "text", value: "", parent: "", required: true,
                        data: { output: true } } );
                    create.add( { name: "color", label: "color", type: "color", value: "", parent: "", required: true,
                        data: { output: true } } );
                    create.add( { name: "add", label: "", type: "validate", value: "add", parent: "",
                        data: { output: false, destination: { setter: app.setters.db, params: { path: path.join( "/" ), map: map } } },
                        handlers: [ { event: "validated", handler: function ( event )
                            {
                                event.detail.params.map = map + "." + event.detail.data.name;
                                create.message.add( event.detail.data.name, `${ event.detail.params.map } updated`, "formconfirm" );

                                Process.group.add( event );
                            }
                        } ]
                    } );

                scope.current.path = path;
            }
        },
        points:
        {
            edit: ( event ) =>
            {
                var map = "points";
                var data = event.detail.params.data;
                var object = data[ map ][ event.detail.value ] || {};
                var array = [];

                scope.current.data = data;

                function change( group, set )
                {
                    if ( set )
                    {
                        let _map = [];
                            _map.push( map );
                            _map.push( group );
                            _map.push( set );

                        array = object[ set ] || [];
                        points.refresh( { data: array } );
                        scope.current.params =
                        {
                            path: scope.current.path.join( "/" ),
                            value: array,
                            map: _map.join( "." )
                        };

                        controls.element.parentNode.classList.remove( "hide" );
                        points.element.parentNode.classList.remove( "hide" );

                        Process.points.close();
                    }
                    else
                        Forms.points.hide();
                }

                var form = new DB.Forms();
                    form.init( { name: "points", parent: app.ui.widget, title: `${ event.detail.value } Points` } );
                var group = form.add( { name: "group", label: "group", type: "hidden", value: event.detail.value, parent: "", required: true,
                        data: { output: true } } );
                var set = form.add( { name: "set", label: "set name", type: "datalist", value: "", parent: "", required: true,
                        data: { output: true, source: { getter: app.getters.object, params: { data: object } } },
                        handlers:
                        [
                            { event: "input", handler: ( e ) => change( event.detail.value, e.target.value ) },
                            { event: "select", handler: change }
                        ]
                    } );
                var controls = form.add( { name: "controls", label: "", type: "controls", value: "", parent: "", hidden: true,
                        buttons:
                        [
                            { icon: "[]", action: Process.points.reset, title: "reset" },
                            { icon: "-", action: Process.points.delete, title: "delete" }
                        ],
                        data: { output: false } } );
                var points = form.add( { name: "array", label: "points", type: "array", value: { x: 0, y: 0, z: 0 }, parent: "", required: true, hidden: true,
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
                var close = form.add( { name: "close", label: "", value: "close path", type: "button", hidden: true,
                    data: { output: false },
                    handlers: [ { event: "click", handler: Process.lines.close } ] } );

                Process.hooks.points =
                {
                    group: group,
                    set: set,
                    controls: controls,
                    points: points,
                    close: close
                };
            },
            hide: () =>
            {
                Process.hooks.points.controls.element.parentNode.classList.add( "hide" );
                Process.hooks.points.points.element.parentNode.classList.add( "hide" );
                Process.hooks.points.close.element.parentNode.classList.add( "hide" );
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
                    color: new THREE.Color( colors[ i ] )
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
            document.addEventListener( 'dblclick',  UI.modal.cancel, false );
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
                const geometry = new THREE.BoxBufferGeometry( size, size, size );
                const material = new THREE.MeshBasicMaterial( { color: color, wireframe: true } );
                const mesh = new THREE.Mesh( geometry, material );

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
                    var _axes = [ ...axes ]
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
            close: () =>
            {
                var args =
                {
                    group: scope.group.getObjectByName( scope.current.group, true ),
                    points: [ scope.current.params.value[ scope.current.params.value.length - 1 ], scope.current.params.value[ 0 ] ],
                    color: scope.current.color
                };

                Objects.lines.add( args );
            },
            draw: ( args ) =>
            {
                Objects.lines.remove( args );
                Objects.lines.add( args );
            },
            remove: ( args ) =>
            {
                args.group.children.forEach( line =>
                {
                    if ( line.userData.set == args.set )
                        args.group.remove( line );
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
            clear: ( args ) =>
            {
                [ ...scope.markers.group.children ].forEach( child =>
                {
                    if ( child.userData.group == args.group.name )
                        scope.markers.group.remove( child );
                } );
            },
            highlight: ( point ) =>
            {
                var position = new THREE.Vector3();
                var map = scope.current.params.map.split( "." );
                var name = map.pop();

                Object.keys( point ).forEach( axis => position[ axis ] = point[ axis ] );

                [ ...scope.markers.group.children ].forEach( child =>
                {
                    if ( child.userData.group == scope.current.group && child.userData.set == name && child.position.equals( position ) )
                         child.material.color = new THREE.Color();
                } );
            },
            remove: ( args ) =>
            {
                [ ...scope.markers.group.children ].forEach( child =>
                {
                    if ( child.userData.group == args.group.name && child.userData.set == args.set )
                        scope.markers.group.remove( child );
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
                var name = map.pop();

                Object.keys( point ).forEach( axis => position[ axis ] = point[ axis ] );

                [ ...scope.markers.group.children ].forEach( child =>
                {
                    if ( child.userData.group == scope.current.group && child.userData.set == name && child.position.equals( position ) )
                         child.material.color = new THREE.Color( scope.current.color );
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
                var points = scope.current.data.points;

                for ( let group in points )
                    if ( points.hasOwnProperty( group ) )
                        Objects.plot.group( group );
            },
            group: ( name ) =>
            {
                var points = scope.current.data.points[ name ];
                var groups = scope.current.data.groups;
                var group  = scope.group.getObjectByName( name, true );

                scope.current.color = groups[ name ].color;

                Objects.markers.clear( { group: group } );

                for ( let set in points )
                    if ( points.hasOwnProperty( set ) )
                    {
                        let args =
                        {
                            group: group,
                            set: set,
                            points: points[ set ],
                            color: groups[ name ].color
                        }

                        Objects.plot.points( args );
                    }
            },
            points: ( args ) =>
            {
                Objects.markers.remove( args );

                args.points.forEach( ( point, i ) =>
                {
                    args.point = point;
                    args.index = i;
                    Objects.markers.add( args );
                } );

                if ( args.points.length > 1 )
                    Objects.lines.draw( args );
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
        },*/
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
        }
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
                case "y":
                    Raycaster.intersects = [ scope.planes.y, scope.planes.z ];
                break;

                case "xz":
                    Raycaster.intersects = [ scope.planes.x ];
                break;
            }

            if ( Raycaster.select )
                Raycaster.intersects = [ scope.planes.x ].concat( scope.markers.group.children );

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
                let position = scope.cursor.object.position.clone();
                    position.set( ...Tools.snap( Raycaster.intersect[ 0 ].point, Raycaster.snap.clone() ) );

                Objects.cursor.move( position );
                Objects.cursor.visibility( Process.points.enabled );
                Objects.crosshairs.move( position );
                Objects.planes.move( position );
            }
        }
    }

    const Tools =
    {
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
        message: ( message ) => console.warn( message ),
        modal:
        {
            add:   ( element ) => app.ui.modal.appendChild( element ),
            cancel: () =>
            {
                UI.modal.clear();
                UI.modal.hide();
            },
            clear: () => app.ui.modal.innerHTML = null,
            hide:  () => app.ui.modal.classList.add( "hide" ),
            show:  () => app.ui.modal.classList.remove( "hide" )
        },
        widget:
        {
            add:   ( element ) => app.ui.widget.appendChild( element ),
            cancel: () =>
            {
                UI.widget.clear();
                UI.widget.hide();
            },
            clear: () => app.ui.widget.innerHTML = null,
            hide:  () => app.ui.widget.classList.add( "hide" ),
            show:  () => app.ui.widget.classList.remove( "hide" )
        }
    };
};