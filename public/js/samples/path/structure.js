function callback( object )
{
    console.log( "onPathAnimationComplete", object );
}

var options = {};

    options.bezier =
    {
        category: "plot",
        params: new Path.Plots ( { type: "bezier", count: 16 } ),
        object: new Path.Object( { type: "box",    size: 3,              visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                       visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 4, visible: true, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 1, segments: 4, visible: true, color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.catmull =
    {
        category: "plot",
        params: new Path.Plots ( { type: "catmull", count: 28 } ),
        object: new Path.Object( { type: "box",    size: 3,              visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                       visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 4, visible: true, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 1, segments: 4, visible: true, color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.grid =
    {
        category: "plot",
        params: new Path.Plots ( { type: "grid", count: 24 } ),
        object: new Path.Object( { type: "box",    size: 3,              visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                       visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 4, visible: true, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "box", size: 1, segments: 4, visible: true, color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.random =
    {
        category: "plot",
        params: new Path.Plots ( { type: "random", count: 12 } ),
        object: new Path.Object( { type: "box",    size: 3,              visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                       visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 4, visible: true, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 1, segments: 4, visible: true, color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.trajectory =
    {
        category: "trajectory",
        params:
        {
            type: "ellipse",
            a: 100,
            b: 125,
            c: 1,
            speed: 1,
            count: 40
        },
        object: new Path.Object( { type: "box",    size: 3,              visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                       visible: true, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 4, visible: true, color: new THREE.Color( 0x00ff00 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 1, segments: 4, visible: true, color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
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
        this.props[ name ].clear();

        option.parent = this.stage.props;
        option.name = key;
        option.type = key;
        option.params.name = key;
        option.animation.camera = new Path.Camera( { object: this.stage.camera, offset: 1.5 } );

        var prop = new Structure();
            prop.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };