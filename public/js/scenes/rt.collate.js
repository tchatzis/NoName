var group = function( name, parent )
{
    var group = new THREE.Group();
        group.name = name;
    parent.add( group );

    const plane =
    {
        name: name,
        parent: group,
        position: new THREE.Vector3( 0, 0, 0 ),
        width: 4,
        height: 4,
        widthSegments: 1,
        heightSegments: 1
    };

    const args =
    {
        name: name,
        front: new THREE.Color( "blue" ),
        back: new THREE.Color( "red" )
    };

    var prop = new this.presets.Plane( plane );
        prop.enhance( this.lipstick.Collate, args );

    this.arrays.animations.push( { name: name, object: prop.group, path: "rotation.x", value: -0.01 } );

    return group;
};

export { group };