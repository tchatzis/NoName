const mouse = function()
{
    var controls = new THREE.OrbitControls( this.stage.camera, this.stage.renderer.domElement );
        controls.ui = this.ui;
};