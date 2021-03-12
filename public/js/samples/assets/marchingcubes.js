var options = {};

    options.Balloon =
    {
        position: new THREE.Vector3(),
        material: new THREE.MeshPhysicalMaterial(
        {
            opacity: 1,
            transparent: true,
            side: THREE.DoubleSide,
            transparency: 0.2,
            metalness: 0,
            roughness: 0,
            depthWrite: true,
            color: new THREE.Color( 0xFF0000 ),
            reflectivity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0
        } ),
        resolution: 32,
        tick: 0.02,
        count: 8,
        isolation: 80,
        speed: 1,
        subtract: 12,
        strength: 0.3,
        reset: false,
        time: 2,
        planes: [],
        limit: new THREE.Vector3( 0.25, 0.25, 0.25 ),
        offset: new THREE.Vector3( 0.5, 0.5, 0.5 )
    };

    options.Cubes =
    {
        position: new THREE.Vector3(),
        material: new THREE.MeshPhysicalMaterial(
        {
            opacity: 1,
            transparent: true,
            side: THREE.DoubleSide,
            transparency: 0,
            metalness: 0,
            roughness: 0,
            depthWrite: true,
            color: new THREE.Color( 0x006600 ),
            reflectivity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0
        } ),
        resolution: 32,
        tick: 0.02,
        count: 8,
        isolation: 80,
        speed: 1,
        subtract: 12,
        strength: 1,
        reset: true,
        time: Math.random(),
        planes: [],//[ "x", "y", "z" ],
        rounding: 4,
        limit: new THREE.Vector3( 0.25, 0.25, 0.25 ),
        offset: new THREE.Vector3( 0.5, 0.5, 0.5 )
    };

    options.Melt =
    {
        position: new THREE.Vector3(),
        material: new THREE.MeshStandardMaterial(
        {
            opacity: 1,
            transparent: true,
            side: THREE.DoubleSide,
            metalness: 0,
            roughness: 0,
            depthWrite: true,
            color: new THREE.Color( 0xFFFFFF )
        } ),
        resolution: 32,
        tick: 0.02,
        count: 1,
        isolation: 80,
        speed: 1,
        subtract: 12,
        strength: 0.3,
        reset: false,
        time: 10,
        planes: [],
        rounding: 1.9,
        limit: new THREE.Vector3( 0.25, 0.25, 0.25 ),
        offset: new THREE.Vector3( 0.5, 0.5, 0.5 )
    };

    options.Spheres =
    {
        position: new THREE.Vector3(),
        material: new THREE.MeshPhysicalMaterial(
        {
            opacity: 1,
            transparent: true,
            side: THREE.DoubleSide,
            transparency: 0,
            metalness: 0,
            roughness: 0,
            depthWrite: true,
            color: new THREE.Color( 0xFFFF00 ),
            reflectivity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0
        } ),
        resolution: 32,
        tick: 0.02,
        count: 8,
        isolation: 80,
        speed: 1,
        subtract: 12,
        strength: 1,
        reset: true,
        time: 0,
        planes: [ "y" ],
        limit: new THREE.Vector3( 0.25, 0.75, 0.25 ),
        offset: new THREE.Vector3( 0.5, 0, 0.5 )
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
        option.material.envMap = this.stage.scene.background;
        option.material.envMapIntensity = 1;

        var prop = new MarchingCube();
            prop.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };