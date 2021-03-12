var options = {};

var prop = function( name )
{
    options.orthographic =
    {
        scene: "rt.collate",
        width: 1024,
        height: 1024,
        camera: new THREE.OrthographicCamera( -1, 1, -1, 1, 0.1, this.stage.world ),
        position: new THREE.Vector3( 0, 0, 20 )
    };

    options.perspective =
    {
        scene: "rt.collate",
        width: 1024,
        height: 1024,
        camera: new THREE.PerspectiveCamera( 60, 1, 0.1, this.stage.world ),
        position: new THREE.Vector3( 0, 0, 20 )
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 4,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 1, 1, 1 )
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.name = key;

        var prop = new this.presets.Cube( cube );
            prop.enhance( this.lipstick.RenderTarget, option );

        this.arrays.animations.push( { name: name, object: prop.group, path: "rotation.y", value: 0.01 } );
        this.arrays.animations.push( { name: name, object: prop.group, path: "rotation.z", value: 0.01 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };