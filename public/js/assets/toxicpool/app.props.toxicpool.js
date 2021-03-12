const ToxicPool = function()
{
    var app = {};
    var scope = this;

    const lights = function()
    {
        scope.light = new THREE.PointLight();
        scope.light.name = "orange";
        scope.light.color = new THREE.Color( "orange" );
        scope.light.intensity = 5 * scope.scale;
        scope.light.distance = 12 * scope.scale;
        scope.light.position.set( 0, 0, 0 );
        scope.light.visible = true;

        scope.group.add( scope.light );
    };

    const create = function()
    {
        var args =
        {
            name: scope.name,
            includes: { vertex: [ "simplex3d" ] },
            uniforms:
            {
                time: { type: "float", value: 0 },
                noise: { type: "vec3", value: new THREE.Vector3( 0, 1, 0 ) },
                frequency: { type: "float", value: 0.3 },
                scale: { type: "vec3", value: new THREE.Vector3( 0, 1, 0 ) }
            },
            // below required for modify
            modify: [ "vertex" ],
            material: new THREE.MeshPhysicalMaterial(
            {
                side: THREE.DoubleSide,
                color: new THREE.Color( 0x003333 ),
                transparency: 1,
                clearcoat: 0.25,
                clearcoatRoughness: 0.2,
                reflectivity: 1,
                roughness: 0,
                metalness: 0
            } ),
            // optional
            update: [ { name: "time", value: 0.1 } ]
        };

        var geometry = new THREE.BoxBufferGeometry( 10, 10, 10, 101, 101, 101 );

        var load = async function()
        {
            var material = await app.shaders.modify( "toxicpool", args );
            var mesh = new THREE.Mesh( geometry, material );

            scope.group.add( mesh );
        };

        load();
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;
        scope.group.scale.multiplyScalar( scope.scale );
        scope.parent.add( scope.group );

        lights();
        create();
    };
};