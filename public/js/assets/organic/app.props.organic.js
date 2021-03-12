const Organic = function()
{
    var app = {};
    var scope = this;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.params.structures = 0;

        scope[ scope.type ]();
    };

    scope.dna = function()
    {
        app.organic.reset();

        scope.params.offset = 0;

        var strand1 = new Structure();
            strand1.init.call( app, scope );

        scope.params.offset = 0.5;

        var strand2 = new Structure();
            strand2.init.call( app, scope );

        scope.pipe.size = 0.25;
        scope.pipe.color = new THREE.Color( 0x666666 );

        var bindings = new Structure();
            bindings.init.call( app, scope );
            bindings.bridge( app.organic.paths[ 0 ], app.organic.paths[ 1 ] );
    };

    scope.lattice = function()
    {
        app.organic.reset();

        var lattice = new Structure();
            lattice.init.call( app, scope );
    };

    scope.molecule = function()
    {
        app.organic.reset();

        var molecule = new Structure();
            molecule.init.call( app, scope );
    };

    scope.virus = function()
    {
        app.organic.reset();

        var virus = new Structure();
            virus.init.call( app, scope );
    };
};