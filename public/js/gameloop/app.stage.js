const Stage = function()
{
    var scope = "stage";
    var app = this;
        app[ scope ] = {};
    
    // variables
    app[ scope ].world = 1000;
    app[ scope ].clearColor = new THREE.Color( 0, 0, 0 );

    var near = 0.1;
    var far = app[ scope ].world * 2;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;
    var shadow = far / 100;

    // lights
    app[ scope ].lights =
    {
        directional: new THREE.DirectionalLight( 0xffffff, 2 ),
        point: new THREE.PointLight( 0xffffee, 1, 10, 2 ),
        hemisphere: new THREE.HemisphereLight( 0xffffff, 0xFFFFE3, 0.5 ),
        ambient: new THREE.AmbientLight( 0xffffff, 0.2 )
    };

    // camera
    app[ scope ].camera = new THREE.PerspectiveCamera( 60, aspect, near, far );
    app[ scope ].camera.name = "camera";
    app[ scope ].camera.position.x = 0;
    app[ scope ].camera.position.y = 2;
    app[ scope ].camera.position.z = 5;
    app[ scope ].camera.layers.enable( 1 );
    app[ scope ].camera.add( app[ scope ].lights.point );

    app[ scope ].lights.directional.position.set( shadow, shadow, shadow );
    app[ scope ].lights.directional.castShadow = true;
    app[ scope ].lights.directional.shadow.camera.left = -shadow;
    app[ scope ].lights.directional.shadow.camera.right = shadow;
    app[ scope ].lights.directional.shadow.camera.top = shadow;
    app[ scope ].lights.directional.shadow.camera.bottom = -shadow;
    app[ scope ].lights.directional.shadow.mapSize.x = 2048;
    app[ scope ].lights.directional.shadow.mapSize.y = 2048;
    app[ scope ].lights.directional.shadow.camera.near = near;
    app[ scope ].lights.directional.shadow.camera.far = shadow * 3;
    app[ scope ].lights.directional.shadow.camera.visible = false;
    app[ scope ].lights.directional.shadow.bias = -0.0005;

    app[ scope ].lights.directional.name = "directional_light";
    app[ scope ].lights.point.name = "headlight";
    app[ scope ].lights.hemisphere.name = "hemisphere_light";
    app[ scope ].lights.ambient.name = "ambient_light";

    app[ scope ].lights[ "blue" ] = new THREE.PointLight();
    app[ scope ].lights[ "blue" ].name = "blue";
    app[ scope ].lights[ "blue" ].color = new THREE.Color( "blue" );
    app[ scope ].lights[ "blue" ].visible = false;
    app[ scope ].lights[ "blue" ].castShadows = true;
    app[ scope ].lights[ "blue" ].shadow.camera.far = app[ scope ].world;
    app[ scope ].lights[ "blue" ].shadow.camera.near = near;

    // renderer
    app[ scope ].renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
    app[ scope ].renderer.setClearColor( app[ scope ].clearColor, 1 );
    app[ scope ].renderer.setSize( width, height );
    app[ scope ].renderer.alpha = false;
    app[ scope ].renderer.autoClear = false;
    app[ scope ].renderer.antialias = true;
    app[ scope ].renderer.physicallyCorrectLights = true;
    app[ scope ].renderer.shadowMap.enabled = true;
    app[ scope ].renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    app[ scope ].renderer.shadowMap.autoUpdate = true;
    app[ scope ].renderer.logarithmicDepthBuffer = true;
    app[ scope ].renderer.premultipliedAlpha = true;
    app[ scope ].renderer.domElement.id = "renderer";
    app[ scope ].renderer.outputEncoding = THREE.GammaEncoding;
    app[ scope ].renderer.gammaFactor = 2.2;

    // props
    app[ scope ].props = new THREE.Group();
    app[ scope ].props.name = "props_group";
    // persistent
    app[ scope ].persistent = new THREE.Group();
    app[ scope ].persistent.name = "persistent_group";

    // scene
    app[ scope ].scene = new THREE.Scene();
    app[ scope ].scene.name = "scene";
    app[ scope ].scene.background = null;
    app[ scope ].scene.fog = new THREE.Fog( app[ scope ].clearColor, app[ scope ].world * 0.8, app[ scope ].world );
    app[ scope ].scene.add( app[ scope ].camera );
    app[ scope ].scene.add( app[ scope ].lights.directional );
    app[ scope ].scene.add( app[ scope ].lights.hemisphere );
    app[ scope ].scene.add( app[ scope ].lights.ambient );
    app[ scope ].scene.add( app[ scope ].lights[ "blue" ] );
    app[ scope ].scene.add( app[ scope ].props );
    app[ scope ].scene.add( app[ scope ].persistent );
    app[ scope ].scene.sunlight = app[ scope ].lights.directional;

    // helpers
    app.helpers.directional = new THREE.DirectionalLightHelper( app[ scope ].lights.directional, 5 );
    app.helpers.directional.name = "directional_helper";
    app.helpers.directional.visible = false;
    app.helpers.directional.castShadows = false;
    app[ scope ].scene.add( app.helpers.directional );
    app.helpers.shadow = new THREE.CameraHelper( app[ scope ].lights.directional.shadow.camera );
    app.helpers.shadow.name = "shadow_helper";
    app.helpers.shadow.visible = false;
    app[ scope ].scene.add( app.helpers.shadow );
    app.helpers.camera = new THREE.CameraHelper( app[ scope ].camera );
    app.helpers.camera.name = "camera_helper";
    app.helpers.camera.visible = false;
    app[ scope ].scene.add( app.helpers.camera );
    app.helpers.axes = new THREE.AxesHelper( 50 );
    app.helpers.axes.name = "axes_helper";
    app.helpers.axes.visible = false;
    app[ scope ].scene.add( app.helpers.axes );
    app.helpers.grid = new THREE.GridHelper( app[ scope ].world, app[ scope ].world );
    app.helpers.grid.name = "grid_helper";
    app.helpers.grid.visible = false;
    app[ scope ].scene.add( app.helpers.grid );
    app.helpers.polar = new THREE.PolarGridHelper( app[ scope ].world / 2 );
    app.helpers.polar.name = "polar_helper";
    app.helpers.polar.visible = false;
    app[ scope ].scene.add( app.helpers.polar );


    // for Three.js inspector console
    window.scene = app[ scope ].scene;
    document.body.appendChild( app[ scope ].renderer.domElement );
    app[ scope ].gl = app[ scope ].renderer.domElement.getContext( 'webgl' );
};