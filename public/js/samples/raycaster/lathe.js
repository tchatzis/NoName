var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 1,
        segments: 4,
        position: new THREE.Vector3( 25, 10.5, 25 )
    };

    const raycaster =
    {
        name: name,
        parent: this.stage.props,
        width: 0.3,
        color: new THREE.Color( 0, 0.5, 1 ),
        debug: true,
        near: 0.1,
        far: 100
    };

    const params =
    {
        name: name,
        dimensions: new THREE.Vector3( 30, 30, 30 ),
        size: 1,
        spacing: 0,
        type: "block",
        mod: new THREE.Vector3( 10, 6, 3 ),
        attributes:
        {
            color:   { name: "set", value: new THREE.Color( 0xFFFFFF ) },
            start:   { name: "set" },
            end:     { name: "random", value: { min: -this.stage.world, max: this.stage.world } },
            opaque:  { name: "set", value: 1 }
        },
        uniforms:
        {
            lightPosition:  { value: new THREE.Vector3( 0, 50, 50 ) },
            diffuseColor:   { value: new THREE.Color( 0.1, 0.1, 0.1 ) },
            specularColor:  { value: new THREE.Color( 0.1, 0.1, 0.1 ) },
            time:           { value: 0 },
            duration:       { value: 1 },
            phase:          { value: -1 } // -1: no movement, 0: start, 1: end
        }
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.raycaster.Lathe, raycaster );

    var blob = new Blob();
        blob.parent = this.props[ name ].group;
        blob.raycaster = this.props[ name ].raycaster;
        blob.init.call( this, params );

    this.props[ name ].enhance( this.path.Define );
    this.props[ name ].define.blob = blob;

    var define = this.props[ name ].define;
    new define.Instruction(
    {
        sequence: 0,
        delay: 2,
        continuous: true,
        beam:
        {
            active: true,
            far: 100
        },
        target:
        {
            //from: 0, // not required if continuous: true
            to: 5.5,
            time: 10,
            attribute: "position.x"
        },
        blob:
        {
            to: Math.PI * 2,
            time: 12,
            attribute: "rotation.y"
        }
    } );
    new define.Instruction(
    {
        sequence: 2,
        delay: 1,
        continuous: true,
        beam:
        {
            active: true,
            far: 20
        },
        target:
        {
            to: -25,
            time: 10,
            attribute: "position.y"
        },
        blob:
        {
            to: Math.PI / 2,
            time: 5,
            attribute: "rotation.z"
        }
    } );
    new define.Instruction(
    {
        sequence: 3,
        delay: 0,
        continuous: true,
        beam:
        {
            active: true,
            far: 50
        },
        target:
        {
            to: 0,
            time: 5,
            attribute: "position.y"
        },
        blob:
        {
            to: Math.PI * 1.5,
            time: 10,
            attribute: "rotation.x"
        }
    } );
    new define.Instruction(
    {
        sequence: 4,
        delay: 0,
        continuous: true,
        beam:
        {
            active: true,
            far: 50
        },
        target:
        {
            to: 14,
            time: 5,
            attribute: "position.y"
        },
        blob:
        {
            to: Math.PI * 4,
            time: 10,
            attribute: "rotation.y"
        }
    } );
    new define.Instruction(
    {
        sequence: 1,
        delay: 0,
        continuous: true,
        beam:
        {
            active: true,
            far: 20
        },
        target:
        {
            to: 0,
            time: 3,
            attribute: "position.y"
        },
        blob:
        {
            to: Math.PI,
            time: 10,
            attribute: "rotation.z"
        }
    } );

    define.run();

    return this.props[ name ];
};

export { prop, options };