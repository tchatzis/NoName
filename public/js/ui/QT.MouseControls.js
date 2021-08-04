QT.MouseControls = function( type )
{
    this.controls = {};

    switch ( type )
    {
        case "orbit":
            this.controls.perspective = new THREE.OrbitControls( this.stage.perspective, this.stage.renderer.domElement );
            this.controls.ui = this.ui;
        break;
    }
};