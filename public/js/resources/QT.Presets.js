QT.Presets = function()
{
    var scope = this;

    var rotate = function( mesh, rotation )
    {
        var r = rotation || new THREE.Vector3();
        var axes = [ "x", "y", "z" ];

        axes.forEach( a =>
        {
            mesh.rotation[ a ] = r[ a ];
        } );
    };

    var Group = function( args )
    {
        this.group = new THREE.Group();
        this.group.name = args.name;
        this.group.visible = args.visible;
    };
    
    scope.Beam = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.BoxGeometry( args.width, args.width, args.height, args.segments, args.segments, args.segments ), new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Cube = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.BoxGeometry( args.size, args.size, args.size, args.segments, args.segments, args.segments ), new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Cylinder = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.CylinderGeometry( args.radiusTop, args.radiusBottom, args.height, args.radialSegments, args.heightSegments, args.openEnded, args.thetaStart, args.thetaLength ), new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Dome = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.IcosahedronBufferGeometry( app.stage.world, 2 ), new THREE.MeshBasicMaterial() );
            mesh.name = args.name;
            mesh.receiveShadow = false;
            mesh.castShadow = false;
            mesh.material.color = args.color || new THREE.Color( 0x000000 );
            mesh.scale.set( -1, 1, 1 );
            mesh.rotation.order = 'XZY';
            mesh.renderDepth = 1000.0;
            mesh.material.transparent = true;

        var update = function()
        {
            mesh.position.copy( app.stage.camera.position );
        };

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );

        QT.Methods.call( this, app, mesh, THREE.BackSide );

        args.parent.add( this.group );
    };

    scope.Environment = function( args )
    {
        var far = app.stage.world * 2;

        app.stage.scene.fog.near = far;
        app.stage.scene.fog.far = far;

        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.BoxGeometry( app.stage.world, app.stage.world, app.stage.world ), new THREE.MeshBasicMaterial() );
            mesh.name = args.name;
            mesh.receiveShadow = false;
            mesh.castShadow = false;
            mesh.material.color = args.color || new THREE.Color( 0x000000 );
            mesh.scale.set( -1, 1, 1 );
            mesh.rotation.order = 'XZY';
            mesh.renderDepth = 1000;
            mesh.material.transparent = false;
            mesh.material.blending = THREE.AdditiveBlending;

        var update = function()
        {
            mesh.position.copy( app.stage.camera.position );
        };

        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );

        QT.Methods.call( this, app, mesh, THREE.BackSide );

        args.parent.add( this.group );
    };

    scope.Group = function( args )
    {
        Group.call( this, args );

        this.group.position.copy( args.position || new THREE.Vector3() );

        QT.Methods.call( this, app, {} );

        args.parent.add( this.group );
    };

    scope.Plane = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.PlaneGeometry( args.width, args.height, args.widthSegments, args.heightSegments ), new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.side = THREE.DoubleSide;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.wireframe = args.wireframe;
            mesh.material.transparent = true;

        if ( !args.vertical )
            mesh.rotateX( -Math.PI / 2 );

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Rounded = function( args )
    {
        Group.call( this, args );

        let eps = 0.00001;
        let radius = args.radius - eps;

        let shape = new THREE.Shape();
            shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
            shape.absarc( eps, args.height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
            shape.absarc( args.width - radius * 2, args.height -  radius * 2, eps, Math.PI / 2, 0, true );
            shape.absarc( args.width - radius * 2, eps, eps, 0, -Math.PI / 2, true );

        let geometry = new THREE.ExtrudeBufferGeometry( shape,
        {
            depth: args.depth - args.radius * 2,
            bevelEnabled: true,
            bevelSegments: args.smoothness * 2,
            steps: 1,
            bevelSize: radius,
            bevelThickness: args.radius,
            curveSegments: args.smoothness
        } );

        let copy = new THREE.Geometry().fromBufferGeometry( geometry );

        geometry.vertices = copy.vertices;
        geometry.center();
        geometry.computeVertexNormals();

        var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Solid = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.BoxGeometry( args.width, 0.01, args.height, args.widthSegments, 1, args.heightSegments ), new THREE.MeshStandardMaterial() );
        mesh.name = args.name;
        mesh.position.copy( args.position || new THREE.Vector3() );
        rotate( mesh, args.rotation );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
        mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh, args );

        args.parent.add( this.group );
    };

    scope.Sphere = function( args )
    {
        Group.call( this, args );

        var mesh = new THREE.Mesh( new THREE.SphereGeometry( args.radius, args.widthSegments, args.heightSegments, args.phiStart, args.phiLength, args.thetaStart, args.thetaLength ), new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Spline = function( args )
    {
        Group.call( this, args );

        var angle = 0;
        var array = [];
        var vector;
        var x, y;

        for ( var a = 0; a < args.segments; a++ )
        {
            angle = ( Math.PI * 2 ) * ( a / args.segments );
            x = Math.sin( angle );
            y = a;
            vector = new THREE.Vector2( x * args.amplitude * Math.random(), y * args.amplitude * Math.random() );
            array.push( vector );
        }

        var curve = new THREE.SplineCurve( array );
        var points = curve.getPoints( args.amplitude * 4 );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var material = new THREE.LineBasicMaterial();
            material.color = args.color || new THREE.Color( 0xFFFFFF );
        var line = new THREE.Line( geometry, material );

        QT.Methods.call( this, app, line );

        args.parent.add( this.group );
    };

    scope.Square = function( args )
    {
        Group.call( this, args );

        var square =
        [
            -1, -1,  0,
            1, -1,  0,
            1,  1,  0,

            1,  1,  0,
            -1,  1,  0,
            -1, -1,  0
        ];
        square = square.map( n => n * args.size || 1 );

        var geometry = new THREE.BufferGeometry();
            geometry.attributes.position = new THREE.Float32BufferAttribute( square, 3 );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
            mesh.name = args.name;
            mesh.position.copy( args.position || new THREE.Vector3() );
            rotate( mesh, args.rotation );
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.material.color = args.color || new THREE.Color( 0xFFFFFF );
            mesh.material.transparent = true;

        QT.Methods.call( this, app, mesh );

        args.parent.add( this.group );
    };

    scope.Tiles = function( args )
    {
        Group.call( this, args );

        args.count = Object.values( args.dimensions ).reduce( ( accumulator, value ) => accumulator * value );
        args.geometry = new THREE.BoxBufferGeometry( args.size.x - args.spacing, args.size.y, args.size.z - args.spacing, 1, 1, 1 );
        args.position = args.position || new THREE.Vector3();
        args.onInstancedComplete = ( instance ) =>
        {
            this.mesh = instance.mesh;
            this.group.add( instance.mesh );
            args.parent.add( this.group );
        };

        new Instanced( app, args );
    };
};