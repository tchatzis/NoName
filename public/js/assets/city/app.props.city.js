const City = function()
{
    var app = {};
    var scope = this;
    var layers = {};

    var Data = function()
    {
        this.count = 0;
        this.positions = [];
    };

    var skew = function()
    {
        var axes = [ null, "xz", null, "zx", null ];
        var axis = app.utils.item( axes );

        if ( axis )
        {
            return { [ axis ]: Math.random() * 0.8 + 0.2 }
        }

        return 0;
    };

    var vertex = function( layer, w, h )
    {
        var mesh = layer.children[ 0 ];
        var vertices = mesh.geometry.vertices;
        var v = ( scope.z + 1 ) * w + h;

        return vertices[ v ];
    };

    var Building = function( x, z, params )
    {
        var position = vertex( scope.ground, x, z );
        var elevation = position.y + scope.elevate;

        // make distance from center factor into height
        this.distance = Math.round( Math.sqrt( Math.pow( x - params.center.x, 2 ) + Math.pow( z - params.center.z, 2 ) ) );

        if ( elevation > 0 && this.distance <= params.span )
        {
            const cube =
            {
                name: "building" + scope.buildings,
                parent: params.parent,
                size: Math.random() * 0.5 + 0.75,
                segments: 1,
                position: new THREE.Vector3().copy( position )
            };

            if ( cube.size > 0 )
            {
                this.base = cube.size * scope.size / Math.max( scope.x, scope.z );
                this.height = params.ratio * Math.max( ( 1 - this.distance / params.span ), 0.1 );

                this.building = new app.presets.Cube( cube );
                this.building.skew( cube.name, skew() );
                this.building.mesh.scale.set( 1, this.height, 1 );
                this.building.mesh.scale.multiplyScalar( this.base );
                this.building.add();
                this.building.mesh.position.y = elevation + this.height * this.base * 0.4;
            }

            scope.buildings.count++;
            scope.buildings.positions.push( this.building.position );
        }
    };

    /*var Piling = function( params )
    {
        this.piling = new THREE.Mesh( new THREE.BoxBufferGeometry(), new THREE.MeshStandardMaterial( { color: new THREE.Color( params.color ) } ) );
        this.piling.name = "piling" + scope.pilings;
        this.piling.position.copy( params.position );
        this.piling.scale.set( 3, params.elevate, 3 );
        this.piling.position.y = params.elevate / 2;

        params.parent.add( this.piling );

        scope.pilings.count++;
        scope.pilings.positions.push( this.piling.position );
    };*/

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );
        
        scope.size = app.stage.world * scope.scale;
        scope.ceiling = scope.size / 4;
        scope.elevate = scope.ceiling / 8;
        scope.buildings = new Data();
        //scope.pilings = new Data();

        scope.objects = [];
    };

    scope.add = function( params )
    {
        layers[ params.name ].call( scope, params );
    };

    scope.remove = function( name )
    {

    };

    layers.downtown = function( params )
    {
        params.parent = new THREE.Group();
        params.parent.name = params.name;

        for ( var x = params.center.x - params.span; x < params.center.x + params.span; x += 2 )
        {
            for ( var z = params.center.z - params.span; z < params.center.z + params.span; z += 2 )
            {
                new Building( x, z, params );
            }
        }

        scope[ params.name ] = params.parent;

        scope.group.add( scope[ params.name ] );

        return scope[ params.name ];
    };
    
    layers.fog = function( params )
    {
        app.stage.scene.fog.name = params.name;
        app.stage.scene.fog.near = params.near || scope.size;
        app.stage.scene.fog.far = params.far || scope.size;
        app.stage.scene.fog.color.copy( params.color || app.stage.clearColor );

        return app.stage.scene.fog;
    };
    
    layers.ground = function( params )
    {
        const args =
        {
            name: params.name,
            parent: scope.group,
            position: new THREE.Vector3( 0, scope.elevate, 0 ),
            color: new THREE.Color( params.color ),
            width: scope.size,
            height: scope.size,
            widthSegments: 50,
            heightSegments: 50,
            wireframe: params.wireframe
        };

        const topography =
        {
            name: params.name,
            amplitude: scope.ceiling,
            noiseScale: 2,
            speed: 0,
            lateral: 0,
            smooth: true,
            animate: false
        };

        var object = new app.presets.Plane( args );
            object.enhance( app.lipstick.distort, topography );

        scope.objects.push( object.mesh );

        scope.x = args.widthSegments;
        scope.z = args.heightSegments;
        scope.unit = scope.size / Math.min( scope.x, scope.z );

        scope[ params.name ] = object.group;
        scope[ params.name ].mesh = object.mesh;

        return scope[ params.name ];
    };
    
    layers.raycaster = function( params )
    {
        const Args = function( args )
        {
            this.name       = args.name || scope.name;
            this.parent     = args.parent || scope.group;
            this.color      = args.color;
            this.elevation  = scope.size * 0.2;
            this.size       = args.size || 10;
            this.width      = args.width || 1;
            this.debug      = args.debug || false;
            this.near       = args.near || 0.1;
            this.far        = args.far;
            this.objects    = args.objects || scope.objects;
            this.resolution = args.resolution;
            this.step       = args.step;
            this.from       = args.from;
            this.to         = args.to;
            this.onRaycasterProbe = args.callback;
        };

        const args = new Args(
        {
            color: params.color,
            size: 10,
            far: scope.size * 0.4,
            resolution: 500,
            step: 10,
            from: new THREE.Vector3( -scope.size / 2, 0, -scope.size / 2 ),
            to: new THREE.Vector3( scope.size / 2, 0, scope.size / 2 ),
            callback: callback
        } );

        new app.raycaster.Scan( null, args );

        function elevation( intersects )
        {
            var found = [];
            var points = [];

            for ( let i of intersects )
            {
                if ( [ "ground", "water" ].find( name => i.object.name === name ) )
                {
                    if ( !found.find( name => i.object.name === name ) )
                    {
                        found.push( i.object.name );
                        points.push( i.point );
                    }
                }
            }

            if ( points.length === 2 )
            {
                let vector = points[ 0 ].clone().sub( points[ 1 ].clone() );

                return {
                    measured: true,
                    point: new THREE.Vector3( points[ 0 ].x, args.elevation, points[ 0 ].z ),
                    vector: vector,
                    value: vector.y,
                    percent: Math.round( 200 * vector.y / args.elevation ) / 2,
                    height: args.elevation,
                    ground: found[ 0 ] === "ground",
                    water:  found[ 0 ] === "water"
                };
            }
            else
                return { measured: false };
        }

        // set up new scan area
        function points( point, resolution )
        {
            var center = { x: Math.round( point.x / resolution ) * resolution, z: Math.round( point.z / resolution ) * resolution };
            var bound = scope.size / 2;

            return {
                from: { x: Math.max( center.x - resolution * 2, -bound ), z: point.z },
                to  : { x: Math.min( center.x + resolution * 2,  bound ), z: Math.min( point.z + resolution, bound ) }
            };
        }

        function callback( intersects )
        {
            if ( app.controls.active.beam )
            {
                let data = elevation( intersects );

                // set up new scan for shoreline
                if ( data.measured && data.percent < 1 )
                {
                    let args = new Args(
                    {
                        name: app.utils.uuid(),
                        color: new THREE.Color( 0xFFFFFF * Math.random() ),
                        size: 10,
                        far: scope.size * 0.4,
                        resolution: 5,
                        step: 5,
                        callback: stream // streams data
                    } );

                    let resample = points( data.point, args.resolution );

                    args.from = new THREE.Vector3( resample.from.x, 0, resample.from.z );
                    args.to   = new THREE.Vector3( resample.to.x,   0, resample.to.z );

                    var scan = new app.raycaster.Scan( null, args );
                }
            }
        }

        function stream( data )
        {
            console.log( data );
        }
    };

    layers.water = function( params )
    {
        const args =
        {
            name: params.name,
            parent: scope.group,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( params.color ),
            width: scope.size,
            height: scope.size,
            widthSegments: 1,
            heightSegments: 1
        };

        var object = new app.presets.Plane( args );
            object.add();

        scope.objects.push( object.mesh );

        scope[ params.name ] = object.group;
        scope[ params.name ].mesh = object.mesh;

        return scope[ params.name ];
    };
};