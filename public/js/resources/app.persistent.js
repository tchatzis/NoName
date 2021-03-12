const Persistent = function()
{
    var scope = "persistent";
    var app = this;
        app[ scope ] = {};
    
    app[ scope ].dunes = function( target, args )
    {
        var range = new Range();
        var colors = new VertexColors();
        var distort = new app.lipstick.distort( target, args );
        var length = target.geometry.vertices.length;
        var frame = 0;

        args.animate = args.smooth ? args.animate : false;

        if ( args.texture )
        {
            var displacement =
            {
                map: args.texture,
                scale: 0,
                bias: 0
            };
    
            target.material.map = args.texture.texture;
            new app.lipstick.displacement( target, displacement );
        }

        if ( args.vertexColors )
        {
            colors.init.call( app, target, args );
        }

        var update = function()
        {
            if ( args.vertexColors )
            {
                for ( var index = 0; index < length; index++ )
                {
                    colors.face( index, frame );
                }
            }

            distort.update();
        };

        if ( args.vertexColors )
        {
            range.get( target.geometry.vertices, "z" );
            this.range = range.value;
            colors.set( "range", range.value );
        }

        args.animate ? app.arrays.persistent.functions.push( { name: args.name, scope: this, function: update, args: null } ) : update();

        frame++;
    };
    
    app[ scope ].height = function( target, args )
    {
        args.lateral = 0;

        var range = new Range();
        var colors = new VertexColors();
        var distort = new app.lipstick.distort( target, args );
        var length = target.geometry.vertices.length;
        var frame = 0;
        
        colors.init.call( app, target, args );

        var update = function()
        {
            if ( args.vertexColors )
            {
                for ( var index = 0; index < length; index++ )
                {
                    colors.face( index, frame );
                }
            }

            distort.update();
        };

        range.get( target.geometry.vertices, args.axis );
        this.range = range.value;
        colors.set( "range", range.value );

        args.animate ? app.arrays.persistent.functions.push( { name: args.name, scope: this, function: update, args: null } ) : update();

        frame++;
    };
    
    app[ scope ].ocean = function( target, args )
    {
        var ocean = new THREE.Ocean( target, args );
            ocean.name = args.name;
            ocean.castShadow = false;
            ocean.receiveShadow = true;

        target.visible = false;
        target.parent.add( ocean );

        app.arrays.persistent[ "ground" ].push( { name: args.name, object: ocean, path: "material.uniforms.time.value", value: args.time } );
    };
    
    app[ scope ].waves = function( target, args )
    {
        var distort = new app.lipstick.distort( target, args );

        args.animate ? app.arrays.persistent.functions.push( { name: args.name, scope: this, function: distort.update, args: null } ) : update();
    };
}