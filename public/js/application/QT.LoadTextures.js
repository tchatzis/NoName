QT.LoadTextures = function()
{
    var scope = this;
    var count = 0;
    var loader = new THREE.TextureLoader();
    var images =
    {
        displacements: [ "bump_map_0.jpg", "bump_map_1.jpg", "bump_map_2.jpg", "bump_map_3.png", "bump_map_4.jpg", "bump_map_5.jpg", "bump_map_6.jpg",
            "bump_map_7.jpg", "bump_map_8.jpg", "hexagons.jpg", "lightning.jpg", "mosaic.jpg", "stained_glass.jpg" ],
        textures: [ "aliens.jpg", "blue.jpg", "circles.png", "city.jpg", "diamond.jpg", "earthly.jpg", "floral.jpg", "flowers.jpg", "graph.jpg", "green_1.jpg",
            "green_2.jpg", "green_3.jpg", "green_4.jpg", "green_5.jpg", "green_6.jpg", "hexagons.jpg", "jupiter.png", "kaleido.jpg", "lightning.jpg", "maze.png", "mosaic.jpg",
            "particle_1.jpg", "particle_2.png", "perlin-512.png", "mars.jpg", "qbert.png", "radial.jpg", "saturn.jpg", "sphere.png", "stained_glass.jpg", "star.png", "surface_1.png",
            "surface_2.png", "surface_3.png", "swirls.jpg", "uv.jpg", "Water_1_M_Normal.jpg", "Water_2_M_Normal.jpg", "waternormals.jpg", "water_planet.png" ]
    };
    var files = images.displacements.concat( images.textures );
    var progress = new scope.utils.Progress( { value: 0, limit: files.length } );

    Object.keys( images ).forEach( ( type, index ) =>
    {
        images[ type ].forEach( file =>
        {
            loader.load( scope.config.url + "/images/textures/" + file, ( file ) => success( file, type ) );
        } );
    } );

    function success( texture, type )
    {
        var src = texture.image.src.split( "/" );
        var last = src.length - 1;
        var name = src[ last ];
            name = name.split( "." );
            name = name[ 0 ];

            texture.name = name;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.needsUpdate = true;

        scope.data.assets[ type ][ name ] =
        {
            name: name,
            texture: texture,
            image: texture.image
        };

        count++;
        progress.update( { label: name, value: count } );

        if ( count === files.length )
        {
            let event = new Event( "textures_loaded" );
            window.dispatchEvent( event );
        }
    }
};