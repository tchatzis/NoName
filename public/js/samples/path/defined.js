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

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.path.Define );

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
            to: 5.5,
            time: 10,
            attribute: "position.x"
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
        }
    } );

    define.run();

    return this.props[ name ];
};

export { prop, options };