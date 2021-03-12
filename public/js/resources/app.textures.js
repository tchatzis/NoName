const Textures = function()
{
    var scope = "textures";
    var app = this;
        app[ scope ] = {};

    app[ scope ].Canvas = function( args )
    {
        var label;
        var canvas = document.getElementById( args.name + "_canvas" ) || document.createElement( 'canvas' );
            canvas.id = args.name + "_canvas";
            canvas.width = args.width || 128;
            canvas.height = args.height || 128;
        if ( args.debug )
        {
            label = document.getElementById( args.name ) || document.createElement( 'div' );
            label.id = args.name;
            label.classList.add( "label" );
            label.innerText = args.name;
            label.setAttribute( "data-canvas-debug", args.name );
            //row = app.ui.row.call( app, { el: label, id: args.name, cl: "canvas", parent: document.getElementById( "container" ) } );

            canvas.classList.add( "canvas" );

            //row.el.appendChild( canvas );
            var hud = document.getElementById( "hud" );
                hud.appendChild( canvas );
                hud.classList.add( "expand" );
        }

        return canvas;
    };

    app[ scope ].CubeCamera = function( args )
    {
        this.texture = null;

        var options =
        {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        };

        var buffer = new THREE.WebGLCubeRenderTarget( args.resolution, options );
            buffer.name = args.name + "_buffer";
        this.texture = buffer.texture;

        var camera = new THREE.CubeCamera( args.near, args.far, buffer );
            camera.name = args.name;

        var material = new THREE.MeshBasicMaterial( {
            envMap: buffer.texture,
            color: args.color || new THREE.Color( 0xFFFFFF )
        } );

        var target = args.target;
            target.material = material;

        var update = function( target )
        {
            try
            {
                target.visible = false;
                target.material.envMap = buffer.texture;
                camera.position.copy( target.position );
                app.stage.renderer.clear();
                camera.update( app.stage.renderer, app.stage.scene );
                target.visible = true;
            }
            catch( error )
            {

            }
        };

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: target } );
    };

    app[ scope ].Playback = function( args )
    {
        var recordings = app.record.recordings;

        if ( !recordings.hasOwnProperty( args.recording ) )
        {
            var message = "no available recording";
            app.ui.debug.classList.add( "expand" );
            app.ui.debug.innerText = message;
            console.error( message );
            return;
        }

        var array = recordings[ args.recording ].frames;
        var length = array.length;
        var frame = 0;
        var loop = 0;
        var progress = new app.utils.Progress( { value: 0, limit: array.length } );
            progress.update( { label: "playing", value: 0 } );

        this.play = true;

        var preview = function()
        {
            app.kill( app.arrays.functions, args.name );

            if ( args.debug )
            {
                var array = app.recordings[ args.recording ].frames;
                var size = 120 + "px";

                array.forEach( ( canvas, frame ) =>
                {
                    canvas.style.width = size;
                    canvas.style.height = size;
                    canvas.title = frame;

                    app.ui.container.appendChild( canvas );
                } );
            }
        }.bind( this );

        var play = function()
        {
            if ( this.play )
            {
                if ( frame >= length )
                {
                    if ( args.loop && loop < args.loop )
                    {
                        frame = 0;
                        this.play = true;
                        play();
                        loop++;

                        return;
                    }

                    if ( args.onPlaybackComplete )
                    {
                        args.onPlaybackComplete();
                        this.play = false;
                        preview();
                    }
                    else
                    {
                        var event = new Event( "playback_finished" );
                        document.dispatchEvent( event );
                        this.play = false;
                        preview();
                    }

                    return;
                }

                if ( args.hud )
                {
                    app.ui.hud.innerHTML = null;
                    app.ui.hud.appendChild( array[ frame ] );
                }

                this.texture = new THREE.CanvasTexture( array[ frame ] );
                this.texture.name = `${ args.name }_${ frame }`;
                this.texture.textureNeedsUpdate = true;
                this.texture.encoding = THREE.LinearEncoding;

                if ( args.target )
                {
                    args.target.material.map = this.texture;
                    args.target.material.opacity = 1;
                    args.target.material.needsUpdate = true;
                }

                frame++;
                progress.update( { label: "playing", value: frame } );
            }

        }.bind( this );

        app.arrays.functions.push( { name: args.name, scope: this, function: play, args: null } );
    };
    
    app[ scope ].Quad = function( args )
    {
        var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        var quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), args.material );

        var scene = new THREE.Scene();
            scene.name = args.name;
            scene.add( camera );
            scene.add( quad );
        
        var options =
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            alpha: false,
            depthBuffer: false,
            stencilBuffer: false
        };

        var buffer = new THREE.WebGLRenderTarget( args.width, args.height, options );
            buffer.name = args.name + "_buffer";

        var update = function()
        {
            app.stage.renderer.setRenderTarget( buffer );
            app.stage.renderer.clear();
            app.stage.renderer.render( scene, camera );
            app.stage.renderer.setRenderTarget( null );
        };

        if ( !args.static )
            app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
        
        this.mesh = quad;
        this.scene = scene;
        this.texture = buffer.texture;
    };
    
    app[ scope ].Reflect = function( args )
    {
        var parameters =
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat
        };

        var reflectorWorldPosition = new THREE.Vector3();
        var cameraWorldPosition = new THREE.Vector3();
        var normal = new THREE.Vector3();
        var view = new THREE.Vector3();
        var lookAtPosition = new THREE.Vector3();
        var focus = new THREE.Vector3();
        var rotationMatrix = new THREE.Matrix4();
        var renderTarget = new THREE.WebGLRenderTarget( args.textureWidth, args.textureHeight, parameters );
        var textureMatrix = new THREE.Matrix4();
        var virtualCamera = new THREE.PerspectiveCamera();
        var reflectorPlane = new THREE.Plane();
        var clipPlane = new THREE.Vector4();
        var q = new THREE.Vector4();

        this.onBeforeRender = function( renderer, scene, camera )
        {
            reflectorWorldPosition.setFromMatrixPosition( this.matrixWorld );
            cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

            rotationMatrix.extractRotation( this.matrixWorld );

            normal.set( 0, 0, 1 );
            normal.applyMatrix4( rotationMatrix );

            view.subVectors( reflectorWorldPosition, cameraWorldPosition );
            view.reflect( normal ).negate();
            view.add( reflectorWorldPosition );

            rotationMatrix.extractRotation( camera.matrixWorld );

            lookAtPosition.set( 0, 0, -1 );
            lookAtPosition.applyMatrix4( rotationMatrix );
            lookAtPosition.add( cameraWorldPosition );

            focus.subVectors( reflectorWorldPosition, lookAtPosition );
            focus.reflect( normal ).negate();
            focus.add( reflectorWorldPosition );

            virtualCamera.position.copy( view );
            virtualCamera.up.set( 0, 1, 0 );
            virtualCamera.up.applyMatrix4( rotationMatrix );
            virtualCamera.up.reflect( normal );
            virtualCamera.lookAt( focus );
            virtualCamera.far = camera.far;
            virtualCamera.updateMatrixWorld();
            virtualCamera.projectionMatrix.copy( camera.projectionMatrix );

            textureMatrix.set(
                0.5, 0.0, 0.0, 0.5,
                0.0, 0.5, 0.0, 0.5,
                0.0, 0.0, 0.5, 0.5,
                0.0, 0.0, 0.0, 1.0 );
            textureMatrix.multiply( virtualCamera.projectionMatrix );
            textureMatrix.multiply( virtualCamera.matrixWorldInverse );
            textureMatrix.multiply( this.matrixWorld );

            reflectorPlane.setFromNormalAndCoplanarPoint( normal, reflectorWorldPosition );
            reflectorPlane.applyMatrix4( virtualCamera.matrixWorldInverse );

            clipPlane.set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant );

            var projectionMatrix = virtualCamera.projectionMatrix;

            q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = -1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

            projectionMatrix.elements[ 2 ] = clipPlane.x;
            projectionMatrix.elements[ 6 ] = clipPlane.y;
            projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - args.clipBias;
            projectionMatrix.elements[ 14 ] = clipPlane.w;

            renderTarget.texture.encoding = renderer.outputEncoding;

            this.visible = false;

            var currentRenderTarget = renderer.getRenderTarget();
            var currentXrEnabled = renderer.xr.enabled;
            var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
            var viewport = camera.viewport;

            renderer.xr.enabled = false; // Avoid camera modification
            renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
            renderer.setRenderTarget( renderTarget );
            renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897
            if ( renderer.autoClear === false ) renderer.clear();
            renderer.render( scene, virtualCamera );
            renderer.xr.enabled = currentXrEnabled;
            renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
            renderer.setRenderTarget( currentRenderTarget );
            if ( viewport !== undefined ) renderer.state.viewport( viewport );

            this.visible = true;
            this.material.uniforms[ "tDiffuse" ].value = renderTarget.texture;
            this.material.uniforms[ "textureMatrix" ].value = textureMatrix;
        };

        this.getRenderTarget = function()
        {
            return renderTarget;
        };

        return this;
    };

    app[ scope ].RenderTarget = function( args )
    {
        var scene = new THREE.Scene();
            scene.name = args.name;
            scene.add( app.stage.lights.directional.clone() );
            scene.add( app.stage.lights.hemisphere.clone() );
            scene.add( app.stage.lights.ambient.clone() );
            scene.add( args.camera );
        
        var promise = app.scenes.load( args.scene );
            promise.then( ( module ) => module.group.call( app, args.scene, scene ) );
        
        var options =
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat,
            alpha: false,
            depthBuffer: false,
            stencilBuffer: false
        };
        
        var buffer = new THREE.WebGLRenderTarget( args.width, args.height, options );
            buffer.name = args.name + "_buffer";
        
        args.target.material.map = buffer.texture;
        args.camera.position.copy( args.position );

        var update = function()
        {
            app.stage.renderer.setRenderTarget( buffer );
            app.stage.renderer.clear();
            app.stage.renderer.render( scene, args.camera );
            app.stage.renderer.setRenderTarget( null );
        };

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );        
        
        this.scene = scene;
        this.texture = buffer.texture;
    };   
    
    app[ scope ].Sprite = function( args )
    {
        var canvas = new app[ scope ].Canvas( args );
        var context = canvas.getContext( '2d' );
            context.globalAlpha = args.alpha;
            context.fillStyle = "black";

        var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
        args.stops.forEach( ( stop ) =>
        {
            gradient.addColorStop( ...stop );
        } );

        context.clearRect( 0, 0, canvas.width, canvas.height );
        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );

        var texture = new THREE.CanvasTexture( canvas );
            texture.anisotropy = 0;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;

        var material = new THREE.SpriteMaterial();
            material.map = texture;
            material.transparent = true;
            material.alphaTest = 0.01;
            material.depthFunc = THREE.LessEqualDepth;
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            material.blendSrc = THREE.SrcAlphaFactor;
            material.blendDst = THREE.DstAlphaFactor;

        var sprite = new THREE.Sprite( material );

        var exists = app.assets.sprites.hasOwnProperty( args.name );

        if ( !exists )
        {
            app.assets.sprites[ args.name ] = { texture: texture, material: material, sprite: sprite };
        }

        this.texture = texture;
        this.material = material;
        this.sprite = sprite;
    };

    app[ scope ].Text = function( args )
    {
        var canvas = new app[ scope ].Canvas( args );
        var context = canvas.getContext( '2d' );
            context.globalAlpha = args.alpha || 1;
            context.clearRect( 0, 0, canvas.width, canvas.height );
            context.fillStyle = args.background || "black";
            context.fillRect( 0, 0, canvas.width, canvas.height );
            context.textAlign = args.align || "center";
            context.textBaseline = args.vertical || "middle";
            context.font = args.font || `${ args.size || 30 }px ${ args.font|| "Arial" }`;

        if ( args.stroke )
        {
            context.strokeStyle  = args.color || "white";
            context.strokeText( args.text, args.left || canvas.width / 2, args.top || canvas.height / 2 );
        }
        else
        {
            context.fillStyle = args.color || "white";
            context.fillText( args.text, args.left || canvas.width / 2, args.top || canvas.height / 2 );
        }

        var texture = new THREE.CanvasTexture( canvas );
            texture.anisotropy = 0;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.needsUpdate = true;

        this.texture = texture;
    };

    app[ scope ].Video = function( args )
    {
        var video = document.createElement( "video" );
            video.autoplay = true;
            video.src = args.src;
            video.setAttribute( "muted", true );
            if( args.loop ) video.setAttribute( "loop", args.loop );

        app.arrays.videos.push( video );

        var texture = new THREE.VideoTexture( video );
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;

        this.texture = texture;
    }
};