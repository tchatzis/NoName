const Surface = function( args )
{
    const position = function( axis, index )
    {
        var cols = args.cols / 2;
        var rows = args.rows / 2;

        var offset =
        {
            x: args.size / 2,
            y: args.size / 2
        };

        var position =
        {
            x: ( index - cols ) * args.size + offset[ axis ],
            y: ( index - rows ) * args.size + offset[ axis ]
        };

        return position[ axis ];
    };
    
    const create = function()
    {
        var texture = new THREE.Texture( args.image );
            texture.needsUpdate = true;
        var geometry = new THREE.PlaneGeometry( args.size, args.size, 1, 1 );
        var material = new THREE.MeshStandardMaterial();
            material.transparent = true;
            material.opacity = 1;
            material.map = texture;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
            material.envMap = args.envMap;
        var mesh = new THREE.Mesh( geometry, material );
            mesh.receiveShadows = true;

        return mesh;
    };    
    
    this.init = function()
    {
        var plane = create();
            plane.name = args.name;
            plane.userData =
            {
                row: args.data.row,
                col: args.data.col
            };
            plane.position.x = position( "x", args.data.col );
            plane.position.y = position( "y", args.rows - args.data.row - 1 );

        this.group = plane;
    };
};