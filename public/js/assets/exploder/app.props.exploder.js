const Exploder = function()
{
    var app = {};
    var scope = this;
    var dummies = [];

    var center = function( n )
    {
        return n * ( Math.random() - 0.5 );
    };

    var p = function()
    {
        return center( Math.random() * 2 );
    };

    var material = async function()
    {
        return new Promise( resolve =>
        {
            var material = app.shaders.load( scope.shader,
            {
                includes: { vertex: [ "rotation", "random", "noise" ], fragment: [ "grayscale" ] },
                params:
                {
                    side: THREE.DoubleSide,
                    depthTest: false,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    vertexColors: THREE.VertexColors
                },
                uniforms:
                {
                    time:       { type: 'float', value: 0 },
                    speed:      { type: 'float', value: scope.speed },
                    taper:      { type: 'vec3',  value: scope.taper },
                    spin:       { type: 'vec3',  value: scope.spin },
                    rotation:   { type: 'vec3',  value: scope.rotation },
                    saturation: { type: 'float', value: scope.saturation },
                    map:        { type: 't',     value: scope.map },
                    resolution: { type: 'vec2',  value: { x: window.innerWidth, y: window.innerHeight } },
                    direction:  { type: 'float', value: scope.direction ? scope.direction === "in" ? 1 : 0 : 0 },
                    count:      { type: 'float', value: scope.count },
                    scalex:     { type: 'vec3',  value: scope.scalex },
                    scaley:     { type: 'vec3',  value: scope.scaley },
                    scalez:     { type: 'vec3',  value: scope.scalez }
                }
            } );

            resolve( material );
        } );
    };

    var set = function()
    {
        var birth = new Float32Array( scope.count );
        var decay = new Float32Array( scope.count );
        var index = new Float32Array( scope.count );
        var lifespan = new Float32Array( scope.count );
        var offsets = new Float32Array( scope.count * 3 );

        for ( let c = 0; c < scope.count; c++ )
        {
            let x = scope.axis.x < 0 ? scope.axis.x * p() : scope.axis.x * Math.random();
            let y = scope.axis.y < 0 ? scope.axis.y * p() : scope.axis.y * Math.random();
            let z = scope.axis.z < 0 ? scope.axis.z * p() : scope.axis.z * Math.random();

            let dummy = new THREE.Object3D();
                dummy.position.set( x, y, z );
            dummies.push( dummy );
            scope.mesh.setMatrixAt( c, dummy.matrix );

            // custom attributes
            birth[ c ] = 0;
            decay[ c ] = scope.decay * ( Math.random() + 1 );
            lifespan[ c ] = scope.lifespan * ( Math.random() + 0.5 ) / 1000;
            index[ c ] = c;

            offsets[ c * 3     ] = x;
            offsets[ c * 3 + 1 ] = y;
            offsets[ c * 3 + 2 ] = z;
        }

        scope.geometry.setAttribute( "birth",    new THREE.InstancedBufferAttribute( birth, 1 ) );
        scope.geometry.setAttribute( "decay",    new THREE.InstancedBufferAttribute( decay, 1 ) );
        scope.geometry.setAttribute( "index",    new THREE.InstancedBufferAttribute( index, 1 ) );
        scope.geometry.setAttribute( "lifespan", new THREE.InstancedBufferAttribute( lifespan, 1 ) );
        scope.geometry.setAttribute( "offset",   new THREE.InstancedBufferAttribute( offsets, 3 ) );

        scope.mesh.instanceMatrix.needsUpdate = true;
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;

        var load = async function()
        {
            scope.material = await material();
            scope.mesh = new THREE.InstancedMesh( scope.geometry, scope.material, scope.count );
            scope.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            scope.mesh.layers.set( scope.layer );
            scope.group.add( scope.mesh );
            scope.parent.add( scope.group );

            set();

            app.arrays.animations.push( { name: scope.name, object: scope.mesh, path: "material.uniforms.time.value", value: scope.tick } );
        };

        load();
    };
};