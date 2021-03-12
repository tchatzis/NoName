var options = {};

var prop = function( name )
{
    const maze =
    {
        name: name,
        parent: this.stage.props,
        debug: false,
        dimensions: new THREE.Vector3( 24, 6, 24 ),
        floors:
        {
            name: "floors",
            visible: true,
            spacing: 0,
            geometry: new THREE.BoxBufferGeometry( 1, 0.01, 1, 1, 1, 1 ),
            shader: "instanced",
            attributes:
            {
                color:    { type: "vec3", value: new THREE.Color( 0.5, 0.5, 0.5 ) },
                alternate:{ type: "vec3", value: new THREE.Color( 0.75, 0.5, 0 ) },
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
            }
        },
        walls:
        {
            name: "walls",
            visible: true,
            spacing: 0,
            geometry: new THREE.BoxBufferGeometry( 1, 1, 1, 1, 1, 1 ),
            shader: "instanced",
            attributes:
            {
                color:    { type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
                alternate:{ type: "vec3", value: new THREE.Color( 1, 1, 0 ) },
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
            }
        },
        blanks:
        {
            percent: 33,
            color: new THREE.Color( 0.2, 0.2, 0.2 ),
            opacity: 1
        }
    };

    this.props[ name ] = new Maze();
    this.props[ name ].init.call( this, maze );
    this.listeners.add( window, { type: "keyup", value: "s", function: this.props[ name ].solve } );

    return this.props[ name ];
};

export { prop, options };