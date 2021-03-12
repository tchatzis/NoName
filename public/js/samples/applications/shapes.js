var options =
{
    cylinder:   { type: "cylinder" },
    knot:       { type: "knot" },
    offset:     { type: "offset" },
    power:      { type: "power" },
    sphere:     { type: "sphere" },
    torus:      { type: "torus" }
};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    const texture =
    {
        name: name,
        map: this.assets.textures[ "uv" ].texture,
        offset:   { animate: false, value: new THREE.Vector2( 0, 0.01 ) },
        rotation: { animate: false, value: 0 },
        center:   { value: new THREE.Vector2( 0, 0 ) },
        repeat:   { value: new THREE.Vector2( 1, 1 ) }
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option )
    {
        option.parent = this.stage.props;

        var shapes = new Shapes();
            shapes.init.call( this, option );
            Methods.call( shapes, this, shapes.mesh );
            shapes.texture( texture );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };