QT.MouseControls = function( type )
{
    var controls;
    
    switch ( type )
    {
        case "orbit":
            controls = new THREE.OrbitControls( this.stage.camera, this.stage.renderer.domElement );
            controls.ui = this.ui;
        break;
    }
};