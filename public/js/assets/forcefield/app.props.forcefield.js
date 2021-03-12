const ForceField = function()
{
    var app = {};
    var scope = this;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;

        const cube =
        {
            name: scope.name,
            parent: scope.group
        };

        const shader =
        {
            includes: { fragment: [ "simplex3d" ] },
            uniforms:
            {
                opacity:    { value: 0.5 },
                time:       { value: 0 },
                power:      { value: 0.2 },
                color:      { value: new THREE.Color( 0xcc9900 ) },
                skyBox:     { value: false }
            }
        };

        var env = new app.presets.Environment( cube );
            env.shader.load( "xcurrent", shader );
        scope.mesh = env.mesh;

        app.arrays.persistent[ "background" ].push( { name: scope.name, object: scope.mesh, path: "material.uniforms.time.value", value: 0.01 } );

        scope.group.add( scope.mesh );
        scope.parent.add( scope.group );
    };
};