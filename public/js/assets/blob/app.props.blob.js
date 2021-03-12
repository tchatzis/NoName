const Blob = function()
{
    // block, box, corners, edges, [ building, cage, frame, jail, lattice, nodes, reinforced ] require mod

    var app = {};
    var scope = this;

    const Axes = function()
    {
        this.type = scope.type;
        this.keys = Object.keys( scope.dimensions );
        this.values = Object.values( scope.dimensions );
        this.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value );

        const axes = this;

        // set defaults
        this.keys.forEach( a =>
        {
            this[ a ] =
            {
                axis: a,
                max: scope.dimensions[ a ],
                center: scope.dimensions[ a ] / 2,
                mod: scope.mod ? scope.mod[ a ] : null
            };
        } );

        this.distance = Math.sqrt( this.x.center * this.x.center + this.y.center * this.y.center + this.z.center * this.z.center );

        const layer = this.x.max * this.z.max;

        // get instance
        this.Indices = function( index )
        {
            axes.keys.forEach( a =>
            {
                this[ a ] = {};
                Object.assign( this[ a ], axes[ a ] );
            } );

            this.x.index =            ( index % layer )      % axes.x.max;
            this.y.index =  Math.floor( index / layer )      % axes.y.max;
            this.z.index =  Math.floor( index / axes.x.max ) % axes.z.max;

            axes.keys.forEach( a =>
            {
                this[ a ].coord = ( this[ a ].index - axes[ a ].center ) + 0.5;
            } );

            this.plot = plottable( { x: this.x.index, y: this.y.index, z: this.z.index }, { x: this.x.coord, y: this.y.coord, z: this.z.coord } );
        };
        
        const edge = function( index, a )
        {
            return index[ a ] % this[ a ].max === 0 || index[ a ] % this[ a ].max === this[ a ].max - 1;
        }.bind( this );

        const plottable = function( index )
        {
            var result = [];

            switch ( this.type )
            {     
                case "box":
                    // any coord on the edge
                    return this.keys.some( a => edge( index, a ) );

                case "container":
                    // 2 of 3 coords on the edge or mod with filled interior
                    this.keys.forEach( a =>
                    {
                        result.push( this.keys.every( a => !( edge( index, a ) ) ) );

                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( a => this[ a ].mod ? edge( index, a ) || index[ a ] % this[ a ].mod === 0 : false ) );
                    } );

                    return result.some( r => r );

                case "cage":
                    // frame without interior
                    this.keys.forEach( a =>
                    {
                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( b => this[ b ].mod ? this.keys.some( a => edge( index, a ) ) && ( index[ b ] % this[ b ].mod === 0 || edge( index, b ) ): false ) );
                    } );

                    return result.some( r => r );

                case "corners":
                    // all coords on the edge
                    return this.keys.every( a => edge( index, a ) );
                
                case "edges":
                    // 2 of 3 coords on the edge
                    this.keys.forEach( a =>
                    {
                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( a => edge( index, a ) ) );
                    } );

                    return result.some( r => r );

                case "frame":
                    // 2 of 3 coords on the edge or mod
                    this.keys.forEach( a =>
                    {
                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( a => this[ a ].mod ? edge( index, a ) || index[ a ] % this[ a ].mod === 0 : false ) );
                    } );

                    return result.some( r => r );

                case "jail":
                    // frame without interior with floor and two walls
                    this.keys.forEach( a =>
                    {
                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( b => this[ a ].mod ? this.keys.some( a => edge( index, a ) ) && index[ a ] % this[ a ].mod === 0 : false ) );
                    } );

                    return result.some( r => r );

                case "lattice":
                    // 2 of 3 coords on the mod
                    this.keys.forEach( a =>
                    {
                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( a => this[ a ].mod ? index[ a ] % this[ a ].mod === 0 : true ) );
                    } );

                    return result.some( r => r );

                case "nodes":
                    // all coord on the edge or mod
                    return this.keys.every( a => this[ a ].mod ? edge( index, a ) || index[ a ] % this[ a ].mod === 0 : true );

                case "reinforced":
                    // box with frame inside
                    this.keys.forEach( a =>
                    {
                        // draw the box
                        result.push( this.keys.some( a => edge( index, a ) ) );

                        var array = [ ...this.keys ];
                            array.splice( array.indexOf( a ), 1 );

                        result.push( array.every( a => this[ a ].mod ? edge( index, a ) || index[ a ] % this[ a ].mod === 0 : false ) );
                    } );

                    return result.some( r => r );

                case "sphere":
                    const sq = function( i )
                    {
                        const a = [ "x", "y", "z" ];
                        const n = ( index[ a[ i % 3 ] ] - this[ a[ i % 3 ] ].center ) * 2;

                        return n * n
                    }.bind( this );

                    var d = Math.sqrt( sq( 0 ) + sq( 1 ) + sq( 2 ) );

                    if ( this.distance > d )
                        result.push( index );

                    return result.some( r => r );

                default:
                    return true;
            }
        }.bind( this );
    };
    
    // set attributes
    scope.alternate = 
    {
        color: ( color, i ) => { return new THREE.Color( color[ i % 2 ] ) },
        position: ( position ) => { return position },
        opaque: ( opaque ) => { return opaque }
    };
    
    scope.set = 
    {
        color: ( color ) => { return color },
        position: ( position ) => { return position },
        opaque: ( opaque ) => { return opaque }
    };
    
    scope.random =
    {
        color: ( range ) => { return new THREE.Color( app.utils.random( range.min, range.max ) ) },
        position: ( range ) => { return new THREE.Vector3( app.utils.random( range.min, range.max ), app.utils.random( range.min, range.max ), app.utils.random( range.min, range.max ) ) },
        opaque: () => { return Math.random() }
    };    
    
    // blob geometry
    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.scale = args.scale || new THREE.Vector3( 1, 1, 1 );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.axes = new Axes();

        scope.onInstancedComplete = ( instance ) =>
        {
            scope.mesh = instance.mesh;
            scope.mesh.scale.copy( scope.scale );
            scope.plot( instance.mesh );
            scope.group.add( instance.mesh );
        };

        scope.count = scope.axes.count;
        scope.instanced = new Instanced( app, scope );
    };

    scope.plot = function( mesh )
    {
        var a;
        var i = 0;
        var opaque = scope[ scope.attributes.opaque.name ].opaque( scope.attributes.opaque.value );

        for ( var c = 0; c < scope.axes.count; c++ )
        {
            a = new scope.axes.Indices( c );

            if ( a.plot )
            {
                a.instance = i;

                var dummy = new THREE.Object3D();
                    dummy.position.set( a.x.coord, a.y.coord, a.z.coord );
                    dummy.updateMatrix();

                mesh.setMatrixAt( i, dummy.matrix );

                if ( scope.raycaster )
                    scope.raycaster.positions.push( dummy );

                // calls either set or random to get appropriate returned value
                app.utils.attributes.set( mesh.geometry, "color",  i, scope[ scope.attributes.color.name ].color( scope.attributes.color.value, i ) );
                app.utils.attributes.set( mesh.geometry, "start",  i, scope[ scope.attributes.start.name ].position( scope.attributes.start.value || dummy.position ) );
                app.utils.attributes.set( mesh.geometry, "end",    i, scope[ scope.attributes.end.name ].position( scope.attributes.end.value || dummy.position ) );
                app.utils.attributes.set( mesh.geometry, "opaque", i, opaque );

                i++;
            }
        }

        scope.count = i;

        mesh.instanceMatrix.needsUpdate = true;
    };
};