export function Helpers( scope )
{
    const axes = [ "x", "y", "z" ];

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
                    mesh.scale.set( size, size, size );

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
                    material.opacity = args.opacity || scope.settings.marker.opacity;
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

    this.Crosshairs = function()
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
                color: new THREE.Color(),
                opacity: 0.25
            };

            this[ axis ] = Objects.lines.add( args );
            this[ axis ].name = `${ axis }-axis`;
            this[ axis ].userData.type = "crosshairs";
            this[ axis ].userData.axis = axis;
        } );

        this.move = ( position ) =>
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
        };

        this.visibility = ( bool ) => scope.crosshairs.group.children.forEach( child => child.visible = bool );
    };
    
    this.Grid = function()
    {
        const colors = scope.settings.axis;
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
            const color = x ? lines[ index ] : new THREE.Color( colors.z );
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
            const color = z ? lines[ index ] : new THREE.Color( colors.x );
            const args =
            {
                group: scope.grid.group,
                points: points,
                color: color
            };

            Objects.lines.add( args );
        }
    };
    
    this.Marker = function( group, size, color )
    {
        size = size || scope.settings.appearance.marker;

        this.object = Objects.box.add( group, size, new THREE.Color( color ) );
        this.object.name = "marker" + this.object.id;
        this.object.userData.type = "marker";
    };
    
    this.Planes = function( group )
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
}