var options = {};

options.cube =
{
    dimensions: new THREE.Vector3( 24, 1, 24 ),
    type: "cube", // plane, cube, html
    colors: { background: "#000000", foreground: "#ffffff" }
};

options.plane =
{
    dimensions: new THREE.Vector3( 24, 1, 24 ),
    type: "plane", // plane, cube, html
    colors: { background: "#006801", foreground: "#5DA658" }
};

var prop = function( name )
{
    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.stage.props;
        option.name = key;
        Object.assign( option,
        {
            // mesh            
            size: 1,
            spacing: 0.1,
            scale: new THREE.Vector3( 1, 1, 1 ),
            shader: "instanced",
            attributes:
            {
                color:    { type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
                alternate:{ type: "vec3", value: new THREE.Color( 1, 0, 0 ) },
                start:    { type: "vec3", value: new THREE.Vector3() },
                end:      { type: "vec3", value: new THREE.Vector3() },
                opaque:   { type: "float", value: 1 },
                level:    { type: "float", value: 16 },
                rotation: { type: "vec3", value: new THREE.Vector3() }
            },
            uniforms:
            {
                lightPosition:  { type: "vec3", value: this.stage.lights[ "directional" ].position },
                diffuseColor:   { type: "vec3", value: this.stage.lights[ "directional" ].color },
                specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
                time:           { type: "float", value: 0 },
                duration:       { type: "float", value: 0.25 },
                phase:          { type: "float", value: -1 },
                amplitude:      { type: "float", value: 0.5 }
            },
            /*disruptors:
            [
                {
                    name: name,
                    type: "reciprocate",
                    delay: new THREE.Vector3( 200, 0, 1000 ),
                    axis: "y",
                    value: 0.05
                    //onDisruptorUpdate: this.ammo.update
                },
                {
                    name: name,
                    type: "rotate",
                    delay: new THREE.Vector3( 200, 0, 1000 ),
                    axis: "y",
                    value: 0.1
                    //onDisruptorUpdate: this.ammo.update
                },
                {
                    name: name,
                    type: "color",
                    delay: new THREE.Vector3( 1000, 0, 1000 ),
                    axis: "z",
                    value: new THREE.Color( 0x00FFFF * Math.random() )
                }
            ]*/
        } );

        var grid = new Grid();
            grid.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };