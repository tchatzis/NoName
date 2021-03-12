var options =
{
    beach:   { ext: "png" },
    clouds:  { ext: "png" },
    earth:   { ext: "png" },
    eclipse: { ext: "png" },
    galaxy:  { ext: "png" },
    moon:    { ext: "png" },
    nebula:  { ext: "png" },
    piazza:  { ext: "jpg" },
    planets: { ext: "png" },
    sky:     { ext: "png" },
    test:    { ext: "png" }
};

var prop = function( name )
{
    this.props[ name ] = new this.presets.Group( { name: name, parent: this.stage.persistent } );
    this.props[ name ].group.userData = { type: "background" };
    this.props[ name ].submenu = function( option, key )
    {
        option.name = key;

        const args =
        {
            src: this.url + `images/env/${ option.name }/`,
            ext: option.ext
        };

        let files = [];
        let array = [ 'xp', 'xn', 'yp', 'yn', 'zp', 'zn' ];
            array.forEach( ( side ) =>
            {
                files.push( side + "." + args.ext );
            } );

        let cubemap = new THREE.CubeTextureLoader().setPath( args.src ).load( files );
            cubemap.name = name;
            cubemap.format = THREE.RGBFormat;

        this.stage.scene.background = cubemap;

        return cubemap;
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };