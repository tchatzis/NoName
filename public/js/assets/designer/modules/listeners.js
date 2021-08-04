export const Listeners = function( scope )
{
    this.initialize = () =>
    {
        var canvas = app.stage.renderer.domElement;
            canvas.addEventListener( 'mousemove', scope.mouse.move, false );
            canvas.addEventListener( 'mousedown', scope.mouse.down, false );
            canvas.addEventListener( 'mouseup', scope.mouse.up, false );
    }
};