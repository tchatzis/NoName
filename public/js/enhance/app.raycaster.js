const Raycaster = function()
{
    var scope = "raycaster";
    var app = this;
        app[ scope ] = {};

    const Beam = function( args )
    {
        const box =
        {
            name: "beam",
            parent: args.parent,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0xFFFFFF ), // base color
            width: args.width || 0.01,
            height: args.far,
            segments: 20
        };

        const shader =
        {
            type: "Laser",
            includes: { fragment: [ "noise" ] },
            params:
            {
                side: THREE.FrontSide,
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: 0,
                depthTest: true,
                flatShading: true
            },
            uniforms:
            {
                color:      { value: args.color || new THREE.Color( 0xff3366 ) },
                time:       { value: 0.0 },
                resolution: { value: { x: 16, y: 16 } },
                billboard:  { value: !!args.billboard }
            }
        };

        this.beam = new app.presets.Beam( box );
        this.beam.shader.load( shader.type, shader );
        this.beam.mesh.visible = false;
        this.beam.mesh.receiveShadow = false;
        this.beam.mesh.castShadow = false;
        this.beam.mesh.material.uniforms = Object.assign( {}, shader.uniforms );
    };

    const Probe = function( args )
    {
        const cube =
        {
            name: "probe",
            parent: args.parent,
            size: args.size,
            segments: 1,
            position: new THREE.Vector3( 0, args.elevation, 0 ),
            color: args.color
        };

        var probe = new app.presets.Cube( cube );
            probe.add();

        this.probe = probe.mesh;
    };

    const callback = function( intersects )
    {
        //console.clear();

        var object;

        for ( var i = 0; i < intersects.length; i++ )
        {
            object = intersects[ i ].object;
            console.log( i, intersects[ i ] );
        }
    };
    
    const debug = function( origin, direction, group )
    {
        var material = new THREE.LineBasicMaterial( { color: 0xffcc00 } );

        if ( this.raycaster.line )
            group.remove( this.raycaster.line );

        var points = [];
            points.push( origin.clone() );
            points.push( origin.clone().add( direction.clone().multiplyScalar( this.raycaster.far ) ) );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var line = new THREE.Line( geometry, material );
            line.name = "debug";
            line.renderOrder = this.raycaster.positions.length;

        group.add( line );
        this.raycaster.line = line;
    };

    const finished = function( p, name )
    {
        var length = this.raycaster.positions.length;

        if ( p > 0 && p === length )
        {
            app.kill( app.arrays.functions, name );

            if ( this.raycaster.line )
            {
                this.group.remove( this.raycaster.line );
            }

            return true;
        }
        else if ( length === 0 )
        {
            return true;
        }

        return false;
    };

    const intersect = function()
    {
        var intersects = this.raycaster.intersectObjects( this.raycaster.objects );

        if ( intersects.length )
            this.raycaster.callback.call( this, intersects );
    };

    const Remove = function( intersect )
    {
        var increment = Math.random() * 0.1 + 0.01;

        const change = function( value )
        {
            value -= increment;

            if ( value <= 0 )
            {
                app.utils.attributes.set( intersect.object.geometry, "opaque", intersect.instanceId, 0 );
                app.utils.attributes.set( intersect.object.geometry, "color", intersect.instanceId, new THREE.Color( 0x000000 ) );
            }
            else
            {
                var hue = 0.17 * value;

                app.utils.attributes.set( intersect.object.geometry, "opaque", intersect.instanceId, value );
                app.utils.attributes.set( intersect.object.geometry, "color", intersect.instanceId, new THREE.Color( 0xFFFFFF ).setHSL( hue, 1, 0.5 ) );

                setTimeout( () => change( value ), app.utils.fps );
            }
        };

        change( 1 );
    };

    const remove = function( intersects )
    {
        for ( let i = 0; i < intersects.length; i++ )
        {
            let predicate = intersects[ i ].distance < this.raycaster.far && app.controls.active.beam && intersects[ i ].hasOwnProperty( "instanceId" ) && this.raycaster.removed.indexOf( intersects[ i ].instanceId ) === -1;

            if ( predicate )
            {
                new Remove( intersects[ i ] );
                this.raycaster.removed.push( intersects[ i ].instanceId );
            }
        }
    };

    app[ scope ].Culling = function( target, args )
    {
        var p = 0;
        var t = 0;

        app.controls.active.beam = true;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.near = app.stage.camera.near;
        this.raycaster.far = args.far || app.stage.world;
        this.raycaster.objects = [];
        this.raycaster.positions = [];

        this.raycaster.callback = ( intersects ) =>
        {
            var radius = Math.cbrt( this.raycaster.positions.length ) / 2;

            for ( let i = 0; i < intersects.length; i++ )
            {
                if ( intersects[ i ].distance > radius )
                {
                    if ( intersects[ i ].hasOwnProperty( "instanceId" ) )
                    {
                        app.utils.attributes.set( intersects[ i ].object.geometry, "opaque", intersects[ i ].instanceId, 0 );
                        app.utils.attributes.set( intersects[ i ].object.geometry, "color", intersects[ i ].instanceId, new THREE.Color( 0x000000 ) );
                    }
                }
            }
        };

        Beam.call( this.raycaster, args );

        var update = function()
        {
            if ( !finished.call( this, p, args.name ) )
            {
                var origin = target.position || new THREE.Vector3();
                var direction = new THREE.Vector3().copy( this.raycaster.positions[ p ].position ).normalize();
                var lookat = origin.clone().add( direction );

                this.raycaster.set( origin, direction );
                this.raycaster.beam.mesh.position.copy( origin );
                this.raycaster.beam.mesh.material.uniforms.time.value = t;
                this.raycaster.beam.mesh.visible = app.controls.active.beam;
                this.raycaster.beam.mesh.lookAt( lookat );
                this.raycaster.beam.mesh.translateZ( args.far / 2 );

                intersect.call( this );

                p++;
            }

            t += 0.01;
        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };

    app[ scope ].Guide = function( target, args )
    {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.near = 0.1;
        this.raycaster.far = args.far;
        this.raycaster.objects = args.objects;
        this.raycaster.callback = ( intersects ) =>
        {
            if ( args.onRaycasterIntersects )
                args.onRaycasterIntersects( intersects );
        };

        const update = function()
        {
            var origin = target.position;
            var direction = args.direction || new THREE.Vector3( 0, -1, 0 );

            this.raycaster.set( origin, direction );

            intersect.call( this );
        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };

    app[ scope ].Lathe = function( target, args )
    {
        var p = 0;
        var t = 0;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.far = args.far;
        this.raycaster.objects = [];
        this.raycaster.positions = [];
        this.raycaster.removed = [];
        this.raycaster.callback = ( intersects ) => { remove.call( this, intersects ); p++ };

        Beam.call( this.raycaster, args );

        const update = function()
        {
            if ( !finished.call( this, p, args.name ) )
            {
                var origin = target.position;
                var direction = new THREE.Vector3( 0, 0, -1 );

                this.raycaster.set( origin, direction );
                this.raycaster.beam.mesh.position.copy( origin );
                this.raycaster.beam.mesh.material.uniforms.time.value = t;
                this.raycaster.beam.mesh.visible = app.controls.active.beam;
                this.raycaster.beam.mesh.translateZ( -this.raycaster.far / 2 );
                this.raycaster.beam.mesh.scale.set( 1, 1, this.raycaster.far / args.far );

                intersect.call( this );
            }

            t += 0.01;
        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };

    /*app[ scope ].Probe = function( target, args )
    {
        var p = 0;
        var t = 0;

        args.parent = this.group;

        console.log( target, target.position, this.mesh );

        app.controls.active.beam = false;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.far = args.far;
        this.raycaster.objects = [];
        this.raycaster.positions = [];
        this.raycaster.removed = [];
        this.raycaster.userData =
        {
            index: {},
            distance: {},
            point: {},
            percent: null
        };
        this.raycaster.callback = ( intersects ) =>
        {
            if ( t < 1 )
                console.log( this.raycaster.onRaycasterProbe, args.onRaycasterProbe, app.controls.active.beam );

            // hook to hijack the callback function
            if ( this.raycaster.onRaycasterProbe )
                args.onRaycasterProbe = this.raycaster.onRaycasterProbe;

            if ( app.controls.active.beam )
            {
                this.raycaster.userData.percent = 100 * intersects[ 0 ].distance / this.raycaster.ray.origin.y;

                args.find.forEach( _name =>
                {
                    for ( let i = 0; i < intersects.length; i++ )
                    {
                        let name = intersects[ i ].object.name;

                        if ( _name === name )
                        {
                            this.raycaster.userData.index[ name ] = intersects[ i ].faceIndex;
                            this.raycaster.userData.distance[ name ] = intersects[ i ].distance;
                            this.raycaster.userData.point[ name ] = intersects[ i ].point;
                            break;
                        }
                    }
                } );

                if ( args.onRaycasterProbe )
                    args.onRaycasterProbe( this.raycaster.userData );
            }

            p++
        };

        Beam.call( this.raycaster, args );

        const update = function()
        {
            var origin = target.position;
            var direction = new THREE.Vector3( 0, -1, 0 );
            var lookat = origin.clone().add( new THREE.Vector3( 0, 0, 1 ) );

            this.raycaster.set( origin, direction );
            this.raycaster.beam.mesh.position.copy( origin );
            if ( this.raycaster.beam.mesh.material.uniforms )
                this.raycaster.beam.mesh.material.uniforms.time.value = t;
            this.raycaster.beam.mesh.visible = app.controls.active.beam;
            this.raycaster.beam.mesh.lookAt( lookat );
            this.raycaster.beam.mesh.translateY( -args.far / 2 );

            intersect.call( this );

            t += 0.01;
        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };*/

    app[ scope ].Ray = function( target, args )
    {
        var p = 0;
        var t = 0;

        app.controls.active.beam = true;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.far = args.far;
        this.raycaster.objects = [];
        this.raycaster.positions = [];
        this.raycaster.removed = [];
        this.raycaster.callback = ( intersects ) => { remove.call( this, intersects ); p++ };

        app.helpers.camera.visible = true;

        const update = function()
        {
            if ( !finished.call( this, p, args.name ) )
            {
                var origin = app.stage.camera.position.clone();//.transformDirection( app.stage.camera.matrixWorld ) );
                var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( app.stage.camera.matrixWorld ).normalize();//;

                this.raycaster.set( origin, direction );

                intersect.call( this );
            }

            t += 0.01;
        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };

    app[ scope ].Scan = function( target, args )
    {
        var t = 0;
        var scanner = new Scanner();

        app.controls.active.beam = true;

        this.probe = target || new Probe( Object.assign( args, { elevation: args.elevation } ) ).probe;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name || this.probe.uuid;
        this.raycaster.far = args.far;
        this.raycaster.objects = args.objects;
        this.raycaster.positions = [];
        this.raycaster.removed = [];
        this.raycaster.userData =
        {
            index: {},
            distance: {},
            point: {},
            percent: null
        };
        this.raycaster.callback = ( intersects ) => args.onRaycasterProbe.call( this, intersects );
        
        scanner.init.call( app, this.probe, args );
        scanner.raycaster = this.raycaster;

        Beam.call( this.raycaster, args );
        this.raycaster.beam.mesh.rotateX( -Math.PI / 2 );

        const update = function()
        {
            var origin = this.probe.position.clone();
            var direction = new THREE.Vector3( 0, -1, 0 );

            this.raycaster.set( origin, direction );
            this.raycaster.beam.mesh.position.copy( origin );
            this.raycaster.beam.mesh.material.uniforms.time.value = t;
            this.raycaster.beam.mesh.visible = app.controls.active.beam;
            this.raycaster.beam.mesh.translateZ( -args.far / 2 );

            scanner.next();

            intersect.call( this );

            t += 0.01;
        }.bind( this );

        app.arrays.functions.push( { name: this.raycaster.name, scope: this, function: update, args: null } );
    };
    
    app[ scope ].Targeting = function( target, args )
    {
        var hx = window.innerWidth / 2;
        var hy = window.innerHeight / 2;
        var x = hx;
        var y = hy;
        var input = {};
        var max = 10;
        var min = 0.5;
        var speed = 4;
        var size = min;
        var factor = 1;
        var timing = false;
        var timeout;
        var mouse = {};

        var timer = function()
        {
            if ( !timing )
            {
                timing = true;

                timeout = setTimeout( () => { x = hx; y = hy; app.ui.raycasting.classList.remove( "active" ); }, 2000 );
            }
        };

        var raycaster = new THREE.Raycaster();
            raycaster.name = args.name;
            raycaster.callback = args.callback ? args.callback : callback;
            raycaster.active = false

        const update = function()
        {
            var intersects = [];
            var gamepad = Object.keys( app.gamepad ).length;

            if ( gamepad )
            {
                var v = app.gamepad.values;

                if ( v.hat.x.value )
                {
                    x += v.hat.x.value * speed * factor;
                    raycaster.active = !!v.hat.x.value;
                }

                if ( v.hat.y.value )
                {
                    y += v.hat.y.value * speed * factor;
                    raycaster.active = !!v.hat.y.value;
                }

                input = new THREE.Vector2( ( x - hx ) / hx, -( y - hy ) / hy );
            }
            else
            {
                x = mouse.X;
                y = mouse.Y;

                input = new THREE.Vector2( app.controls.mouse.x, app.controls.mouse.y );
            }

            if ( raycaster.active )
            {
                timing = false;

                if ( timeout )
                    clearTimeout( timeout );

                app.ui.raycasting.classList.add( "active" );

                raycaster.setFromCamera( input, app.stage.camera );

                intersects = raycaster.intersectObjects( target.parent.children );

                if ( intersects.length )
                {
                    factor = ( app.stage.world - intersects[ 0 ].distance ) / app.stage.world;
                    size = max * factor + min;
                }

                app.ui.raycasting.style.width = size + "vh";
                app.ui.raycasting.style.height = size + "vh";
                app.ui.raycasting.style.left = x - app.ui.raycasting.offsetWidth / 2 + "px";
                app.ui.raycasting.style.top = y - app.ui.raycasting.offsetHeight / 2 + "px";

                raycaster.callback.call( null, intersects );

                if ( gamepad ) raycaster.active = false;
            }
            else
            {
                timer();
            }

            if ( !intersects.length )
            {
                size = min;
            }
        };

        this.raycaster = raycaster;

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
        
        function movement( e )
        {
            e.preventDefault();
            e.stopPropagation();
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            mouse.x =  ( e.clientX / window.innerWidth )  * 2 - 1;
            mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;
            mouse.X = e.clientX;
            mouse.Y = e.clientY;
        }

        function enable( e )
        {
            if ( e.target.nodeName === "CANVAS" )
            {
                raycaster.active = true;
            }
        }

        function disable( e )
        {
            raycaster.active = false;
        }
        
        window.addEventListener( "mousedown", enable, false );
        window.addEventListener( "mouseup",   disable, false );
        window.addEventListener( "mousemove", movement, false );
    };
    
    app[ scope ].Tracking = function( target, args )
    {
        var p = 0;
        var positions = target.geometry.vertices;
        var direction;

        target.visible = !!args.debug;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.name = args.name;
        this.raycaster.near = app.stage.camera.near;
        this.raycaster.far = args.far || app.stage.world;
        this.raycaster.callback = args.callback ? args.callback : callback;
        this.raycaster.objects = [];
        this.raycaster.positions = [];

        var update = function()
        {
            p = p % positions.length;

            direction = new THREE.Vector3().copy( positions[ p ] );

            this.raycaster.set( target.position, direction.normalize() );

            debug.call( this, target.position, direction, this.group );

            intersect.call( this );

            p++;
        }.bind( this );

        if ( positions.length )
            app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };
    
    
};