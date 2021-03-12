Path.Organic = function()
{
    var scope = "organic";
    var app = this;
        app[ scope ] = { params: {}, paths: [] };
    var vertices;
    var count = 0;
    var params = {};

    const Circle = function( params )
    {
        var fn = [ "sin", "cos" ];
        var circle = Math.PI * 2;
        var theta = ( circle * ( params.index % params.segments ) ) / params.segments;
        var sigma = circle * params.offset;

        this.vector = new THREE.Vector3();

        params.axes.forEach( ( axis, index ) =>
        {
            this.vector[ axis ] = Math[ fn[ index ] ]( theta + sigma ) * params.radius;
        } );
    };

    const Stretch = function( params )
    {
        params.vector[ params.axis ] = params.index * params.pitch / params.segments;

        this.vector = params.vector;
    };

    app[ scope ].init = function( args )
    {
        Object.assign( params, args );

        count = params.count * params.segments;

        app[ scope ][ params.type ]();
        app[ scope ].paths.push( vertices );

        return app[ scope ].paths;
    };

    app[ scope ].reset = function()
    {
        app[ scope ].paths = [];
    };

    app[ scope ].helix = function()
    {
        vertices = [];

        for ( var index = 0; index < count; index++ )
        {
            let circle = new Circle( { index: index, segments: params.segments, offset: params.offset, axes: [ "x", "z" ], radius: params.radius } );
            let stretch = new Stretch( { index: index, segments: params.segments, pitch: params.pitch, axis: "y", vector: circle.vector } );

            vertices.push( stretch.vector );
        }
    };

    app[ scope ].icosa = function()
    {
        vertices = [];

        var position = new THREE.Vector3();
        var geometry = new THREE.IcosahedronGeometry( params.radius, params.count );
            geometry.vertices.forEach( vertex =>
            {
                vertices.push( position );
                vertices.push( vertex );
            } );
    };

    app[ scope ].lattice = function()
    {
        vertices = [];

        var geometry = new THREE.IcosahedronGeometry( params.radius, params.count );
            geometry.vertices.forEach( vertex =>
            {
                 vertices.push( vertex );
            } );
    };

    app[ scope ].tetra = function()
    {
        vertices = [];

        var position = new THREE.Vector3();
        var geometry = new THREE.TetrahedronGeometry( params.radius, params.count );
            geometry.vertices.forEach( vertex =>
            {
                vertices.push( position );
                vertices.push( vertex );
            } );
    };
};