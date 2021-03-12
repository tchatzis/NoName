var options = {};

var prop = function( name )
{
    const texture =
    {
        name: name,
        map: new this.textures.Text(
            {
                name: name,
                debug: false,
                width: 512,
                height: 256,
                text: "text background",
                stroke: "1px",
                background: "black",
                color: "#666",
                size: 20,
                font: ""
            } ).texture,
        offset:   { animate: true, value: new THREE.Vector2( 0, 0.01 ) },
        rotation: { animate: true, value: 0.01 },
        center:   { value: new THREE.Vector2( 0.5, 0.5 ) },
        repeat:   { value: new THREE.Vector2( 2, 4 ) }
    };

    const cube =
    {
        name: name,
        parent: this.stage.persistent,
        color: new THREE.Color( 1, 1, 1 )
    };

    this.stage.scene.background = null;

    this.props[ name ] = new this.presets.Environment( cube );
    this.props[ name ].texture( texture );

    return this.props[ name ];
};

export { prop, options };