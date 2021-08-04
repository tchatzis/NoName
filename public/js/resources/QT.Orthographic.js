QT.Orthographic = function()
{
    var size = app.ui.ortho.getBoundingClientRect().height;

    var canvas = document.createElement( "canvas" );
        canvas.width = size;
        canvas.height = size;

    app.ui.ortho.appendChild( canvas );

    this.add = ( object, settings ) =>
    {
        var y = object.position.y;
        var half = Math.max( settings.size.x, settings.size.z ) / 2;
        var near = 0.1;
        var far = y + 1 + near;
        var camera = new THREE.OrthographicCamera( -half, half, half, -half, near, far );
            camera.position.set( 0, y + 1, 0 );
            camera.lookAt( object.position );
            camera.name = "2D";
        var scene = new THREE.Scene();
            scene.add( camera );
            scene.add( object );
        var renderer = new THREE.WebGLRenderer( { canvas: canvas } );
        var animate = () =>
        {
            renderer.render( scene, camera );
            requestAnimationFrame( animate )
        };

        animate();
    };
};