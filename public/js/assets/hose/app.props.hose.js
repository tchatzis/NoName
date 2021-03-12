const Hose = function()
{
    var app = {};
    var scope = this;

    /* handlers ***************************************************/
    // switch modes
    Object.defineProperty( scope, 'switch',
    {
        enumerable: false,
        value: function()
        {
            var modes = [ "tube", "object" ];
            var index = modes.indexOf( scope.mode );

            scope.mode = modes[ 1 - index ];
            scope[ scope.mode ]();
            app.utils.log( scope.mode, scope.current.sides );
        }
    } );

    Object.defineProperty( scope, 'texture',
    {
        enumerable: false,
        value: function()
        {
            scope.map = app.assets.textures[ app.utils.item( scope.mapping ) ].texture;
        }
    } );

    Object.defineProperty( scope, 'colors',
    {
        enumerable: false,
        value: function()
        {
            var h = ( scope.iteration / scope.iterations - 0.33 ) % 1;

            return new THREE.Color().setHSL( h, 0.6, 0.7 );
        }
    } );

    /* create ***************************************************/
    // set corner vertices
    Object.defineProperty( scope, 'ring',
    {
        enumerable: false,
        value: function( p )
        {
            var vertices = [];
            var offsets = [];
            var c = Math.PI * 2;
            var a, x, y, z = 0;
            var r = !( scope.current.sides % 2 ) ? Math.PI / scope.current.sides : 0;

            for( var i = 0; i < scope.sides ; i++ )
            {
                a = c * i / scope.current.sides;
                x = scope.radius * Math.sin( a + r );
                y = scope.radius * Math.cos( a + r );
                z = 0;

                vertices.push( new THREE.Vector3( x, y, z ) );
                offsets.push( new THREE.Vector3( x + p.x, y + p.y, z + p.z ) );
            }

            return { points: vertices, plane: offsets };
        }
    } );

    // draw points at vertices
    Object.defineProperty( scope, 'points',
    {
        enumerable: false,
        value: function( c, p )
        {
            var geometry = new THREE.Geometry();
                geometry.vertices = c.points;
            var material = new THREE.PointsMaterial();
                material.color = new THREE.Color( 0xffffff );
                material.size = 0.1;

            var mesh = new THREE.Points( geometry, material );
                mesh.visible = scope.helpers.points;
                mesh.userData.iteration = scope.iteration;
                mesh.position.set( p.x, p.y, p.z );

            return mesh;
        }
    } );

    // draw lines between vertices
    Object.defineProperty( scope, 'lines',
    {
        enumerable: false,
        value: function( c )
        {
            var points;

            points = [ ...c.points ];
            points.push( points[ 0 ] );

            var correct =
            {
                material: new THREE.LineBasicMaterial( { color: 0x0ff000 } ),
                geometry: new THREE.BufferGeometry().setFromPoints( points )
            };
                correct.line = new THREE.Line( correct.geometry, correct.material );
                correct.material.visible = scope.helpers.correct;
            scope.mesh.add( correct.line );

            points = [ ...c.plane ];
            points.push( points[ 0 ] );

            var incorrect =
            {
                material: new THREE.LineBasicMaterial( { color: 0xff0000 } ),
                geometry: new THREE.BufferGeometry().setFromPoints( points )
            };
            incorrect.line = new THREE.Line( incorrect.geometry, incorrect.material );
            incorrect.material.visible = scope.helpers.incorrect;
            scope.group.add( incorrect.line );
        }
    } );

    // update the matrix and vertices
    Object.defineProperty( scope, 'matrix',
    {
        enumerable: false,
        value: function( mesh )
        {
            var vertices = [];
            var vertex = new THREE.Vector3();

            mesh.updateMatrix();

            for( var i = 0; i < mesh.geometry.vertices.length ; i++ )
            {
                vertex.copy( mesh.geometry.vertices[ i ] );
                vertex.applyMatrix4( mesh.matrix );
                vertices.push( vertex.clone() );
            }

            scope.current.vertices = vertices;
        }
    } );

    // plane geometry from 4 points
    Object.defineProperty( scope, 'plane',
    {
        enumerable: false,
        value: function()
        {
            var p;
            var mesh;
            var geometry;
            var material = new THREE.MeshStandardMaterial();
                material.transparent = true;
                material.opacity = 1;
                material.fog = true;
                material.castShadow = true;
                material.receiveShadow = true;
                material.side = THREE.DoubleSide;
                material.wireframe = false;
                material.bumpMap = scope.bumping;
                material.bumpScale = 1;
                if ( !scope.iteration % scope.iterations )
                {
                    material.color = new THREE.Color( 0x006666 );
                    material.map = null;
                }
                else if ( scope.coloring )
                {
                    material.color = scope.colors();
                    material.map = null;
                }
                else if ( scope.mapping.length )
                {
                    material.color = new THREE.Color( 0x4A4E52 );
                    material.map = scope.map;
                }
                material.needsUpdate = true;

            if ( scope.previous.vertices && scope.current.vertices )
            {
                for( var i = 0; i < scope.current.sides; i++ )
                {
                    p = ( i + 1 ) % scope.current.sides;

                    geometry = new THREE.Geometry();
                    geometry.vertices.push
                    (
                        scope.current.vertices[ p ],
                        scope.current.vertices[ i ],
                        scope.previous.vertices[ i ],
                        scope.previous.vertices[ p ]
                    );
                    geometry.faces.push
                    (
                        new THREE.Face3( 3, 0, 2 ),
                        new THREE.Face3( 1, 2, 0 ),
                    );
                    geometry.computeFaceNormals();
                    geometry.computeFlatVertexNormals();
                    // set uvs
                    geometry.faceVertexUvs[ 0 ].push(
                    [
                        new THREE.Vector2( 0, 0 ),
                        new THREE.Vector2( 0, 1 ),
                        new THREE.Vector2( 1, 1 ),
                        new THREE.Vector2( 1, 0 )
                    ],
                    [
                        new THREE.Vector2( 0, 0 ),
                        new THREE.Vector2( 0, 1 ),
                        new THREE.Vector2( 1, 1 ),
                        new THREE.Vector2( 1, 0 )
                    ] );
                    geometry.uvsNeedUpdate = true;

                    mesh = new THREE.Mesh( geometry, material );
                    mesh.name = "plane_" + scope.iteration + "_" + i;
                    mesh.visible = true;
                    scope.group.add( mesh );
                }
            }

            scope.material = material;
        }
    } );

    // look at last position in path
    Object.defineProperty( scope, 'lookAt',
    {
        enumerable: false,
        value: function( mesh )
        {
            if ( scope.path[ scope.path.length - 1 ] ) mesh.lookAt( scope.path[ scope.path.length - 1 ] );
        }
    } );

    // straighten out the beginning
    Object.defineProperty( scope, 'ease',
    {
        enumarable: false,
        value: function( i )
        {
            i = !isNaN( i ) ? i : scope.easing;

            if ( i <= scope.easing )
            {
                scope.amplitude.x = Math.min( i / scope.easing * scope.max.x, scope.max.x );
                scope.amplitude.y = Math.min( i / scope.easing * scope.max.y, scope.max.y );
            }
        }
    } );

    // set position of iteration
    // call ring(), points(), lines(), lookAt(), matrix(), plane()
    Object.defineProperty( scope, 'tube',
    {
        enumerable: false,
        value: function( i )
        {
            scope.ease( i );

            const x = new app.utils.Wave( { frame: scope.iteration, cycles: scope.cycles.x, amplitude: scope.amplitude.x, offset: scope.offset.x } );
            const y = new app.utils.Wave( { frame: scope.iteration, cycles: scope.cycles.y, amplitude: scope.amplitude.y, offset: scope.offset.y } );
            const z = scope.iteration * -scope.offset.z;
            const p = new THREE.Vector3( x.sin, y.cos, z );
            const c = scope.ring( p );

            scope.mesh = scope.points( c, p );
            scope.mesh.name = "points_" + scope.iteration;
            scope.mesh.userData.mode = "tube";
            scope.lines( c );
            scope.lookAt( scope.mesh );
            scope.matrix( scope.mesh );
            scope.plane();
            scope.previous.vertices = scope.current.vertices;

            scope.path.push( p );
            scope.group.add( scope.mesh );
            scope.iteration++;
        }
    } );

    // plot mesh at position
    // call ring(), make()
    Object.defineProperty( scope, 'object',
    {
        enumerable: false,
        value: function( i )
        {
            scope.ease( i );

            const x = new app.utils.Wave( { frame: scope.iteration, cycles: scope.cycles.x, amplitude: scope.amplitude.x, offset: scope.offset.x } );
            const y = new app.utils.Wave( { frame: scope.iteration, cycles: scope.cycles.y, amplitude: scope.amplitude.y, offset: scope.offset.y } );
            const z = scope.iteration * -scope.offset.z;
            const p = new THREE.Vector3( x.sin, y.cos, z );
            const c = scope.ring( p );

            // for mode switching compatibility
            var points = scope.points( c, p );
                scope.lookAt( points );
                scope.matrix( points );
                scope.previous.vertices = scope.current.vertices;

            scope.mesh = scope.make( p );
            scope.mesh.userData.mode = "object";

            // align the first object
            if ( scope.path.length === 2 )
            {
                scope.group.children[ 0 ].lookAt( scope.path[ 1 ] );
            }

            scope.path.push( p );
            scope.group.add( scope.mesh );
            scope.iteration++;
        }
    } );

    // rotate object to have flat bottom
    Object.defineProperty( scope, 'rotate',
    {
        enumerable: false,
        value: function( mesh )
        {
            var s = scope.current.sides % 4;
            var r;

            switch( s )
            {
                case 0:
                    r = Math.PI / scope.current.sides;           // 4, 8...
                    break;

                case 1:
                    r = Math.PI / scope.current.sides / 2;       // 5, 9...
                    break;

                case 2:
                    r = 0;                                      // 6, 10...
                    break;

                case 3:
                    r = -Math.PI / scope.current.sides / 2;      // 3, 7...
                    break;
            }

            mesh.rotateZ( r );
        }
    } );

    // make the mesh
    // call lookAt(), rotate()
    Object.defineProperty( scope, 'make',
    {
        enumerable: false,
        value: function( p )
        {
            var geometry = new THREE.TorusGeometry( scope.radius, 0.1, 8, scope.current.sides );
            var material = new THREE.MeshPhongMaterial();
                material.transparent = true;
                material.opacity = 0.8;
                material.fog = true;
                material.castShadow = true;
                material.receiveShadow = true;
                material.side = THREE.DoubleSide;
                material.wireframe = false;
                material.color = !( scope.iteration % scope.iterations ) ? new THREE.Color( 0x006666 ) : new THREE.Color( 0x999999 );

            var mesh = new THREE.Mesh( geometry, material );
                mesh.name = "object_" + scope.iteration;
                mesh.visible = true;
                mesh.userData.iteration = scope.iteration;
                mesh.position.set( p.x, p.y, p.z );

            scope.lookAt( mesh );
            scope.rotate( mesh );

            return mesh;
        }
    } );

    // initialize the group
    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;
        scope.path = [];
        scope.frame = 0;
        scope.iteration = 0;
        scope.frames = Math.round( app.utils.fps * ( scope.offset.z / scope.velocity.z ) );
        scope.amplitude = { x: 0, y: 0 };
        scope.easing = 30;

        Object.defineProperty( scope, 'current',
        {
            enumerable: false,
            value: { sides: scope.sides }
        } );

        Object.defineProperty( scope, 'previous',
        {
            enumerable: false,
            value: { sides: scope.sides }
        } );

        scope.camera();
        scope.texture();

        for ( let i = 0; i < scope.iterations; i++ )
        {
            scope[ scope.mode ]( i );
        }

        scope.parent.add( scope.group );

        scope.changer();
    };
    
    scope.toggle = function()
    {
        app.controls.active[ scope.name ] = !app.controls.active[ scope.name ];

        if ( app.controls.active[ scope.name ] )
            app.arrays.functions.push( { name: scope.name, scope: scope, function: scope.update, args: null } );
        else
            app.kill( app.arrays.functions, scope.name );
    };

    /* animate ***************************************************/
    // call position(), push(), camera()
    Object.defineProperty( scope, 'update',
    {
        enumerable: false,
        value: function()
        {
            if ( app.controls.active[ scope.name ] )
            {
                scope.move();
                scope.push();
                scope.camera();
            }
        }
    } );

    // translate the group
    Object.defineProperty( scope, 'move',
    {
        enumerable: false,
        value: function()
        {
            scope.group.position.z += scope.offset.z / scope.frames;
        }
    } );

    // handle regeneration and removal
    Object.defineProperty( scope, 'push',
    {
        enumerable: false,
        value: function()
        {
            scope.frame++;

            if ( !( scope.frame % scope.frames ) )
            {
                const object = scope.group.children[ 0 ];

                scope[ scope.mode ]();
                scope.path.shift();

                if ( object )
                {
                    scope.group.remove( object );
                    object.geometry.dispose();
                    object.material.dispose();
                }
            }
        }
    } );

    // set camera position and focus
    Object.defineProperty( scope, 'camera',
    {
        enumerable: false,
        value: function()
        {
            const f0 = scope.frame / scope.frames;
            const f1 = ( scope.frame + scope.frames ) / scope.frames;

            scope.ease( f0 );

            const x0 = new app.utils.Wave( { frame: f0, cycles: scope.cycles.x, amplitude: scope.amplitude.x, offset: scope.offset.x } );
            const y0 = new app.utils.Wave( { frame: f0, cycles: scope.cycles.y, amplitude: scope.amplitude.y, offset: scope.offset.y } );
            const z0 = 0;

            const x1 = new app.utils.Wave( { frame: f1, cycles: scope.cycles.x, amplitude: scope.amplitude.x, offset: scope.offset.x } );
            const y1 = new app.utils.Wave( { frame: f1, cycles: scope.cycles.y, amplitude: scope.amplitude.y, offset: scope.offset.y } );
            const z1 = -scope.offset.z;

            const y2 = ( scope.mode === "tube" && scope.current.sides === 2 ) ? 2 : 0;

            app.stage.camera.position.set( x0.sin, y0.cos + y2, z0 );
            app.stage.camera.lookAt( x1.sin, y1.cos, z1 );
        }
    } );

    /* randomize ***************************************************/
    Object.defineProperty( scope, 'changer',
    {
        enumerable: false,
        value :function()
        {
            if ( scope.changing )
            {
                scope.changers =
                [
                    setInterval( scope.switch, Math.random() * 10000 + 1000 ),
                    setInterval( scope.texture, Math.random() * 30000 + 10000 )
                ];
            }
        }
    } );
};