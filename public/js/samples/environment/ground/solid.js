var options =
{
    box:
    {
        includes: { vertex: [ "noise" ] },
        params: {
            side: THREE.DoubleSide
        },
        uniforms: {
            amplitude: { value: 1 },
            frequency: { value: -0.1 },
            time: { value: 0 },
            lightPosition: { type: "vec3", value: new THREE.Vector3( 1, 1, 0 ) },
            scale: { value: 2 }
        }
    },
    sphere:
    {
        includes: { vertex: [ "noise" ] },
        params: {
            side: THREE.DoubleSide
        },
        uniforms: {
            amplitude: { value: 1 },
            frequency: { value: -0.1 },
            time: { value: 0 },
            lightPosition: { type: "vec3", value: new THREE.Vector3( 1, 1, 0 ) },
            scale: { value: 2 }
        }
    }
};

var prop = function( name )
{
    this.props[ name ] = new this.presets.Group( { name: name, parent: this.stage.persistent } );
    this.props[ name ].submenu = function( option, key )
    {
        option.parent = this.stage.persistent;

        const physics =
        {
            name: "physics",
            onOIMOComplete: ( body ) => { if ( body.numContacts ) this.oimo.wake( body ); },
            move: true,
            density: 2,
            friction: 0.1,
            restitution: 1
        };

        const plane =
        {
            name: name,
            parent: this.stage.persistent,
            position: new THREE.Vector3( 0, 0, 0 ),
            color: new THREE.Color( 0x666666 ),
            width: 20,
            height: 20,
            widthSegments: 100,
            heightSegments: 100
        };

        const pattern =
        {
            type: "boolean",
            color: new THREE.Color( "red" ),
            mod: 1
        };

        this.oimo.init( { distance: 10, gravity: new THREE.Vector3( 0, -9.8, 0 ) } );

        const object =
        {
            box: new this.presets.Cube( {
                name: name,
                parent: this.stage.persistent,
                size: 1,
                segments: 1,
                position: new THREE.Vector3( 0, 3, 0 ),
                rotation: new THREE.Euler( 0, 0, Math.PI / 4, 'XYZ' )
            } ),
            sphere: new this.presets.Sphere( {
                name: name,
                parent: this.stage.persistent,
                position: new THREE.Vector3( 2, 2, 0 ),
                color: new THREE.Color( 0xFFFF00 ),
                radius: 1,
                widthSegments: 32,
                heightSegments: 32,
                phiStart: 0,
                phiLength:  Math.PI * 2,
                thetaStart: 0,
                thetaLength: Math.PI * 2
            } )
        };

        object[ key ].enhance( this.oimo.add, physics );

        var solid = new this.presets.Solid( plane );
            solid.enhance( this.lipstick.pattern, pattern );
            solid.enhance( this.oimo.add, {
                move: false,
                density: 10,
                friction: 0.1,
                restitution: 0.9,
                kinematic: true
            } );
            solid.shader.load( "surface", option );

        this.oimo.play();

        this.arrays.animations.push( { name: name, object: solid.mesh, path: "material.uniforms.time.value", value: 0.005 } );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };