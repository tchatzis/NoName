QT.Stage = function()
{
    var scope = this;
    var near = 0.1;
    var far = 2000;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;
    var shadow = far / 100;

    // variables
    scope.world = far / 2;
    scope.clearColor = new THREE.Color( 0, 0, 0 );

    // lights
    scope.lights =
    {
        directional: new THREE.DirectionalLight( 0xffffff, 2 ),
        point: new THREE.PointLight( 0xffffee, 1, 10, 2 ),
        hemisphere: new THREE.HemisphereLight( 0xffffff, 0xFFFFE3, 0.5 ),
        ambient: new THREE.AmbientLight( 0xffffff, 0.2 )
    };

    // camera
    scope.camera = new THREE.PerspectiveCamera( 60, aspect, near, far );
    scope.camera.name = "camera";
    scope.camera.position.x = 0;
    scope.camera.position.y = 1.5;
    scope.camera.position.z = 20;
    scope.camera.layers.enable( 1 );
    scope.camera.add( scope.lights.point );

    scope.lights.directional.position.set( shadow, shadow, shadow );
    scope.lights.directional.castShadow = true;
    scope.lights.directional.shadow.camera.left = -shadow;
    scope.lights.directional.shadow.camera.right = shadow;
    scope.lights.directional.shadow.camera.top = shadow;
    scope.lights.directional.shadow.camera.bottom = -shadow;
    scope.lights.directional.shadow.mapSize.x = 2048;
    scope.lights.directional.shadow.mapSize.y = 2048;
    scope.lights.directional.shadow.camera.near = near;
    scope.lights.directional.shadow.camera.far = shadow * 3;
    scope.lights.directional.shadow.camera.visible = false;
    scope.lights.directional.shadow.bias = -0.0005;

    scope.lights.directional.name = "directional_light";
    scope.lights.point.name = "headlight";
    scope.lights.hemisphere.name = "hemisphere_light";
    scope.lights.ambient.name = "ambient_light";

    scope.lights[ "blue" ] = new THREE.PointLight();
    scope.lights[ "blue" ].name = "blue";
    scope.lights[ "blue" ].color = new THREE.Color( "blue" );
    scope.lights[ "blue" ].visible = false;
    scope.lights[ "blue" ].castShadows = true;
    scope.lights[ "blue" ].shadow.camera.far = scope.world;
    scope.lights[ "blue" ].shadow.camera.near = near;

    // renderer
    scope.renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: true } );
    scope.renderer.setClearColor( scope.clearColor, 1 );
    scope.renderer.setSize( width, height );
    scope.renderer.alpha = false;
    scope.renderer.autoClear = false;
    scope.renderer.antialias = true;
    scope.renderer.physicallyCorrectLights = true;
    scope.renderer.shadowMap.enabled = true;
    scope.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scope.renderer.shadowMap.autoUpdate = true;
    scope.renderer.logarithmicDepthBuffer = true;
    scope.renderer.premultipliedAlpha = true;
    scope.renderer.domElement.id = "renderer";
    scope.renderer.outputEncoding = THREE.GammaEncoding;
    scope.renderer.gammaFactor = 2.2;

    // props
    scope.props = new THREE.Group();
    scope.props.name = "props_group";
    // persistent
    scope.persistent = new THREE.Group();
    scope.persistent.name = "persistent_group";

    // scene
    scope.scene = new THREE.Scene();
    scope.scene.name = "scene";
    scope.scene.background = null;
    scope.scene.fog = new THREE.Fog( scope.clearColor, scope.world * 0.8, scope.world );
    scope.scene.add( scope.camera );
    scope.scene.add( scope.lights.directional );
    scope.scene.add( scope.lights.hemisphere );
    scope.scene.add( scope.lights.ambient );
    scope.scene.add( scope.lights[ "blue" ] );
    scope.scene.add( scope.props );
    scope.scene.add( scope.persistent );
    scope.scene.sunlight = scope.lights.directional;

    // helpers
    scope.helpers = {};
    scope.helpers.directional = new THREE.DirectionalLightHelper( scope.lights.directional, 5 );
    scope.helpers.directional.name = "directional_helper";
    scope.helpers.directional.visible = false;
    scope.helpers.directional.castShadows = false;
    scope.scene.add( scope.helpers.directional );
    scope.helpers.shadow = new THREE.CameraHelper( scope.lights.directional.shadow.camera );
    scope.helpers.shadow.name = "shadow_helper";
    scope.helpers.shadow.visible = false;
    scope.scene.add( scope.helpers.shadow );
    scope.helpers.camera = new THREE.CameraHelper( scope.camera );
    scope.helpers.camera.name = "camera_helper";
    scope.helpers.camera.visible = false;
    scope.scene.add( scope.helpers.camera );
    scope.helpers.axes = new THREE.AxesHelper( 50 );
    scope.helpers.axes.name = "axes_helper";
    scope.helpers.axes.visible = false;
    scope.scene.add( scope.helpers.axes );
    scope.helpers.grid = new THREE.GridHelper( scope.world, scope.world );
    scope.helpers.grid.name = "grid_helper";
    scope.helpers.grid.visible = false;
    scope.scene.add( scope.helpers.grid );
    scope.helpers.polar = new THREE.PolarGridHelper( scope.world / 2 );
    scope.helpers.polar.name = "polar_helper";
    scope.helpers.polar.visible = false;
    scope.scene.add( scope.helpers.polar );

    document.body.appendChild( scope.renderer.domElement );
    scope.gl = scope.renderer.domElement.getContext( 'webgl' );
};