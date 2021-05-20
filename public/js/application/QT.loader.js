( function()
{
    var index = 0;
    var head = window.document.head;
    var debug = false;
    var dependencies =
    [
        /** css */
        { type: 'css', directory: '', name: 'main' },
        { type: 'css', directory: '', name: 'ui' },
        { type: 'css', directory: '', name: 'ui.svg' },
        { type: 'css', directory: '', name: 'form' },
        { type: 'css', directory: '', name: 'navigation' },
        { type: 'css', directory: '', name: 'table' },
        { type: 'css', directory: '', name: 'firebase-ui-auth' },
        { type: 'css', directory: '', name: 'prism' },
        /** set the class */
        { type: 'js', directory: 'application', name: 'QT' },
        /** external libraries */
        //{ type: 'js', directory: 'lib', name: 'ammo' },
        //{ type: 'js', directory: 'lib', name: 'data.gui' },
        { type: 'js', directory: 'lib', name: 'three' },
        { type: 'js', directory: 'lib', name: 'BufferGeometryUtils' },
        //{ type: 'js', directory: 'lib', name: 'csg' },
        //{ type: 'js', directory: 'lib', name: 'ImprovedNoise' },

        { type: 'js', directory: 'lib', name: 'OrbitControls' },
        //{ type: 'js', directory: 'lib', name: 'oimo' },
        //{ type: 'js', directory: 'lib', name: 'TexGen' },
        //{ type: 'js', directory: 'lib', name: 'MarchingCubes' },
        { type: 'js', directory: 'lib', name: 'firebase-app' },
        { type: 'js', directory: 'lib', name: 'firebase-auth' },
        { type: 'js', directory: 'lib', name: 'firebase-ui-auth' },
        { type: 'js', directory: 'lib', name: 'firebase-firestore' },
        { type: 'js', directory: 'lib', name: 'prism' },
        { type: 'js', directory: 'lib', name: 'prism.plugin.src' },
        /** application initialize */

        { type: 'js', directory: 'application', name: 'QT.init' },
        { type: 'js', directory: 'application', name: 'QT.LoadFonts' },
        { type: 'js', directory: 'application', name: 'QT.LoadTextures' },
        /** user interface / input */
        //{ type: 'js', directory: 'ui', name: 'app.data.forms', module: true },
        //{ type: 'js', directory: 'ui', name: 'app.ui' },
        //{ type: 'js', directory: 'ui', name: 'app.ui.forms' },
        { type: 'js', directory: 'ui', name: 'QT.GamePad' },
        { type: 'js', directory: 'ui', name: 'QT.GamePad.Camera' },
        { type: 'js', directory: 'ui', name: 'app.widgets' },
        { type: 'js', directory: 'ui', name: 'QT.MouseControls' },
        { type: 'js', directory: 'ui', name: 'app.navigation' },
        { type: 'js', directory: 'ui', name: 'app.navigation.data' },
        /** game loop */
        { type: 'js', directory: 'gameloop', name: 'app.stage' },
        { type: 'js', directory: 'gameloop', name: 'app.postprocessing' },
        { type: 'js', directory: 'gameloop', name: 'app.animate' },
        /** enhance */
        //{ type: 'js', directory: 'enhance', name: 'app.ammo' },
        /*{ type: 'js', directory: 'enhance', name: 'app.audio' },
        { type: 'js', directory: 'enhance', name: 'app.fractal' },
        { type: 'js', directory: 'enhance', name: 'app.lipstick' },
        { type: 'js', directory: 'enhance', name: 'app.listeners' },
        { type: 'js', directory: 'enhance', name: 'app.path' },        
        { type: 'js', directory: 'enhance', name: 'app.path.organic' },
        { type: 'js', directory: 'enhance', name: 'app.path.param' },
        { type: 'js', directory: 'enhance', name: 'app.path.plot' },*/
        //{ type: 'js', directory: 'enhance', name: 'app.oimo' },
        /*{ type: 'js', directory: 'enhance', name: 'app.raycaster' },
        { type: 'js', directory: 'enhance', name: 'app.shaders' },
        { type: 'js', directory: 'enhance', name: 'app.trajectory' },*/
        /** assets */
        { type: 'js', directory: 'assets/forms', name: 'QT.forms' },
        /*{ type: 'js', directory: 'assets/analyser', name: 'app.props.analyser' },
        { type: 'js', directory: 'assets/bend', name: 'app.props.bend' },
        { type: 'js', directory: 'assets/blob', name: 'app.props.blob' },
        { type: 'js', directory: 'assets/cameralayers', name: 'app.props.cameralayers' },
        { type: 'js', directory: 'assets/city', name: 'app.props.city' },
        { type: 'js', directory: 'assets/designer', name: 'app.props.designer' },
        { type: 'js', directory: 'assets/physics', name: 'app.props.drop' },
        { type: 'js', directory: 'assets/emitter', name: 'app.props.emitter' },
        { type: 'js', directory: 'assets/exploder', name: 'app.props.exploder' },
        { type: 'js', directory: 'assets/forcefield', name: 'app.props.forcefield' },
        { type: 'js', directory: 'assets/fractals', name: 'app.props.trees' },
        { type: 'js', directory: 'assets/fractals', name: 'app.props.mandlebulb' },
        { type: 'js', directory: 'assets/geometry', name: 'app.props.geometry' },
        { type: 'js', directory: 'assets/grid', name: 'app.props.grid' },
        { type: 'js', directory: 'assets/grid', name: 'app.props.grid.cube' },
        { type: 'js', directory: 'assets/grid', name: 'app.props.grid.surface' },
        { type: 'js', directory: 'assets/grid', name: 'app.props.grid.html' },
        { type: 'js', directory: 'assets/hose', name: 'app.props.hose' },
        { type: 'js', directory: 'assets/hollow', name: 'app.props.hollow' },
        { type: 'js', directory: 'assets/infinite', name: 'app.props.infinite' },
        { type: 'js', directory: 'assets/lightning', name: 'app.props.lightning' },
        { type: 'js', directory: 'assets/marchingcube', name: 'app.props.marchingcube' },
        { type: 'js', directory: 'assets/marquee', name: 'app.props.marquee' },
        { type: 'js', directory: 'assets/maze', name: 'app.props.maze' },
        { type: 'js', directory: 'assets/organic', name: 'app.props.organic' },
        { type: 'js', directory: 'assets/pacman', name: 'app.props.pacman' },
        { type: 'js', directory: 'assets/planets', name: 'app.props.planets' },
        { type: 'js', directory: 'assets/polygons', name: 'app.props.polygons' },
        { type: 'js', directory: 'assets/pyramid', name: 'app.props.pyramid' },
        { type: 'js', directory: 'assets/shapes', name: 'app.props.shapes' },
        { type: 'js', directory: 'assets/sky', name: 'app.props.sky' },
        { type: 'js', directory: 'assets/stonehenge', name: 'app.props.stonehenge' },
        { type: 'js', directory: 'assets/structure', name: 'app.props.structure' },*/
        { type: 'js', directory: 'assets/text', name: 'app.props.text' },
        /*{ type: 'js', directory: 'assets/toxicpool', name: 'app.props.toxicpool' },
        { type: 'js', directory: 'assets/vortex', name: 'app.props.vortex' },
        { type: 'js', directory: 'assets/voxels', name: 'app.props.voxels' },*/
        /** resources */
        // data
        /*{ type: 'js', directory: 'resources/data', name: 'app.blocks' },
        { type: 'js', directory: 'resources/data', name: 'app.characters' },
        { type: 'js', directory: 'resources/data', name: 'app.sprites' },
        { type: 'js', directory: 'resources/data', name: 'app.sounds' },*/
        // classes
        /*{ type: 'js', directory: 'resources', name: 'app.bender' },
        { type: 'js', directory: 'resources', name: 'app.csg' },*/
        { type: 'js', directory: 'resources', name: 'QT.Getters' },
        { type: 'js', directory: 'resources', name: 'QT.Setters' },
        /*{ type: 'js', directory: 'resources', name: 'app.disruptors' },
        { type: 'js', directory: 'resources', name: 'app.draw' },
        { type: 'js', directory: 'resources', name: 'app.input' },
        { type: 'js', directory: 'resources', name: 'app.instanced' },
        { type: 'js', directory: 'resources', name: 'app.loop' },*/
        { type: 'js', directory: 'resources', name: 'QT.Methods' },
        /*{ type: 'js', directory: 'resources', name: 'app.morph' },
        { type: 'js', directory: 'resources', name: 'app.music' },
        { type: 'js', directory: 'resources', name: 'app.patterns' },
        { type: 'js', directory: 'resources', name: 'app.persistent' },*/
        { type: 'js', directory: 'resources', name: 'QT.Presets' },
        //{ type: 'js', directory: 'resources', name: 'app.reader' },
        { type: 'js', directory: 'resources', name: 'QT.Record' },
        { type: 'js', directory: 'resources', name: 'QT.Samples' },
        /*{ type: 'js', directory: 'resources', name: 'app.scanner' },
        { type: 'js', directory: 'resources', name: 'app.scenes' },
        { type: 'js', directory: 'resources', name: 'app.vertexcolors' },
        { type: 'js', directory: 'resources', name: 'app.range' },
        { type: 'js', directory: 'resources', name: 'app.textures' },*/
        //{ type: 'js', directory: 'resources', name: 'app.utils' },
        //sprites
        //{ type: 'js', directory: 'resources/sprites', name: 'sprites.load' },
        //{ type: 'js', directory: 'resources/sprites', name: 'sprites.offscreen' },
        // shaders
        { type: 'js', directory: 'shaders/prebuilt', name: 'sky' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'ocean' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'CopyShader' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'FXAAShader' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'DigitalGlitch' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'ConvolutionShader' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'LuminosityHighPassShader' },
        { type: 'js', directory: 'shaders/prebuilt', name: 'VignetteShader' },
        /** postprocessing */
        { type: 'js', directory: 'postprocessing', name: 'Pass' },
        { type: 'js', directory: 'postprocessing', name: 'EffectComposer' },
        { type: 'js', directory: 'postprocessing', name: 'ShaderPass' },
        { type: 'js', directory: 'postprocessing', name: 'RenderPass' },
        { type: 'js', directory: 'postprocessing', name: 'MaskPass' },
        { type: 'js', directory: 'postprocessing', name: 'GlitchPass' },
        { type: 'js', directory: 'postprocessing', name: 'OutlinePass' },
        { type: 'js', directory: 'postprocessing', name: 'BloomPass' },
        { type: 'js', directory: 'postprocessing', name: 'UnrealBloomPass' }
    ];

    var load = function()
    {
        var d = dependencies[ index ];
        var tag;
        var directory = !d.directory ? "" : d.directory + "/";
        var url = d.hasOwnProperty( "src" ) ? d.src : d.hasOwnProperty( "directory" ) ? d.type + "/" + directory + d.name + "." + d.type : d.type + "/" + d.name + "." + d.type;

        switch( d.type )
        {
            case "js":
                tag = document.createElement( "script" );
                tag.src = url;
                tag.type = d.hasOwnProperty( "module" ) ? "module" : "text/javascript";
            break;

            case "module":
                tag = document.createElement( "script" );
                tag.src = url;
                tag.type = d.hasOwnProperty( "module" ) ? "module" : "text/javascript";
            break;

            case "css":
                tag = document.createElement( "link" );
                tag.type = "text/css";
                tag.rel = "stylesheet";
                tag.href = url;
            break;
        }

        head.appendChild( tag );

        tag.onload = function( e )
        {
            index++;

            var detail = { detail: { value: index / dependencies.length, name: `${ ( d.name || d.src ) }.${ d.type } ( ${ index } / ${ dependencies.length } )` } };
            var progress = new CustomEvent( 'scripts_progress', detail );
            window.dispatchEvent( progress );

            if ( index < dependencies.length )
            {
                if ( debug ) console.info( index, e.timeStamp, dependencies[ index ] );
                load();
            }
            else
            {
                var event = new Event( 'scripts_loaded' );
                window.dispatchEvent( event );
            }
        };
    };

    load();
} )();