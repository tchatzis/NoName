export const Mouse = function( scope )
{
    var mouse = this;
        mouse.enabled = true;

    this.direction = new THREE.Vector3( 1, 0, 1 );

    this.down = () => mouse.enabled = false;
    
    this.move = ( event ) =>
    {
        var renderer = app.stage.renderer;
        var enabled = event.target.tagName == "CANVAS" && mouse.enabled;

        if ( enabled )
        {
            this.x =  ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
            this.y = -( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

            scope.raycaster.update();
        }
    };

    this.up = () => mouse.enabled = true;
};