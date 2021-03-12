const Lipstick = function()
{
    var scope = "lipstick";
    var app = this;
        app[ scope ] = {};

    app[ scope ].Collate = function( target, args )
    {
        target.material.color = new THREE.Color( args.front );
        target.material.side = THREE.FrontSide;
    
        var geometry = target.geometry.clone();
        var material = target.material.clone();
            material.color = new THREE.Color( args.back );
            material.side = THREE.BackSide;

        this.mesh = new THREE.Mesh( geometry, material );
    
        target.add( this.mesh );
    };

    app[ scope ].contour = function( target, args )
    {
        var min = { value: Infinity, index: -1, axis: null };
        var axes = [ "x", "y", "z" ];
        var dimensions = [ "width", "height", "depth" ];
        var parameters = dimensions.map( ( d, i ) =>
        {
            if ( min.value > target.geometry.parameters[ d ] )
            {
                min = { value: target.geometry.parameters[ d ], index: i, axis: axes[ i ] };
            }

            return { axis: axes[ i ], parameter: d, value: target.geometry.parameters[ d ], segments: target.geometry.parameters[ `${ d }Segments` ] };
        } );
        var vertices = target.geometry.vertices;
        var length = vertices.length;
        var snoise = new ImprovedNoise();

        for ( var v = 0; v < length; v++ )
        {
            axes.forEach( ( a, i ) =>
            {
                var angle;
                var value = 1;
                var j = ( i + 2 ) % 3;
                var b = axes[ j ];

                switch( args.type )
                {
                    case "mounds":
                        angle = Math.PI * args.noiseScale * vertices[ v ][ a ] / parameters[ i ].segments;
                        value = Math.sin( angle );
                    break;

                    case "noise":
                        value = snoise.noise( Math.floor( ( v / parameters[ i ].segments ) / length ) * args.noiseScale, ( ( v / parameters[ j ].segments ) % length ) * args.noiseScale, args.seed() );
                    break;

                    case "ripple":
                        angle = args.noiseScale * Math.sqrt( vertices[ v ][ a ] * vertices[ v ][ a ] + vertices[ v ][ b ] * vertices[ v ][ b ] );
                        value = Math.sin( angle );
                    break;
                }

                if ( a !== min.axis )
                {
                    vertices[ v ][ min.axis ] += args.amplitude * value;
                }
            } );
        }

        target.geometry.computeVertexNormals();
        target.geometry.verticesNeedUpdate = true;
    };

    app[ scope ].CubeCamera = function( target, args )
    {
        args.target = target;
        app.textures.CubeCamera.call( this, args );
    };

    app[ scope ].displacement = function( target, args )
    {
        target.name = args.name;

        if ( args.map )
        {
            target.material.side = THREE.FrontSide;
            target.customDepthMaterial = new THREE.MeshDepthMaterial(
            {
                depthPacking: THREE.RGBADepthPacking,
                displacementMap: args.map.texture,
                displacementScale: args.scale,
                displacementBias: args.bias
            } );
            target.material.displacementMap = args.map.texture;
            target.material.displacementScale = args.scale;
            target.material.displacementBias = args.bias;
            target.material.needsUpdate = true;
        }
    };

    app[ scope ].disruptor = function( target, args )
    {
        args.target = target;
        args.dimensions = this.grid.dimensions;

        var disruptors = new Disruptors();
            disruptors.init.call( app, this, args );
    };

    app[ scope ].distort = function( target, args )
    {
        var dimensions = target.geometry.parameters;
        var count = 0;
        var snoise = new ImprovedNoise();
        var width = dimensions.widthSegments;
        var height = dimensions.heightSegments;
        var speed = Math.abs( args.speed ) / Math.max( dimensions.width, dimensions.height );
        var lateral = Math.abs( Math.floor( args.lateral ) );
        var vertices = target.geometry.vertices;
        var noiseSeed = Math.random();
        var index = 0;

        this.update = function()
        {
            var offset = count * height * speed;
            var h = 0;
            var value = 0;
            var seed;
            //var direction = args.forward ? args.height : 0;

            while ( height >= h ) // make it > to flatten front edge
            {
                var w = width;

                while ( w >= 0 )
                {
                    index = h * ( height + 1 - lateral ) + w;

                    // change noiseSeed to random for rock slide effect
                    seed = args.smooth ? noiseSeed : Math.random();
                    value = snoise.noise( ( w ) / width * args.noiseScale, ( h + offset ) / height * args.noiseScale, seed ) * args.amplitude;
                    vertices[ index ].z = value;

                    w--;
                    index++;
                }

                h++;
            }

            count++;

            target.geometry.computeVertexNormals();
            target.geometry.verticesNeedUpdate = true;
            target.geometry.colorsNeedUpdate = true;
            target.geometry.normalsNeedUpdate = true;
        };

        target.name = args.name;
        target.material.vertexColors = args.vertexColors;

        this.mesh = target;
        this.update();
    };

    app[ scope ].Explode = function( target, args )
    {
        var scope = this;
        var axes = [ "X", "Y", "Z" ];
        var length = target.geometry.vertices.length;

        this.vertices = [];

        this.reset = function()
        {
            for ( var v = 0; v < length; v++ )
            {
                var vector = this.vertices[ v ];

                target.children[ v ].position.copy( vector );
                target.geometry.vertices[ v ].copy( vector );
                target.geometry.verticesNeedUpdate = true;
            }
        };

        this.implode = function()
        {
            var count = 0;

            var contract = function( index )
            {
                var time = Math.random() * args.time * 1000;

                axes.forEach( axis =>
                {
                    axis = axis.toLowerCase();

                    var d = target.geometry.vertices[ index ][ axis ] - this.vertices[ index ][ axis ];
                    var interval;
                    var s, f;

                    var lerp = function()
                    {
                        if ( app.ready )
                        {
                            if ( !s )
                            {
                                s = Date.now();
                                f = time;
                            }

                            var n = Date.now();
                            var e = ( n - s ) / f;
                            var value = e < 1 ? ( 1 - e ) * d + this.vertices[ index ][ axis ] : this.vertices[ index ][ axis ];

                            target.geometry.vertices[ index ][ axis ] = value;
                            target.geometry.verticesNeedUpdate = true;

                            if ( target.children.length )
                            {
                                target.children[ index ].position[ axis ] = value;
                                target.children[ index ].material.opacity = e;
                                target.children[ index ].material.color.setHSL( e - 1, 0.8, 0.5 );
                            }

                            if ( e > 1 )
                            {
                                count++;

                                if ( ( length * 3 ) === count && args.explode )
                                    setTimeout( () => scope.explode(), args.delay * 1000 );
                                
                                clearInterval( interval );
                            }
                        }
                    }.bind( this );

                    interval = setInterval( lerp, 4 );
                } );
            }.bind( this );

            for ( var index = 0; index < length; index++ )
            {
                contract( index );
            }
        };

        this.explode = function()
        {
            var count = 0;

            var expand = function( index )
            {
                var time = Math.random() * args.time * 1000;

                axes.forEach( axis =>
                {
                    axis = axis.toLowerCase();

                    var d = app.utils.range( -args.far, args.far ) - target.geometry.vertices[ index ][ axis ];
                    var interval;
                    var s, f;

                    var lerp = function()
                    {
                        if ( app.ready )
                        {
                            if ( !s )
                            {
                                s = Date.now();
                                f = time;
                            }

                            var n = Date.now();
                            var e = ( n - s ) / f;
                            var value = e * d / 250 + args.near + target.geometry.vertices[ index ][ axis ];

                            target.geometry.vertices[ index ][ axis ] = value;
                            target.geometry.verticesNeedUpdate = true;

                            if ( target.children.length )
                            {
                                target.children[ index ].position[ axis ] = value;
                                target.children[ index ].material.opacity = 1 - e;
                                target.children[ index ].material.color.setHSL( 1 - e, 0.8, 0.5 );
                            }

                            if ( e > 1 )
                            {
                                count++;

                                if ( ( length * 3 ) === count && args.implode )
                                    setTimeout( () => scope.implode(), args.delay * 1000 );

                                clearInterval( interval );
                            }
                        }
                    }.bind( this );

                    interval = setInterval( lerp, 4 );
                } );
            }.bind( this );

            for ( var index = 0; index < length; index++ )
            {
                expand( index );
            }
        };

        this.init = function()
        {
            for ( var index = 0; index < length; index++ )
            {
                var vertex = new THREE.Vector3().copy( target.geometry.vertices[ index ] );
                this.vertices.push( vertex );
            }

            setTimeout( () => scope.explode(), args.delay * 1000 );
        };

        this.init();
    };

    app[ scope ].LFO = function( target, args )
    {
        args.target = target;
        new app.utils.LFO( args );
    };

    app[ scope ].LookAt = function( target, args )
    {
        var object = args.from;
        this.name = `${ args.name }_${ object.uuid }`;

        this.track = function()
        {
            object.lookAt( target.position );
        };

        this.kill = function()
        {
            app.kill( app.arrays.functions, this.name );
        };

        app.arrays.functions.push( { name: this.name, scope: this, function: this.track, args: null } );
    };

    app[ scope ].pattern = function( target, args )
    {
        app.patterns[ args.type ].call( this, target, args );
    };

    app[ scope ].persistent = function( target, args )
    {
        app.persistent[ args.type ].call( this, target, args );
    };

    app[ scope ].Planet = function( target, args )
    {
        var textures = [ "blue", "circles", "earthly", "green_1", "green_2", "green_3", "green_4", "green_5", "green_6", "graph", "jupiter", "lightning",
            "mars", "mosaic", "perlin-512", "radial", "surface_1", "surface_2", "surface_3", "saturn", "stained_glass", "waternormals", "water_planet" ];
        var texture = app.utils.item( textures );
        var object = target.type === "Mesh" ? target : target.children[ 0 ];
            object.name = args.name;
            object.material = new THREE.MeshStandardMaterial();
            object.material.color = new THREE.Color( args.color );
            object.material.metalness = 0.3;
            object.material.reflectivity = 1.0;
            object.material.needsUpdate = true;
            object.material.envMap = args.envMap ? app.stage.scene.background : null;
            object.rotateX( args.tilt );
            object.scale.multiplyScalar( Math.random() * 0.75 + 0.25 );

            if ( args.texture )
            {
                texture = args.texture || app.assets.textures[ texture ];
                object.material.map = texture.texture;
                object.material.name = texture.name;
            }

            if ( args.displacement )
            {
                args.displacement.map = texture;
                new app.lipstick.displacement( object, args.displacement );
            }

            if ( args.rotation )
                app.arrays.animations.push( { name: args.name, object: target, path: args.rotation.attribute, value: args.rotation.value } );

            if ( args.orbit )
            {
                args.orbit.name = args.name;

                var trajectory = new app.trajectory.Plot( target, args.orbit );

                if ( args.orbit.target )
                {
                    var orbit = function()
                    {
                        trajectory.origin = new THREE.Vector3().copy( args.orbit.target.position );
                    };

                    app.arrays.functions.push( { name: args.name, scope: this, function: orbit, args: null } );
                }
            }
    };
    
    app[ scope ].Playback = function( target, args )
    {
        if ( args.target ) args.target = target;
        new app.textures.Playback( args );
    };

    app[ scope ].Quad = function( target, args )
    {
        args.target = target;
        app.textures.Quad.call( this, args );
    };

    app[ scope ].Reflect = function( target, args )
    {
        async function load()
        {
            await this.shader.load( args.type, args );

            this.mesh = app.textures.Reflect.call( target, args.texture );
        }

        load.call( this );
    };

    app[ scope ].RenderTarget = function( target, args )
    {
        args.target = target;
        app.textures.RenderTarget.call( this, args );
    };

    app[ scope ].Sprites = function( target, args )
    {
        var sprite;
        var length = target.geometry.vertices.length;
        var v = length - 1;

        target.material.visible = false;

        while ( v >= 0 )
        {
            sprite = new app.textures.Sprite(
            {
                name:  args.sprite.name,
                app:   app,
                debug: args.sprite.debug,
                alpha: args.sprite.alpha,
                stops: args.sprite.stops
            } ).sprite;
            sprite.scale.setScalar( args.sprite.size );
            sprite.renderOrder = v;
            sprite.position.copy( target.geometry.vertices[ v ] );

            target.add( sprite );
            v--;
        }
    };

    app[ scope ].Video = function( target, args )
    {
        var video = new app.textures.Video( args );
        
        target.material.map = video.texture;
        target.material.needsUpdate = true;
    };

    app[ scope ].VideoCube = function( target, args )
    {
        var materials = [];

        args.src.forEach( ( src ) =>
        {
            var video = new app.textures.Video( { loop: args.loop, src: src } );

            materials.push( new THREE.MeshStandardMaterial( { map: video.texture } ) );
        } );

        target.material = materials;
        target.material.needsUpdate = true;
    };
};