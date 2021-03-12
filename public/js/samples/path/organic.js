const callback = function( object )
{
    console.log( "onPathAnimationComplete", object );
};

var options = {};

    options.dna =
    {
        category: "organic",
        params:
        {
            type: "helix",
            count: 4,
            segments: 16,
            radius: 10,
            pitch: 40
        },
        object: new Path.Object( { type: "sphere", size: 2,               visible: true,  color: new THREE.Color( 0xffff00 ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                        visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 1, segments: 16, visible: true,  color: new THREE.Color( 0x00ffff ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 2, segments: 16, visible: true,  color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.lattice =
    {
        category: "organic",
        params:
        {
            type: "lattice",
            count: 1,
            segments: 16,
            radius: 10,
            pitch: 40
        },
        object: new Path.Object( { type: "sphere", size: 1,                 visible: true,  color: new THREE.Color( 0xffff00 ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                          visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 0.2, segments: 16, visible: true,  color: new THREE.Color( 0x666666 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 1,   segments: 16, visible: true,  color: new THREE.Color( 0x00ffff ), opaque: 1 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback, speed: 20 }
    };

    options.molecule =
    {
        category: "organic",
        params:
        {
            type: "tetra",
            count: 1,
            segments: 16,
            radius: 10,
            pitch: 40
        },
        object: new Path.Object( { type: "sphere", size: 2,                 visible: true,  color: new THREE.Color( 0xffff00 ), opaque: 0.5 } ),
        line:   new Path.Line  ( {                                          visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
        pipe:   new Path.Pipe  ( {                 size: 0.2, segments: 16, visible: true,  color: new THREE.Color( 0x666666 ), opaque: 0.5 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 2,   segments: 16, visible: true,  color: new THREE.Color( 0xff0000 ), opaque: 0.5 } ),
        animation: { animate: true, loop: true, direction: "forward", onPathAnimationComplete: callback }
    };

    options.virus =
    {
        category: "organic",
        params:
        {
            type: "icosa",
            count: 2,
            segments: 16,
            radius: 8,
            pitch: 40
        },
        object: new Path.Object( { type: "sphere", size: 7,                 visible: true,  color: new THREE.Color( 0xffffff ), opaque: 1 } ),
        line:   new Path.Line  ( {                                          visible: false, color: new THREE.Color( 0x0000ff ), opaque: 1 } ),
        pipe:   new Path.Pipe  ( {                 size: 0.1, segments: 8,  visible: true,  color: new THREE.Color( 0xffffff ), opaque: 1 } ),
        elbow:  new Path.Elbow ( { type: "sphere", size: 0.3, segments: 16, visible: true,  color: new THREE.Color( 0xccccff ), opaque: 1 } ),
        animation: { animate: false, loop: true, direction: "forward", onPathAnimationComplete: callback }
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
        option.name = name;
        option.type = key;
        option.params.name = name;

        var organic = new Organic();
            organic.init.call( this, option );
    }.bind( this );

    return this.props[ name ];
};

export { prop, options };