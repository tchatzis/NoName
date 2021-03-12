const Ammo3 = function()
{
    var scope = "ammo";
    var app = this;
        app[ scope ] = {};
    var clock = new THREE.Clock();
    var Ammo = app.Ammo;
    var margin = 0.02;
    var worldTransform;
    var ammoTmpPos;
    var ammoTmpQuat;
    var softBodyHelpers;
    var tmpPos;
    var tmpQuat;

    app[ scope ].map = new WeakMap();
    app[ scope ].bodies = { rigid: [], soft: [] };
    app[ scope ].meshes = { rigid: [], soft: [] };

    app[ scope ].init = function( args )
    {
        var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        var broadphase = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        var softBodySolver = new Ammo.btDefaultSoftBodySolver();
        var gravity = args.gravity.toArray();

        app[ scope ].world = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
        app[ scope ].world.setGravity( new Ammo.btVector3( ...gravity ) );
        app[ scope ].world.getWorldInfo().set_m_gravity( ...gravity );

        worldTransform = new Ammo.btTransform();
        ammoTmpPos = new Ammo.btVector3();
        ammoTmpQuat = new Ammo.btQuaternion();
        softBodyHelpers = new Ammo.btSoftBodyHelpers();

        tmpPos = new THREE.Vector3();
        tmpQuat = new THREE.Quaternion();

        Object.assign( app[ scope ], args );

        //console.warn( Ammo );
    };
    
    app[ scope ].play = function()
    {
        app.arrays.functions.push( { name: scope, scope: app[ scope ], function: update, args: null } );
    };

    app[ scope ].stop = function()
    {
        app.kill( app.arrays.functions, scope );
    };

    app[ scope ].add = function( target, args )
    {
        if ( target.isInstancedMesh )
        {
            create.instanced( target, args );
        }
        else if ( target.isMesh )
        {
            create[ args.body ]( target, args );
        }
    };

    // app.disruptors callback
    app[ scope ].update = function( mesh, dummy )
    {
        tmpPos.copy( dummy.position );
        tmpQuat.copy( dummy.quaternion );

        updateInstanced( mesh );
    };

    // create rigid, rigid ( instanced ) and soft bodies
    const create =
    {
        instanced: function( target, args )
        {
            const array = target.instanceMatrix.array;
            const bodies = [];

            for ( let i = 0; i < target.count; i ++ )
            {
                let index = i * 16;
                let shape = getShape( target, args );
                let transform = new Ammo.btTransform();
                    transform.setFromOpenGLMatrix( array.slice( index, index + 16 ) );
                let body = getBody( args.mass, transform, shape );
                    body.setCollisionFlags( 2 ); // 0 is static 1 dynamic 2 kinematic
                    body.setActivationState( 4 );

                //console.dir( body.__proto__ );
                //console.log( body.isKinematicObject() );

                setAttributes( body, args );

                app[ scope ].world.addRigidBody( body, args.group, args.mask );
                app[ scope ].bodies.rigid.push( body );

                bodies.push( body );
            }

            // set this for app.disruptors
            target.userData.physics = true;

            app[ scope ].map.set( target, bodies );

            if ( args.mass > 0 )
            {
                target.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
                app[ scope ].meshes.rigid.push( target );
            }
        },
        rigid: function( target, args )
        {
            var shape = getShape( target, args );
            var pos = new THREE.Vector3().copy( target.position );
            var quat = new THREE.Quaternion().copy( target.quaternion );
            var transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
            var body = getBody( args.mass, transform, shape );

            setAttributes( body, args );

            app[ scope ].world.addRigidBody( body, args.group, args.mask );
            app[ scope ].bodies.rigid.push( body );
            app[ scope ].map.set( target, body );

            if ( args.mass > 0 )
            {
                app[ scope ].meshes.rigid.push( target );
		    }
        },
        soft: function( target, args )
        {
            lookup( target );
            var geometry = process( target );
            var body = softBodyHelpers.CreateFromTriMesh( app[ scope ].world.getWorldInfo(), geometry.ammoVertices, geometry.ammoIndices, geometry.ammoIndices.length / 3, true );
                body.get_m_materials().at( 0 ).set_m_kLST( args.stiffness ); // Stiffness
                body.get_m_materials().at( 0 ).set_m_kAST( args.stiffness );
                body.setTotalMass( args.mass, false );                       // Mass
                body.setActivationState( 4 );
            var sbConfig = body.get_m_cfg();
                sbConfig.set_viterations( args.iterations );    // Iterations
                sbConfig.set_piterations( args.iterations );
                sbConfig.set_kDF( args.friction );  // Friction
                sbConfig.set_kDP( args.damping );   // Damping
                sbConfig.set_kPR( args.pressure );  // Pressure

            Ammo.castObject( body, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin );

            app[ scope ].world.addSoftBody( body, args.group, args.mask );
            app[ scope ].bodies.soft.push( body );
            app[ scope ].map.set( target, body );

            if ( args.mass > 0 )
            {
                app[ scope ].meshes.soft.push( target );
		    }
        }
    };

    // matrix update for instanced meshes
    function compose( position, quaternion, array, index )
    {
        const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        array[ index + 0 ] = ( 1 - ( yy + zz ) );
        array[ index + 1 ] = ( xy + wz );
        array[ index + 2 ] = ( xz - wy );
        array[ index + 3 ] = 0;

        array[ index + 4 ] = ( xy - wz );
        array[ index + 5 ] = ( 1 - ( xx + zz ) );
        array[ index + 6 ] = ( yz + wx );
        array[ index + 7 ] = 0;

        array[ index + 8 ] = ( xz + wy );
        array[ index + 9 ] = ( yz - wx );
        array[ index + 10 ] = ( 1 - ( xx + yy ) );
        array[ index + 11 ] = 0;

        array[ index + 12 ] = position.x();
        array[ index + 13 ] = position.y();
        array[ index + 14 ] = position.z();
        array[ index + 15 ] = 1;
    }

    // convert geometry to buffer geometry
    function convert( target )
    {
        target.geometry = target.geometry.type.includes( "Buffer" ) ? target.geometry : new THREE.BufferGeometry().fromGeometry( target.geometry );

        return target;
    }

    // get the physics body
    function getBody( mass, transform, shape )
    {
        var motionState = new Ammo.btDefaultMotionState( transform );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape.shape, shape.inertia );
        var body = new Ammo.btRigidBody( rbInfo );
            body.setActivationState( 4 );

        return body;
    }

    // look up shape from geometry and add mass
    function getShape( target, args )
    {
        var info = lookup( target );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        var shape = parameters( info );
            shape.setMargin( margin );
            shape.calculateLocalInertia( args.mass, localInertia );

        return { shape: shape, inertia: localInertia };
    }

    // get info from geometry and return to getShape
    function lookup( target )
    {
        var info = {};
        var type = target.geometry.type;
        var parameters = target.geometry.parameters;

        // map three geometry to ammo shape
        const types =
        {
            BoxGeometry: "btBoxShape",
            BoxBufferGeometry: "btBoxShape",
            CylinderGeometry: "btCylinderShape",
            CylinderBufferGeometry: "btCylinderShape",
            PlaneGeometry: "btPlaneShape",
            PlaneBufferGeometry: "btPlaneShape",
            SphereGeometry: "btSphereShape",
            SphereBufferGeometry: "btSphereShape",
            BufferGeometry: "BufferGeometry"
        };

        // set ammo parameters
        switch( types[ type ] )
        {
            case "BufferGeometry":
                info.parameters = [ parameters.width * 0.5, parameters.height * 0.5, parameters.depth * 0.5 ];
                info.data = "vector";
                info.type = "btBoxShape";
                info.converted = true;
            break;

            case "btBoxShape":
            case "btCylinderShape":
                info.parameters = [ parameters.width * 0.5, parameters.height * 0.5, parameters.depth * 0.5 ];
                info.data = "vector";
                info.type = types[ type ];
            break;

            case "btSphereShape":
                info.parameters = parameters.radius;
                info.data = "number";
                info.type = types[ type ];
            break;

            case "btCapsuleShape":
            case "btConeShape":
                info.parameters = [ parameters.radius, parameters.height ];
                info.data = "array";
                info.type = types[ type ];
            break;

            case "btPlaneShape":
                info.parameters = [ parameters.width * 0.5, 0.01, parameters.height * 0.5 ];
                info.data = "vector";
                info.type = "btBoxShape";
            break;

            case "btTriangleShape":
                console.error( type ); // [ 3 vertices ]
                info.data = "unknown";
                info.type = types[ type ];
            break;

            default:
                console.error( type );
                info.data = "unknown";
                info.type = types[ type ];
            break;
        }

        // convert three to buffer geometry
        if ( !info.converted )
            convert( target );

        return info;
    }

    // invoke correct Ammo type and pass in parameters
    function parameters( info )
    {
        switch( info.data )
        {
            case "array":
                return new Ammo[ info.type ]( ...info.parameters );

            case "vector":
                return new Ammo[ info.type ]( new Ammo.btVector3( ...info.parameters ) );

            case "number":
                return new Ammo[ info.type ]( info.parameters );

            default:
                console.error( info );
                return false;
        }
    }

    // map ammo to geometry
    function process( target )
    {
        function isEqual( x1, y1, z1, x2, y2, z2 )
        {
            var delta = 0.000001;

            return Math.abs( x2 - x1 ) < delta &&
                Math.abs( y2 - y1 ) < delta &&
                Math.abs( z2 - z1 ) < delta;
        }

        function mapIndices( geometry, indexed )
        {
            // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry
            var vertices = geometry.attributes.position.array;
            var idxVertices = indexed.attributes.position.array;
            var numIdxVertices = idxVertices.length / 3;
            var numVertices = vertices.length / 3;

            geometry.ammoVertices = idxVertices;
            geometry.ammoIndices = indexed.index.array;
            geometry.ammoIndexAssociation = [];

            for ( var i = 0; i < numIdxVertices; i ++ ) {

                var association = [];
                geometry.ammoIndexAssociation.push( association );

                var i3 = i * 3;

                for ( var j = 0; j < numVertices; j ++ ) {

                    var j3 = j * 3;
                    if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ], idxVertices[ i3 + 2 ], vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) )
                    {
                        association.push( j3 );
                    }
                }
            }
        }

        // Ony consider the position values when merging the vertices
        var posOnlyBufGeometry = new THREE.BufferGeometry();
            posOnlyBufGeometry.setAttribute( 'position', target.geometry.getAttribute( 'position' ) );
            posOnlyBufGeometry.setIndex( target.geometry.getIndex() );

        // Merge the vertices so the triangle soup is converted to indexed triangles
        var indexed = BufferGeometryUtils.mergeVertices( posOnlyBufGeometry );

        // Create index arrays mapping the indexed vertices to bufGeometry vertices
        mapIndices( target.geometry, indexed );

        return target.geometry;
    }

    // sets physical attributes on body
    function setAttributes( body, args )
    {
        function set( body, key, value )
        {
            var Key = key.charAt( 0 ).toUpperCase() + key.slice( 1 );
            var fn = "set" + Key;

            if ( body[ fn ] )
                body[ fn ]( value );
        }

        for ( let key in args )
        {
            if ( args.hasOwnProperty( key ) )
                set( body, key, args[ key ] )
        }
    }

    // simulation updaters
    function update()
    {
        var debug = false;
        var delta = clock.getDelta();

        if ( debug )
            app.stage.props.children = [];

        app[ scope ].world.stepSimulation( delta, 10 );

        // Update soft volumes
        updateSoft();

        // Update rigid bodies
        updateRigid();
    }

    function updateDynamic( body )
    {
        let motionState = body.getMotionState();
            motionState.getWorldTransform( worldTransform );

        if ( motionState )
        {
            let position = worldTransform.getOrigin();
            let quaternion = worldTransform.getRotation();

            compose( position, quaternion, array, j * 16 );
        }
    }

    function updateInstanced( mesh )
    {
        let bodies = app[ scope ].map.get( mesh );

        for ( let j = 0; j < bodies.length; j ++ )
        {
            let body = bodies[ j ];

            if ( body.isKinematicObject() )
                updateKinematic( body );
            else
                updateDynamic( body )
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    function updateKinematic( body )
    {
        let motionState = body.getMotionState();

        if ( motionState )
        {
            ammoTmpPos.setValue( tmpPos.x, tmpPos.y, tmpPos.z );
            ammoTmpQuat.setValue( tmpQuat.x, tmpQuat.y, tmpQuat.z, tmpQuat.w );

            worldTransform.setIdentity();
            worldTransform.setOrigin( ammoTmpPos );
            worldTransform.setRotation( ammoTmpQuat );

            motionState.setWorldTransform( worldTransform );
        }
    }

    function updateRigid()
    {
        for ( let i = 0; i < app[ scope ].meshes.rigid.length; i++ )
        {
            let mesh = app[ scope ].meshes.rigid[ i ];

            if ( mesh.isInstancedMesh )
            {
				updateInstanced( mesh );
			}
            else if ( mesh.isMesh )
            {
				let body = app[ scope ].map.get( mesh );
				let motionState = body.getMotionState();
				    motionState.getWorldTransform( worldTransform );

				if ( motionState )
                {
                    let position = worldTransform.getOrigin();
				    let quaternion = worldTransform.getRotation();

				    mesh.position.set( position.x(), position.y(), position.z() );
				    mesh.quaternion.set( quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w() );
                }
			}
        }
    }

    function updateSoft()
    {
        for ( let i = 0; i < app[ scope ].meshes.soft.length; i++ )
        {
            let mesh = app[ scope ].meshes.soft[ i ];
            let geometry = mesh.geometry;
            let body = app[ scope ].map.get( mesh );
            let bodyPositions = geometry.attributes.position.array;
            let bodyNormals = geometry.attributes.normal.array;
            let association = geometry.ammoIndexAssociation;
            let numVerts = association.length;
            let nodes = body.get_m_nodes();

            for ( let j = 0; j < numVerts; j ++ )
            {
                let node = nodes.at( j );
                let nodePos = node.get_m_x();
                let x = nodePos.x();
                let y = nodePos.y();
                let z = nodePos.z();
                let nodeNormal = node.get_m_n();
                let nx = nodeNormal.x();
                let ny = nodeNormal.y();
                let nz = nodeNormal.z();
                let assocVertex = association[ j ];

                for ( let k = 0, kl = assocVertex.length; k < kl; k++ )
                {
                    let indexVertex = assocVertex[ k ];
                    bodyPositions[ indexVertex ] = x;
                    bodyNormals[ indexVertex ] = nx;
                    indexVertex++;
                    bodyPositions[ indexVertex ] = y;
                    bodyNormals[ indexVertex ] = ny;
                    indexVertex++;
                    bodyPositions[ indexVertex ] = z;
                    bodyNormals[ indexVertex ] = nz;
                }
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
        }
    }
};