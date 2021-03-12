var options = {};

var prop = function( name )
{
    const sphere =
    {
        name: name,
        parent: this.stage.props,
        position: new THREE.Vector3( 0, 0, 0 ),
        radius: 4,
        widthSegments: 16,
        heightSegments: 16,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI
    };

    const callback = function()
    {
        const args =
        {
            name: name,
            from: 0,
            to: 4,
            time: 3,
            attribute: "position.y",
            onLerpComplete: () => this.ui.debug.innerText = name + " done"
        };

        this.props[ name ].enhance( this.path.Lerp, args );
    }.bind( this );

    const args =
    {
        name: name,
        from: -10,
        to: 8,
        time: 5,
        attribute: "position.x",
        onLerpComplete: callback
    };

    const texture =
    {
        name: name,
        map: new this.textures.Text( { name: name, debug: false, width: 256, height: 128, text: name, stroke: "1px", background: "black", color: "white", size: 100, font: "" } ).texture,
        offset:   { animate: true, value: new THREE.Vector2( 0, 0.01 ) },
        rotation: { animate: false, value: Math.PI / 4 },
        center:   { value: new THREE.Vector2( 0.5, 0.5 ) },
        repeat:   { value: new THREE.Vector2( 2, 4 ) }
    };

    this.props[ name ] = new this.presets.Sphere( sphere );
    this.props[ name ].mesh.visible = false;
    this.props[ name ].enhance( this.path.Lerp, args );
    this.props[ name ].texture( texture );

    return this.props[ name ];
};

export { prop, options };