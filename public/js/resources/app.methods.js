const Methods = function( app, mesh, side )
{
    var scope = this;

    this.mesh = mesh;
    this.side = side || THREE.DoubleSide;

    this.add = function()
    {
        if ( Object.keys( this.mesh ).length )
        {
            this.group.add( this.mesh );
        }
    };

    this.clear = function()
    {
        this.group.children = [];
    };

    this.enhance = function( object, args )
    {
        this.add();
        object.call( this, this.mesh, args );
    };

    this.helper =
    {
        axes: function()
        {
            var axes = new THREE.AxesHelper( 2 );

            this.mesh.add( axes );
        }.bind( this ),
        box: function( visible )
        {
            var box = new THREE.BoxHelper( this.mesh, 0xffff00 );
                box.visible = !!visible;

            this.mesh.parent.add( box );
        }.bind( this )
    };

    this.link = function( object, master, properties )
    {
        properties.forEach( property =>
        {
            object[ property ].copy( master[ property ] );
        } );

        object.updateMatrix();
    };

    this.shader =
    {
        attach: function( name, args )
        {
            scope.mesh.material = app.shaders.material( name, args );
            scope.mesh.material.materialNeedsUpdate = true;
            scope.mesh.material.side = scope.side;
            scope.add();
        },

        load: async function( name, args )
        {
            scope.mesh.material = await app.shaders.load( name, args );
            scope.mesh.material.materialNeedsUpdate = true;
            scope.mesh.material.side = scope.side;
            scope.add();
        }
    };

    this.skew = function( name, args )
    {
        var matrix = new THREE.Matrix4();
            matrix.set
            (
                1,              args.yx || 0,   args.zx || 0,   0,
                args.xy || 0,   1,              args.zy || 0,   0,
                args.xz || 0,   args.yz || 0,   1,              0,
                0,              0,              0,              1
            );

        scope.mesh.geometry.applyMatrix4( matrix );
        scope.mesh.updateMatrix();
        scope.add();
    };

    this.texture = function( args )
    {
        var texture = args.map;
        var total = {};

        if ( args.repeat )
        {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        }

        const abs = function( total, key, value )
        {
            if ( !value )
                return 0;

            if ( total[ key ] > 1 / value )
                total[ key ] = 0;

            return total[ key ] * value;
        };

        const update = function( key )
        {
            if ( !total.hasOwnProperty( key ) )
                total[ key ] = 0;

            total[ key ]++;

            if ( typeof this.mesh.material.map[ key ] === "object" )
                texture[ key ] = new THREE.Vector2( abs( total, key, args[ key ].value.x ), abs( total, key, args[ key ].value.y ) );
            else
                texture[ key ] = total[ key ] * args[ key ].value;

        }.bind( this );

        if ( args )
        {
            for ( let key in args )
            {
                if ( args.hasOwnProperty( key ) )
                {
                    if ( args[ key ].hasOwnProperty( "animate" ) )
                    {
                        if ( args[ key ].animate )
                            app.arrays.functions.push( { name: args.name, scope: this, function: update, args: key } );
                        else
                            texture[ key ] = args[ key ].value;
                    }
                    else
                    {
                        texture[ key ] = args[ key ].value;
                    }
                }
            }
        }

        this.mesh.material.side = this.side;
        this.mesh.material.map = texture;
        this.mesh.material.textureNeedsUpdate = true;

        this.add();
    };
};