var options = {};

var shapes =
{
    "bounding": 0,
    "box": 1,
    "cylinder": 2,
    "ellipsoid": 3,
    "sphere": 4,
    "torus": 5,
    "cone": 6,
    "pyramid": 7,
    "octahedron": 8,
    "plane": 9
};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 1,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 ),
        color: new THREE.Color( 1, 1, 1 )
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].add();

    // TODO: change target to this.data
    //var fps = new Widget();
    //    fps.init.call( this, { title: "fps", parent: this.ui.widget, collapsed: false, target: new Widget.FPS( { value: this.utils.fps, samples: 30, history: 30 } ) } );

    /************* tested ****************/
    //var camera = new Widget();
    //    camera.init.call( this, { title: "camera", parent: this.ui.widget, target: new Widget.Values( { value: new THREE.Vector3( 0, 0, 10 ), object: this.stage.camera, key: "position", increments: 0.01 } ) } );

    //var object = new Widget();
    //    object.init.call( this, { title: "object", parent: this.ui.widget, target: { value: new THREE.Vector3( 0, 0, 10 ), object: this.stage.camera, key: "position", increments: 0.01 } } );

    //var button = new Widget();
    //    button.init.call( this, { title: "button", parent: this.ui.widget, collapsed: false, target: new Widget.Button( { value: "click button", handlers: [ { event: "click", handler: ( e ) => console.log( e.target.dataset ) } ] } ) } );

    //var toggle = new Widget();
    //    toggle.init.call( this, { title: "toggle", parent: this.ui.widget, target: new Widget.Toggle( { value: true, object: this.props[ name ].mesh, key: "visible" } ) } );

    //var multiple = new Widget();
    //    multiple.init.call( this, { title: "multiple", parent: this.ui.widget, target: new Widget.Multiple( { value: [ "directional", "blue" ], object: this.stage.lights, callback: ( args ) => console.log( args ) } ) } );

    //var single = new Widget();
    //    single.init.call( this, { title: "single", parent: this.ui.widget, target: new Widget.Single( { value: 1000, object: this.audio.frequencies, callback: ( args ) => console.log( args ) } ) } );

    //var option = new Widget();
    //    option.init.call( this, { title: "option", parent: this.ui.widget, target: new Widget.Option( { value: "sphere", object: this.props[ name ].mesh.scale, key: "x", options: shapes } ) } );


    // TODO: incomplete
    //var select = new Widget();
    //    select.init.call( this, { title: "select", parent: this.ui.widget, target: new Widget.Select( { value: "blue", object: this.stage.lights } ) } );


    //var list = new Widget();
    //    list.init.call( this, { title: "list", parent: this.ui.widget, target: new Widget.List( { object: scope.current.points, key: "position" } ) } );



    //var float = new Widget();
    //    float.init.call( this, { title: "float", parent: this.ui.widget, target: new Widget.Float( { value: 5, min: 0, max: 30, increments: 0.01 } ) } );

    //var updown = new Widget();
    //    updown.init.call( this, { title: "updown", parent: this.ui.widget, target: new Widget.UpDown( { value: { x: 5, y: 2, z: 3 }, object: this.props[ name ].mesh, key: "scale", min: 0, max: 10, increments: 0.01 } ) } );

    //var integer = new Widget();
    //    integer.init.call( this, { title: "integer", parent: this.ui.widget, target: new Widget.Integer( { value: 4, min: 0, max: 30, increments: 1 } ) } );

    //var hsl = new Widget();
    //    hsl.init.call( this, { title: "hsl", parent: this.ui.widget, target: new Widget.HSL( { value: this.props[ name ].mesh.material.color } ) } );

    //var rgb = new Widget();
    //    rgb.init.call( this, { title: "rgb", parent: this.ui.widget, target: this.props[ name ].mesh.material.color } );

    //var rotate = new Widget();
    //    rotate.init.call( this, { title: "euler", parent: this.ui.widget, target: this.props[ name ].mesh.rotation } );

    //var euler = new Widget();
    //    euler.init.call( this, { title: "rotation", parent: this.ui.widget, target: this.props[ name ].mesh.rotation, collapsed: false } );

    //var transform = new Widget();
    //    transform.init.call( this, { title: "transform", parent: this.ui.widget, target: this.props[ name ].mesh, link: { widget: euler, property: "rotation" } } );

    //var vector2 = new Widget();
    //    vector2.init.call( this, { title: "vector 2", parent: this.ui.widget, target: new THREE.Vector2() } );

    //var vector3 = new Widget();
    //    vector3.init.call( this, { title: "position", parent: this.ui.widget, target: this.props[ name ].mesh.position } );//, link: { widget: transform, property: "position" }

    return this.props[ name ];
};

export { prop, options };