const Construct = function( args )
{
    this.group = new THREE.Object3D();
    
    this.init = function( scope )
    {
        Object.assign( this, scope );

        this.combine();
        this.group.add( this.mesh );
        this.stage.scene.add( this.group );
    };

    this.combine = function()
    {
        args.a.updateMatrix();
        args.b.updateMatrix();

        var bspA = CSG.fromMesh( args.a );
        var bspB = CSG.fromMesh( args.b );
        var bspC = bspA[ args.operation ]( bspB );

        var result = CSG.toMesh( bspC, args.a.matrix );
            result.name = args.name;
            result.geometry = new THREE.BufferGeometry().fromGeometry( result.geometry );
            result.material = args.a.material;
            result.castShadow  = result.receiveShadow = true;

        this.mesh = result;
    };

    this.update = function()
    {
        if ( this.controls.active.construct )
        {

        }
    };
};