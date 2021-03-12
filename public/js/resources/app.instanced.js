const Instanced = function( app, scope )
{
    // defaults
    this.name = scope.name;
    this.group = scope.group;
    this.count = scope.count || 0;
    this.shader = scope.shader || "instanced";
    this.spacing = scope.spacing || 0;
    this.size = ( scope.size || 1 ) - this.spacing;
    this.layer = scope.layer || 0;
    this.opaque = scope.opaque ? scope.opaque : scope.attributes.opaque.value;
    this.attributes = scope.attributes;
    this.params =
    {
        vertexColors: scope.vertexColors || THREE.VertexColors,
        blending:     scope.blending || THREE.NormalBlending,
        side:         scope.side || THREE.DoubleSide,
        flatShading:  scope.flatShading || false,
        transparent:  true,
        opacity:      this.opaque || 1,
        wireframe:    scope.wireframe || false
    };
    this.uniforms = scope.uniforms || {};    
    this.geometry = scope.geometry || new THREE.BoxBufferGeometry( this.size, this.size, this.size, 1, 1, 1 );

    // callbacks
    this.onInstancedComplete = scope.onInstancedComplete || function() { console.warn( "onInstancedComplete is not defined" ) };
    this.onInstancedCallback = scope.onInstancedCallback || null;

    // enhancements
    this.audio      = scope.audio       || null;
    this.bender     = scope.bender      || null;
    this.disruptors = scope.disruptors  || null;
    this.physics    = scope.physics     || null;
    this.raycaster  = scope.raycaster   || null;

    // attributes
    var length = this.count * 3;
    var color = new Float32Array( length );
    var alternate = new Float32Array( length );
    var start = new Float32Array( length );
    var end = new Float32Array( length );
    var rotation = new Float32Array( length );
    var opaque = new Float32Array( this.count );
    var level = new Float32Array( length );
    var geometry = this.geometry;
        geometry.name = this.name;
        geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( color, 3 ) );
        geometry.setAttribute( 'alternate', new THREE.InstancedBufferAttribute( alternate, 3 ) );
        geometry.setAttribute( 'start', new THREE.InstancedBufferAttribute( start, 3 ) );
        geometry.setAttribute( 'end', new THREE.InstancedBufferAttribute( end, 3 ) );
        geometry.setAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 3 ) );
        geometry.setAttribute( 'opaque', new THREE.InstancedBufferAttribute( opaque, 1 ) );
        geometry.setAttribute( 'level', new THREE.InstancedBufferAttribute( level, 3 ) );

    // create
    const create = async function()
    {
        const shader =
        {
            includes: {},
            params: this.params,
            uniforms: this.uniforms
        };

        var material = await app.shaders.load( this.shader, shader );
        var mesh = new THREE.InstancedMesh( geometry, material, this.count );
            mesh.name = this.name;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;
            mesh.layers.set( this.layer );
            mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

        this.material = material;
        this.mesh = mesh;

        if ( this.uniforms.hasOwnProperty( "phase" ) && this.uniforms.phase.value > -1 )
            app.arrays.animations.push( { name: this.name, object: this.mesh, path: "material.uniforms.time.value", value: 0.01 } );

        if ( this.onInstancedCallback )
            this.onInstancedCallback( this );

        this.onInstancedComplete( this );

        // enhancements
        if ( scope.audio )
            Input.call( scope, app, scope.output );

        if ( this.bender )
        {
            Bender.call( this, app );
            this.bend();
        }

        if ( this.disruptors )
        {
            this.plot();

            this.disruptors.forEach( parameters =>
            {
                parameters.dimensions = scope.dimensions;

                var disruptor = new Disruptors();
                    disruptor.add.call( app, this, parameters );
            } );
        }

        if ( this.physics )
            app[ this.physics.engine ].add( this.mesh, this.physics );

        if ( this.raycaster )
            this.raycaster.objects.push( mesh );


    }.bind( this );

    create();

    // public hooks
    this.set = function()
    {
        var i = 0;
        var x = ( scope.dimensions.x || 1 ) / 2 - 0.5;
        var y = ( scope.dimensions.y || 1 ) / 2 - 0.5;
        var z = ( scope.dimensions.z || 1 ) / 2 - 0.5;

        this.grid = {};
        this.grid.dimensions = scope.dimensions;
        this.grid.mesh = this.mesh;

        for ( let depth = 0; depth < scope.dimensions.z; depth++ )
        {
            this.grid[ depth ] = {};

            for ( let col = 0; col < scope.dimensions.x; col++ )
            {
                this.grid[ depth ][ col ] = {};

                for ( let row = 0; row < scope.dimensions.y; row++ )
                {
                    let dummy = new THREE.Object3D();
                        dummy.position.set( col - x, row - y, depth - z );
                        dummy.updateMatrix();

                    this.grid[ depth ][ col ][ row ] = { dummy: dummy, index: i };

                    i++;
                }
            }
        }
    };

    this.preset = function()
    {
        for ( var i = 0; i < length; i += 3 )
        {
            color[ i ]     = 1;
            color[ i + 1 ] = 1;
            color[ i + 2 ] = 1;

            alternate[ i ]     = 0;
            alternate[ i + 1 ] = 1;
            alternate[ i + 2 ] = 0;

            start[ i ]     = 0;
            start[ i + 1 ] = 0;
            start[ i + 2 ] = 0;

            end[ i ]     = app.utils.random( -100, 100 );
            end[ i + 1 ] = app.utils.random( -100, 100 );
            end[ i + 2 ] = app.utils.random( -100, 100 );

            opaque[ i / 3 ] = scope.opaque;

            level[ i / 3 ] = 0;
        }
    };

    this.plot = function()
    {
        var i = 0;
        var x = ( scope.dimensions.x || 1 ) / 2 - 0.5;
        var y = ( scope.dimensions.y || 1 ) / 2 - 0.5;
        var z = ( scope.dimensions.z || 1 ) / 2 - 0.5;

        this.grid = {};
        this.grid.dimensions = scope.dimensions;
        this.grid.mesh = this.mesh;

        for ( let depth = 0; depth < scope.dimensions.z; depth++ )
        {
            this.grid[ depth ] = {};

            for ( let col = 0; col < scope.dimensions.x; col++ )
            {
                this.grid[ depth ][ col ] = {};

                for ( let row = 0; row < scope.dimensions.y; row++ )
                {
                    let dummy = new THREE.Object3D();
                        dummy.position.set( col - x, row - y, depth - z );
                        dummy.updateMatrix();

                    this.mesh.setMatrixAt( i, dummy.matrix );

                    app.utils.attributes.set( this.mesh.geometry, "start",  i, dummy.position );
                    app.utils.attributes.set( this.mesh.geometry, "end",    i, dummy.position );
                    app.utils.attributes.set( this.mesh.geometry, "rotation", i, dummy.rotation );

                    if ( scope.hasOwnProperty( "attributes" ) )
                    {
                        if ( scope.attributes.hasOwnProperty( "color" ) )
                            app.utils.attributes.set( this.mesh.geometry, "color",      i, scope.attributes.color.value );
                        if ( scope.attributes.hasOwnProperty( "alternate" ) )
                            app.utils.attributes.set( this.mesh.geometry, "alternate",  i, scope.attributes.alternate.value );
                        if ( scope.attributes.hasOwnProperty( "opaque" ) )
                            app.utils.attributes.set( this.mesh.geometry, "opaque",     i, scope.attributes.opaque.value );
                        if ( scope.attributes.hasOwnProperty( "level" ) )
                            app.utils.attributes.set( this.mesh.geometry, "level",      i, scope.attributes.level.value );
                    }

                    this.grid[ depth ][ col ][ row ] = { dummy: dummy, index: i };

                    i++;
                }
            }
        }

        this.mesh.instanceMatrix.needsUpdate = true;
    };
};