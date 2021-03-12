const LoadTextures = function( args )
{
    var app = this;
    var count = 0;
    var success = function( image, type )
    {
        var src = image.src.split( "/" );
        var last = src.length - 1;
        var name = src[ last ];
            name = name.split( "." );
            name = name[ 0 ];

        var texture = new THREE.TextureLoader().load( image.src );
            texture.name = name;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.needsUpdate = true;

        app.assets[ type ][ name ] =
        {
            name: name,
            texture: texture,
            image: image
        };

        count++;
        progress.update( { label: name, value: count } );

        var event = new CustomEvent( "progress_texture", { detail: { type: "texture", label: src[ last ], value: count / files.length, limit: files.length } } );
        document.dispatchEvent( event );

        if ( count === files.length )
        {
            let event = new Event( "textures_loaded" );
            document.dispatchEvent( event );
        }

    }.bind( this );

    var loader = new THREE.ImageLoader();
    var images =
    {
        displacements: [ "bump_map_0.jpg", "bump_map_1.jpg", "bump_map_2.jpg", "bump_map_3.png", "bump_map_4.jpg", "bump_map_5.jpg", "bump_map_6.jpg",
            "bump_map_7.jpg", "bump_map_8.jpg", "hexagons.jpg", "lightning.jpg", "mosaic.jpg", "stained_glass.jpg" ],
        textures: [ "aliens.jpg", "blue.jpg", "circles.png", "city.jpg", "diamond.jpg", "earthly.jpg", "floral.jpg", "flowers.jpg", "graph.jpg", "green_1.jpg",
            "green_2.jpg", "green_3.jpg", "green_4.jpg", "green_5.jpg", "green_6.jpg", "hexagons.jpg", "jupiter.png", "kaleido.jpg", "lightning.jpg", "maze.png", "mosaic.jpg",
            "particle_1.jpg", "particle_2.png", "perlin-512.png", "mars.jpg", "qbert.png", "radial.jpg", "saturn.jpg", "sphere.png", "stained_glass.jpg", "star.png", "surface_1.png",
            "surface_2.png", "surface_3.png", "swirls.jpg", "uv.jpg", "Water_1_M_Normal.jpg", "Water_2_M_Normal.jpg", "waternormals.jpg", "water_planet.png" ]
    };

    Object.keys( images ).forEach( ( type, index ) =>
    {
        images[ type ].forEach( file =>
        {
            loader.load( app.url + args.directory + file, ( file ) => success( file, type ) );
        } );
    } );

    var files = images.displacements.concat( images.textures );
    var progress = new this.utils.Progress( { value: 0, limit: files.length } );
};