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
                /*event.detail.field.data.destination.setter( event.detail.params, event.detail.data, ( response ) =>
                {
                    console.warn( response );
                } );*/

                //var data = event.detail.data;
                //console.log( "add group", data )
                /*Forms.utils.validate( form, data, success );

                function success()
                {
                    // TODO: add group to database

                    // store used colors
                    scope.colors.push( parseInt( data.color ) );
                    scope.current.color = new THREE.Color().setHSL( data.color / 360, 1, 0.5 );

                    var parent = scope.group.getObjectByName( data.parent );
                    var group = scope.group.getObjectByName( data.group );

                    if ( group )
                    {
                        Raycaster.mode = "edit";
                        scope.current.group = group;
                        UI.message( `${ data.group } exists` );
                    }
                    else
                    {
                        Raycaster.mode = "add";
                        scope.current.group = new THREE.Group();
                        scope.current.group.name = data.group;
                        parent.add( scope.current.group );
                        Actions.group.define( scope.current.group );
                    }

                    scope.current.points = [];

                    UI.modal.clear();
                    UI.modal.hide();
                    Widgets.group();
                }*/
            },
            select: ( event ) =>
            {
                scope.current.group = event.detail.value;
                scope.current.params.data = event.detail.params.data;

                if ( scope.current.params.data.points.hasOwnProperty( scope.current.group ) )
                {
                    Objects.plot.group( scope.current.group );
                    Forms.points.edit( event );
                }
            }
        },
        init: () =>
        {
            UI.modal.clear();
            UI.modal.show();
            Forms.project.select();
        },
        points:
        {
            add: ( event ) =>
            {
                console.warn( "points add", event, scope.current );
                Objects.plot.group( scope.current.group );
            },
            remove: ( event ) =>
            {
                console.warn( "points remove", event, scope.current );
                Objects.plot.group( scope.current.group );
            }
            /*add: () =>
            {
                var position = scope.cursor.object.position;


                var predicate = scope.current.points.every( point => !point.position.equals( position ) );

                // if point is not in array
                if ( predicate && Process.points.enabled )
                {
                    let marker = new Helpers.Marker( scope.current.group, 0.05 );
                        marker.object.position.copy( position );
                    let point = new Data.Point( { index: scope.current.points.length, parent: scope.current.group, position: marker.object.position, object: marker.object } );

                    // add a new point
                    if ( Process.points.index === -1 )
                        Objects.points.add( scope.current.points, point );
                    // insert a replacement point at index
                    else
                    {
                        Objects.points.replace( scope.current.points, point );
                        Objects.lines.remove( scope.current.group );
                    }

                    // set flag to add new point
                    Process.points.index = -1;

                    // draw the lines
                    Objects.lines.add( scope.current.group, scope.current.points.map( point => point.position ), scope.current.color );
                }
                // point already exists in array
                else
                {
                    let index = scope.current.points.findIndex( point => point.position.equals( position ) );
                    let marker = scope.current.points[ index ].object;

                    scope.current.points[ index ].index = index;

                    // set flag to remove point at index
                    Process.points.index = index;
                    Objects.labels.remove( scope.current.points[ index ] );
                    Objects.points.remove( scope.current.points );
                    Objects.lines.remove( scope.current.group );
                    Objects.remove( scope.current.group, marker );
                    // draw the lines
                    Objects.lines.add( scope.current.group, scope.current.points.map( point => point.position ), scope.current.color );
                }
            },*/
            /*close: () =>
            {
                var position = scope.current.points[ 0 ].position;
                var marker = scope.current.points[ 0 ].object;
                var point = new Data.Point( { parent: scope.current.group, position: position, object: marker } );

                scope.current.points.push( point );

                Objects.lines.add( scope.current.group, scope.current.points.map( point => point.position ), scope.current.color );
            },
            edit: () => console.warn( scope.mode, scope.cursor.object.position, scope.current.group ),
            enabled: false,
            index: -1,
            remove: ( position ) =>
            {
                var index = scope.current.points.findIndex( point => point.position.equals( position ) );

                scope.current.points.splice( index, 1 );
            },
            set: ( bool ) => Process.points.enabled = bool*/
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
                    create.init( { parent: app.ui.widget, title: "Add Group" } );
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
                var object = data[ map ][ event.detail.value ];
                var array = [];

                function change()
                {
                    if ( this.value )
                    {
                        let _map = [];
                            _map.push( map );
                            _map.push( event.detail.value );
                            _map.push( this.value );

                        array = object[ this.value ];
                        points.refresh( { data: array } );
                        scope.current.params =
                        {
                            path: scope.current.path.join( "/" ),
                            data: array,
                            map: _map.join( "." )
                        };

                        console.log( scope.current.params )
                    }
                }

                console.log( data, object, array );

                var form = new DB.Forms();
                    form.init( { parent: app.ui.widget, title: `${ event.detail.value } Points` } );
                    form.add( { name: "group", label: "group", type: "hidden", value: event.detail.value, parent: "", required: true,
                        data: { output: true } } );
                    form.add( { name: "name", label: "set name", type: "datalist", value: "", parent: "", required: true,
                        data: { output: true, source: { getter: app.getters.object, params: { data: object } } },
                        handlers: [ { event: "input", handler: change } ]
                    } );
                var points = form.add( { name: "array", label: "points", type: "array", value: new THREE.Vector3(), parent: "", required: true,
                        data: { output: true, field: { type: "vector" }, source: { getter: app.getters.object, params: { data: array } } },
                        handlers: [ { event: "add", handler: Process.points.add }, { event: "remove", handler: Process.points.remove } ]
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

                this[ axis ] = Objects.lines.add( scope.crosshairs.group, [ p, q ], new THREE.Color( colors[ i ] ) );
                this[ axis ].name = `${ axis }-axis`;
            } );
        },
        Grid: function()
        {
            const size = scope.settings.grid.size;
            const spacing = scope.settings.grid.spacing;
            const lines = [ new THREE.Color( 0x111111 ), new THREE.Color( 0x030303 ) ];
            const y = -0.01;

            this.object = new THREE.Mesh( new THREE.PlaneBufferGeometry( size.x, size.z, 1, 1 ).rotateX( -Math.PI * 0.5 ), new THREE.MeshBasicMaterial( { color: new THREE.Color( 0x010101 ), transparent: true, opacity: 0.75 } ) );
            this.object.name = "grid.plane";
            this.object.position.y = y * 2;
            scope.grid.group.add( this.object );

            for ( let x = -size.x / 2; x <= size.x / 2; x++ )
            {
                let points = [];
                    points.push( new THREE.Vector3( x, y, -size.z / 2 ) );
                    points.push( new THREE.Vector3( x, y, size.z / 2 ) );

                const index = !( x % spacing.x ) ? 0 : 1;
                const color = x ? lines[ index ] : new THREE.Color( colors[ 2 ] );

                Objects.lines.add( scope.grid.group, points, color );
            }

            for ( let z = -size.z / 2; z <= size.z / 2; z++ )
            {
                let points = [];
                    points.push( new THREE.Vector3( -size.x / 2, y, z ) );
                    points.push( new THREE.Vector3( size.x / 2, y, z ) );

                const index = !( z % spacing.z ) ? 0 : 1;
                const color = z ? lines[ index ] : new THREE.Color( colors[ 0 ] );

                Objects.lines.add( scope.grid.group, points, color );
            }
        },
        Marker: function( group, size, color )
        {
            size = size || 0.1;
            color = color ? new THREE.Color( color ) : scope.current.color;
            this.object = Objects.box.add( group, size, color );
            this.object.name = "marker" + this.object.id;
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

            if ( Process.points.enabled )
                Actions.points.add();
        },
        keydown: ( event ) =>
        {
            //event.preventDefault();

            if ( event.key === "Control" )
                Raycaster.set( "y" );

            if ( event.key === "Shift" )
                Process.points.set( true );
        },
        keyup: ( event ) =>
        {
            //event.preventDefault();

            if ( event.key === "Control" )
                Raycaster.set( "xz" );

            if ( event.key === "Shift" )
                Process.points.set( false );
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
            add: ( group, points, color ) =>
            {
                var geometry = new THREE.BufferGeometry().setFromPoints( points );
                var material = new THREE.LineBasicMaterial( { color: color } );
                var lines = new THREE.Line( geometry, material );
                    lines.name = "line";

                group.add( lines );

                return lines;
            },
            redraw: () =>
            {
                Objects.lines.remove( scope.current.group );
                Objects.lines.add( scope.current.group, scope.current.points.map( point => point.position ), scope.current.color );
            },
            remove: ( group ) =>
            {
                var remove = Objects.select( group, "line" );
                Objects.remove( group, remove );
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
            },
            remove: ( group ) =>
            {
                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == group )
                        scope.markers.group.remove( child );
                } );
            },
            toggle: ( group ) =>
            {
                scope.markers.group.children.forEach( child =>
                {
                    if ( child.userData.group == group )
                        child.visible = !child.visible;
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

                for ( let group in points )
                    if ( points.hasOwnProperty( group ) )
                        Objects.plot.group( group );
            },
            group: ( group ) =>
            {
                var points = scope.current.params.data.points[ group ];
                var groups = scope.current.params.data.groups;
                var parent = scope.group.getObjectByName( groups[ group ].parent, true );
                var self   = scope.group.getObjectByName( group, true );

                if ( !self )
                {
                    self = new THREE.Group();
                    self.name = group;
                    self.userData.group = group;
                    parent.add( self );
                }
                else
                {
                    Objects.clear( self );
                    Objects.markers.remove( group );
                }

                for ( let set in points )
                {
                    if ( points.hasOwnProperty( set ) )
                    {
                        self.userData.set = set;
                        Objects.plot.points( { group: self, set: set, points: points[ set ], color: groups[ group ].color } );
                    }
                }
            },
            points: ( args ) =>
            {
                args.points.forEach( point =>
                {
                    args.point = point;
                    Objects.markers.add( args );
                } );

                if ( args.points.length > 1 )
                    Objects.lines.add( args.group, args.points, args.color );
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
            switch( Raycaster.mode )
            {
                case "y":
                    Raycaster.intersects = [ scope.planes.y, scope.planes.z ];
                break;

                case "xz":
                    Raycaster.intersects = [ scope.planes.x ];
                break;

                case "edit":
                    Raycaster.intersects = scope.markers.group.children;
                break;
            }

            Raycaster.intersect = Raycaster.raycaster.intersectObjects( Raycaster.intersects );
        },
        set: ( mode ) => Raycaster.mode = mode,
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