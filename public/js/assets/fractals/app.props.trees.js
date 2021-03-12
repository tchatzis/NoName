const Trees = function()
{
    var app = {};
    var scope = this;
    var circle = Math.PI * 2;
    var params = {};

    var center = function()
    {
        return ( Math.random() - 0.5 ) * 2;
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );
        Object.assign( params, args );

        delete params.type;
        delete params.parent;
        delete params.name;

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope[ scope.type ]();
    };

    scope.instance = function( geometry, count, callback )
    {
        var length = count * 3;
        var color = new Float32Array( length );
        var start = new Float32Array( length );
        var end = new Float32Array( length );
        var opaque = new Float32Array( count );
        var rotation = new Float32Array( length );
        //var matrix0 = new Float32Array( count * 4 );
        //var matrix1 = new Float32Array( count * 4 );
        //var matrix2 = new Float32Array( count * 4 );
        //var matrix3 = new Float32Array( count * 4 );

        const shader =
        {
            includes: {},
            params:
            {
                vertexColors: THREE.VertexColors,
                blending: THREE.NormalBlending,
                side: THREE.DoubleSide,
                flatShading: false,
                transparent: true,
                opaque: scope.opaque
            },
            uniforms: scope.uniforms
        };

        const load = async function()
        {
            geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( color, 3 ) );
            geometry.setAttribute( 'start', new THREE.InstancedBufferAttribute( start, 3 ) );
            geometry.setAttribute( 'end', new THREE.InstancedBufferAttribute( end, 3 ) );
            geometry.setAttribute( 'opaque', new THREE.InstancedBufferAttribute( opaque, 1 ) );
            geometry.setAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 3 ) );
            //geometry.setAttribute( 'matrix0', new THREE.InstancedBufferAttribute( matrix0, 4 ) );
            //geometry.setAttribute( 'matrix1', new THREE.InstancedBufferAttribute( matrix1, 4 ) );
            //geometry.setAttribute( 'matrix2', new THREE.InstancedBufferAttribute( matrix2, 4 ) );
            //geometry.setAttribute( 'matrix3', new THREE.InstancedBufferAttribute( matrix3, 4 ) );

            var material = await app.shaders.load( "tree", shader );
            var mesh = new THREE.InstancedMesh( geometry, material, count );
                mesh.name = scope.name;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.frustumCulled = false;
                mesh.layers.set( scope.layer || 0 );
                mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

            scope.group.add( mesh );

            if ( scope.uniforms && scope.uniforms.phase.value > -1 )
                app.arrays.animations.push( { name: scope.name, object: mesh, path: "material.uniforms.time.value", value: 0.01 } );

            callback( mesh );
        }.bind( this );

        load();
    };
    
    /*scope.bare = function()
    {
        var colors = [ 0x683B1B, 0x683B1B, 0x0F6E27, 0x779800, 0xEF7638, 0xEF0113, 0x949A06 ];

        const Params = function( params )
        {
            this.depth = params.depth - 1;
            this.size = params.size * scope.scale;
            this.branches = app.utils.random( scope.branches.min, scope.branches.max );
            this.group = new THREE.Group();
            this.group.name = params.depth;
            this.set =
            {
                position: ( position ) => this.group.position.copy( position ),
                rotation: ( rotation ) =>
                {
                    this.group.rotateY( rotation.y );
                    this.group.rotateX( rotation.x );
                    this.group.rotateZ( rotation.z );
                }
            };

            params.group.add( this.group );
        };

        var plot = function( params )
        {
            var point = new THREE.Vector3().copy( new THREE.Vector3( 0, params.size, 0 ) );
            var points = [];
                points.push( new THREE.Vector3() );
                points.push( point );
            var geometry = new THREE.BufferGeometry().setFromPoints( points );
            var material = new THREE.LineBasicMaterial( { color: app.utils.item( colors ) } );
            var line = new THREE.Line( geometry, material );

            params.group.add( line );

            return point;
        };

        var branch = function( params )
        {
            if ( params.depth > -1 )
            {
                for ( let b = 0; b < params.branches; b++ )
                {
                    var rx = Math.PI / scope.upright;
                    var ry = Math.PI * 2 * b / params.branches;
                    var rz = 0;
                    var point = plot( params );
                    var next = new Params( params );
                        next.set.position( point );
                        next.set.rotation( new THREE.Vector3( rx, ry, rz ) );

                    branch( next );
                }
            }
        };

        branch( scope );
    };*/

    scope.fern = function()
    {
        scope.instance( new THREE.SphereBufferGeometry( 0.05, 32, 32 ), scope.iterations, init );

        function init( mesh )
        {
            var matrix =
            [
                [
                    [ 0,     0,     0 ],
                    [ 0,     0.16,  0 ],
                    [ 0,     0,     1 ]
                ],
                [
                    [ 0.85,  0.04,  0 ],
                    [ -0.04, 0.85,  1.6 ],
                    [ 0,     0,     1 ]
                ],
                [
                    [ 0.2,   -0.26, 0 ],
                    [ 0.23,  0.22,  1.6 ],
                    [ 0,     0,     1 ]
                ],
                [
                    [ -0.15, 0.28,  0 ],
                    [ 0.26,  0.24,  0.44 ],
                    [ 0,     0,     1 ]
                ]
            ];

            var probability = cumsum( [ 0.01, 0.85, 0.07, 0.07 ] );

            function pick( probability )
            {
                var r = Math.random();

                for ( var i = 0; i < probability.length; i++ )
                {
                    if ( r < probability[ i ] ) return i;
                }

                return probability.length - 1;
            }

            function ifs( matrix, probability )
            {
                var pt = [ 1, 1, 1 ];

                for ( var i = 1; i < scope.iterations + 10; i++ )
                {
                    pt = mul( matrix[ pick( probability ) ], pt );

                    if ( i > 10 ) point( ( pt[ 0 ] ) / 8, pt[ 1 ] / 16, i );
                }

                mesh.instanceMatrix.needsUpdate = true;
            }

            function point( x, y, i )
            {
                var z = y * y * y * y + y;
                y -= x * x;

                var dummy = new THREE.Object3D();
                    dummy.position.set( x * scope.dimensions.x, y * scope.dimensions.y, -z * scope.dimensions.z );
                    dummy.updateMatrix();
                var color = new THREE.Color().setHSL( y / scope.dimensions.y - scope.hue, 0.8, 0.5 );
                var end = new THREE.Vector3( center() * scope.dimensions.x, center() * scope.dimensions.y, center() * scope.dimensions.z );

                mesh.setMatrixAt( i, dummy.matrix );

                app.utils.attributes.set( mesh.geometry, "color",  i, color );
                app.utils.attributes.set( mesh.geometry, "start",  i, dummy.position );
                app.utils.attributes.set( mesh.geometry, "end",    i, end );
                app.utils.attributes.set( mesh.geometry, "opaque", i, scope.opaque );
            }

            function cumsum( a )
            {
                var r = [];
                var s = 0;

                for ( var i = 0; i < a.length; i++ )
                {
                    s += a[ i ];
                    r.push( s );
                }

                return r;
            }

            function mul( matirx, probality )
            {
                var r = [];

                for ( var j = 0; j < matirx.length; j++ )
                {
                    var s = 0;

                    for ( var i = 0; i < probality.length; i++ )
                    {
                        s += probality[ i ] * matirx[ j ][ i ];
                    }

                    r.push( s );
                }

                return r;
            }

            ifs( matrix, probability );
        }
    };

    /*scope.lsystem = function()
    {
        var lsys = new LSys("F", {'F': "FF+[+F-F-F]-[-F+F+F]"});
        function Turtle(len, theta) {
            this.len = len;
            this.theta = theta;
            this.reset();
            return this;
        }
        Turtle.prototype.reset = function() {
            this.angle = Math.PI/2;
            this.p = {'x': W/2, 'y': H};
            this.stack = [];
        };
        Turtle.prototype.next = function() {
            return {'x': this.p.x+this.len*Math.cos(this.angle),
                'y': this.p.y-this.len*Math.sin(this.angle)};
        };
        Turtle.prototype.go = function() {
            var nextP = this.next();
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(this.p.x, this.p.y);
            ctx.lineTo(nextP.x, nextP.y);
            ctx.stroke();
            this.p = nextP;
        };
        Turtle.prototype.move = function() {
            this.p = this.next();
        };
        Turtle.prototype.turnLeft = function() {
            this.angle += this.theta;
        };
        Turtle.prototype.turnRight = function() {
            this.angle -= this.theta;
        };
        Turtle.prototype.push = function() {
            this.stack.push({'p': this.p, 'angle': this.angle});
        };
        Turtle.prototype.pop = function() {
            var s = this.stack.pop();
            this.p = s.p;
            this.angle = s.angle;
        };
        function LSys(axiom, rules) {
            this.sentence = axiom;
            this.rules = rules;
            return this;
        }
        LSys.prototype.generate = function() {
            var next = [];
            for (var i=0; this.sentence.length > i; i++) {
                var c = this.sentence[i];
                var r = this.rules[c];
                if (r) {
                    next.push(r);
                } else {
                    next.push(c);
                }
            }
            this.sentence = next.join("");
        };
        LSys.prototype.draw = function(t) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, W, H);
            t.reset();
            for (var i=0; this.sentence.length > i; i++) {
                var c = this.sentence[i];
                this.interpret(c, t);
            }
        };
        LSys.prototype.interpret = function(c, t) {
            if (c == 'F') t.go();
            else if (c == 'G') t.move();
            else if (c == '+') t.turnRight();
            else if (c == '-') t.turnLeft();
            else if (c == '[') t.push();
            else if (c == ']') t.pop();
        };
        var t = new Turtle(H/4, 25*Math.PI/180);
        for (var i=0; 4 > i; i++) {
            lsys.generate();
            t.len *= 0.5;
        }
        lsys.draw(t);
    };*/

    scope.tree = function()
    {
        var c = count();
        var i = 0;
        var geometry;
        var material;
        var args =
        {
            vertexColors: THREE.VertexColors,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            flatShading: false,
            transparent: true
        };
        var stalks, joints, leaves;        

        gui();
        controls();

        if ( c < 200000 )
            init();
        else
            throw( "Instance count is too high" );

        function center()
        {
            return ( 0.5 - Math.random() ) * 2;
        }

        function clear()
        {
            i = 0;

            for ( let i = scope.group.children.length - 1; i >= 0; i-- )
                scope.group.remove( scope.group.children[ i ] );
        }

        function controls()
        {
            app.ui.container.classList.add( "expand" );

            const isArray = ( o ) => Object.prototype.toString.call( o ) === '[object Array]';
            const isObject = ( o ) => typeof o === "object";

            function traverse( object, parent )
            {
                if ( isArray( object ) )
                    traverseArray( object, parent );
                else if ( ( typeof object === 'object' ) && ( object !== null ) )
                    traverseObject( object, parent );
            }

            function traverseArray( object, parent )
            {
                var f = 0;

                for ( let prop of object )
                {
                    if ( isObject( prop ) )
                    {
                        let folder = parent.addFolder( f++ );
                        traverse( prop, folder );
                    }
                    else
                    {
                        parent.add( object, prop ).name( prop ).onChange( update );
                    }
                }
            }

            function traverseObject( object, parent )
            {
                var folder;

                for ( let prop in object )
                {
                    if ( object.hasOwnProperty( prop ) )
                    {
                        if ( isObject( object[ prop ] ) )
                        {
                            folder = parent.addFolder( prop );
                        }
                        else
                        {
                            folder = parent;
                            folder.add( object, prop ).name( prop ).onChange( update );
                        }

                        traverse( object[ prop ], folder );
                    }
                }
            }

            traverse( params, app.gui );

            var object = { update: init };
            app.gui.add( object, "update" );
        }

        function count()
        {
            var count = 0;

            for ( let d = 0; d <= params.depth; d++ )
            {
                count += Math.pow( params.branches.maximum, d );
            }

            return count;
        }

        function Create( name, mesh, args )
        {
            this.object = new THREE.Object3D();
            this.object.position.copy( args.position );
            this.object.scale.setScalar( args.taper[ name ] );
            this.object.rotateY( args.angle );
            this.object.rotateZ( args.tilt[ name ] );
            this.object.translateY( args.length[ name ] / 2 );
            this.object.updateMatrix();

            mesh.setMatrixAt( i, this.object.matrix );
            mesh.instanceMatrix.needsUpdate = true;
            mesh.name = name;

            app.utils.attributes.set( mesh.geometry, "color", i, app.utils.item( params[ name ].color ) );

            scope.group.add( mesh );
        }

        function gui()
        {
            var gui = document.getElementById( "gui" );
            if ( gui ) gui.innerHTML = null;

            app.gui = new GUI();
            app.gui.setParentElement( app.ui.container );
        }

        function init()
        {
            clear();

            geometry = new THREE.CylinderBufferGeometry( params.stalk.diameter * params.stalk.taper, params.stalk.diameter, params.stalk.length, 16, 1, true );
            material = new THREE.MeshStandardMaterial( args );
            stalks   = new Instance( geometry, material, c ).mesh;

            geometry = new THREE.SphereBufferGeometry( params.joint.diameter );
            material = new THREE.MeshStandardMaterial( args );
            joints   = new Instance( geometry, material, c ).mesh;

            geometry = new THREE.PlaneBufferGeometry( params.leaf.diameter, params.leaf.diameter );
            geometry.rotateY( - Math.PI / 2 );
            material = new THREE.MeshStandardMaterial( args );
            leaves   = new Instance( geometry, material, c ).mesh;

            split(
            {
                angle: 0,
                branches: app.utils.random( params.branches.minimum, params.branches.maximum ),
                depth: 0,
                position: new THREE.Vector3(),
                length: { stalk: params.stalk.length, joint: 0, leaf: 0 },
                taper: { stalk: 1, joint: 1, leaf: 1 },
                tilt: { stalk: 0, joint: 0, leaf: 0 }
            } );
        }

        function Instance( geometry, material, count )
        {
            this.mesh = new THREE.InstancedMesh( geometry, material, count );
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
            this.mesh.frustumCulled = false;
            this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            this.mesh.geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( count * 3 ), 3 ) );
        }

        function plot( branch, args )
        {
            if ( args.depth === params.depth )
            var leaf  = new Create( "leaf",  leaves, args ).object;
            var stalk = new Create( "stalk", stalks, args ).object;
            var joint = new Create( "joint", joints, args ).object;

            var stalkRange = range( 0.5, params.stalk.taper );
            var stalkLength = args.length.stalk * stalkRange;
            var stalkTaper = args.taper.stalk * stalkRange;
            var stalkTilt = tilt( params.stalk.tilt );

            i++;

            split(
            {
                angle: ( center() + branch * circle ) / args.branches,
                branches: app.utils.random( params.branches.minimum, params.branches.maximum ),
                depth: args.depth + 1,
                position: new THREE.Vector3().copy( stalk.position ).add( new THREE.Vector3().copy( stalk.position ).sub( args.position ) ),
                length: { stalk: stalkLength, joint: 0, leaf: stalkLength * 2 },
                taper: { stalk: stalkTaper, joint: stalkTaper, leaf: args.taper.leaf * params.leaf.taper },
                tilt: { stalk: stalkTilt, joint: 0, leaf: stalkTilt }
            } );
        }

        function range( minimum, maximum )
        {
            return Math.random() * ( maximum - minimum ) + minimum;
        }

        function split( args )
        {
            if ( params.depth >= args.depth )
            {
                for ( let branch = 0; branch < args.branches; branch++ )
                {
                    plot( branch, args );
                }
            }
        }

        function tilt( object )
        {
            var variance = ( object.angle * object.variance ) / 100 * center();

            return circle * ( object.angle + variance ) / 360;
        }

        function update()
        {
            params.depth = Math.round( params.depth );
            params.branches.minimum = Math.round( params.branches.minimum );
            params.branches.maximum = Math.round( params.branches.maximum );
        }
    };
};