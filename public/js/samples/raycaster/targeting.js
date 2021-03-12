var options = {};

var prop = function( name )
{
    const cube =
    {
        name: name,
        parent: this.stage.props,
        size: 2,
        segments: 1,
        position: new THREE.Vector3( 0, 0, 0 )
    };

    const args =
    {
        name: name,
        parent: this.stage.props,
        callback: ( intersects ) => console.log( intersects )
    };

    this.props[ name ] = new this.presets.Cube( cube );
    this.props[ name ].enhance( this.raycaster.Targeting, args );

    return this.props[ name ];
};

export { prop, options };