Path.Bounds = function( min, max )
{
    this.min = min || new THREE.Vector3();
    this.max = max || new THREE.Vector3();
};

Path.Camera = function( args )
{
    args.axes = args.axes || new THREE.Vector3( 1, 1, 1 );
    args.offset = args.offset || 0;
    args.resolution = args.resolution || 1;

    Object.assign( this, args );
};

Path.Elbow = function( args )
{
    args.segments = args.segments || 16;

    Object.assign( this, args );
};

Path.Line = function( args )
{
    Object.assign( this, args );
}

Path.Object = function( args )
{
    args.type = args.type || "Cube";

    Object.assign( this, args );
};

Path.Pipe = function( args )
{
    args.segments = args.segments || 4;

    Object.assign( this, args );
};

Path.Plots = function( args )
{
    var bound = args.bound || 100;

    this.type = args.type;
    this.count = args.count;
    this.resolution = args.resolution || 100;
    this.structures = args.structures || 1;
    this.bounds = new Path.Bounds( new THREE.Vector3( -bound, -bound, -bound ), new THREE.Vector3( bound, bound, bound ) );
    this.array = args.array;
};