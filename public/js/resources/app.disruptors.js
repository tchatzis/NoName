const Disruptors = function()
{
    var app = {};
    var scope = this;
    var f = {};
    var params = {};

    scope.add = function( prop, args )
    {
        Object.assign( app, this );
        Object.assign( params, args );

        var mesh = prop.grid.mesh;
        var callback = function( data )
        {
            var instance = prop.grid[ data.z ][ data.x ][ data.y ];

            f[ args.type ]( mesh, instance );
        }.bind( this );

        Object.assign( args, { callback: callback } );

        var loop = new Loop();
            loop.init( args );
    };

    f.color = function( mesh, instance )
    {
        app.utils.attributes.set( mesh.geometry, "color", instance.index, params.value );
    };

    f.reciprocate = function( mesh, instance )
    {
        var value = 0;

        var update = function()
        {
            value += params.value;

            instance.dummy.position[ params.axis ] = Math.sin( value );
            instance.dummy.updateMatrix();

            mesh.setMatrixAt( instance.index, instance.dummy.matrix );
            mesh.instanceMatrix.needsUpdate = true;

            app.utils.attributes.set( mesh.geometry, "start", instance.index, instance.dummy.position );

            if ( params.onDisruptorUpdate )
                params.onDisruptorUpdate( mesh, instance.dummy );
        };

        app.arrays.functions.push( { name: params.name, scope: this, function: update, args: null } );
    };

    f.rotate = function ( mesh, instance )
    {
        var value = 0;

        var update = function()
        {
            value += params.value;

            instance.dummy.rotation[ params.axis ] = value;
            instance.dummy.updateMatrix();

            mesh.setMatrixAt( instance.index, instance.dummy.matrix );
            mesh.instanceMatrix.needsUpdate = true;

            app.utils.attributes.set( mesh.geometry, "rotation", instance.index, instance.dummy.rotation );

            if ( params.onDisruptorUpdate )
                params.onDisruptorUpdate( mesh, instance.dummy );
        };

        app.arrays.functions.push( { name: params.name, scope: this, function: update, args: null } );
    };

    f.translate = function( mesh, instance )
    {
        var value = 0;

        var update = function()
        {
            value += params.value;

            instance.dummy.position[ params.axis ] = value;
            instance.dummy.updateMatrix();

            mesh.setMatrixAt( instance.index, instance.dummy.matrix );
            mesh.instanceMatrix.needsUpdate = true;

            app.utils.attributes.set( mesh.geometry, "start", instance.index, instance.dummy.position );

            if ( params.onDisruptorUpdate )
                params.onDisruptorUpdate( mesh, instance.dummy );
        };

        app.arrays.functions.push( { name: params.name, scope: this, function: update, args: null } );
    };


};