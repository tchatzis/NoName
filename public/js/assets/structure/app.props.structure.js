const Structure = function()
{
    var app = {};
    var scope = this;
    var preset;
    var pipes = {};

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        if ( scope.hasOwnProperty( "params" ) )
            scope.params.structures++;

        scope.group = new THREE.Group();
        scope.group.name = scope.name;

        scope.parent.add( scope.group );

        init();
        objects();
    };

    function init()
    {
        scope.parent = scope.group;

        switch ( scope.object.type )
        {
            case "sphere":
                const sphere =
                {
                    name: scope.name,
                    parent: scope.group,
                    position: new THREE.Vector3( 0, 0, 0 ),
                    color: scope.object.color,
                    radius: scope.object.size,
                    widthSegments: 16,
                    heightSegments: 16,
                    phiStart: 0,
                    phiLength: Math.PI * 2,
                    thetaStart: 0,
                    thetaLength: Math.PI
                };

                preset = new app.presets.Sphere( sphere );
            break;

            default:
                const cube =
                {
                    name: scope.name,
                    parent: scope.group,
                    size: scope.object.size,
                    segments: 1,
                    position: new THREE.Vector3( 0, 0, 0 ),
                    color: scope.object.color
                };

                preset = new app.presets.Cube( cube );
            break;
        }

        preset.enhance( app.path.Instance, scope );
        preset.mesh.visible = scope.object.visible;
        preset.mesh.material.opacity = scope.object.opaque;

        const args =
        {
            onInstancedComplete: mesh,
            color: scope.object.color,
            count: preset.path.vertices.length,
            opaque: scope.object.opaque
        };

        scope.instanced = new Instanced( app, args );
    }

    function Params( object, segments )
    {
        this.side = THREE.FrontSide;
        this.transparent = true;
        this.opacity = object.opaque;
        this.flatShading = object.segments < segments;
    }

    function Material( object, segments )
    {
        return new THREE.MeshStandardMaterial( Object.assign( new Params( object, segments ), { color: object.color, transparent: true } ) );
    }

    function objects()
    {
        var p_geometry = new THREE.CylinderBufferGeometry( scope.pipe.size, scope.pipe.size, 1, scope.pipe.segments, 1 );
        var s_geometry = new THREE.SphereBufferGeometry( scope.elbow.size, scope.elbow.segments, scope.elbow.segments );
        var b_geometry = new THREE.BoxBufferGeometry( scope.elbow.size * 2, scope.elbow.size * 2, scope.elbow.size * 2 );
        var p_material = new Material( scope.pipe, 8 );
        var e_material = new Material( scope.elbow, 16 );

        pipes =
        {
            cylinder: new THREE.Mesh( p_geometry, p_material ),
            sphere: new THREE.Mesh( s_geometry, e_material ),
            box: new THREE.Mesh( b_geometry, e_material )
        };
    }

    function mesh()
    {
        var mesh = scope.instanced.mesh;
            mesh.name = scope.type;
        var dummy = new THREE.Object3D();
        var n;
        var current, next;
        var vertices = preset.path.vertices;
        var length = vertices.length;

        for ( var z = 0; z < length - 1; z++ )
        {
            n = z + 1 === length ? 0 : z + 1;
            current = new THREE.Vector3().copy( vertices[ z ] );
            next = new THREE.Vector3().copy( vertices[ n ] );

            dummy.position.copy( current );
            dummy.updateMatrix();

            if ( scope.pipe.visible )
                pipe( current, next );

            if ( scope.elbow.visible )
            {
                elbow( current );

                if ( n === length - 1 )
                    elbow( next );
            }

            mesh.setMatrixAt( z, dummy.matrix );

            app.utils.attributes.set( mesh.geometry, "color",  z, scope.object.color );
            app.utils.attributes.set( mesh.geometry, "start",  z, dummy.position );
            app.utils.attributes.set( mesh.geometry, "end",    z, dummy.position );
            app.utils.attributes.set( mesh.geometry, "opaque", z, scope.object.opaque );
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    function pipe( current, next )
    {
        var d = new THREE.Vector3().copy( next );
            d.sub( current );
        var length = d.length();
        var c;

        if ( length )
        {
            c = pipes.cylinder.clone();
            c.position.copy( current );
            c.lookAt( next );
            c.rotateX( Math.PI / 2 );
            c.translateY( Math.abs( length ) / 2 );
            c.scale.y = length;

            scope.group.add( c );
        }
    }

    function elbow( current )
    {
        var e = pipes[ scope.elbow.type ].clone();
            e.position.copy( current );

        scope.group.add( e );
    }

    scope.bridge = function( a, b )
    {
        a.forEach( ( vertex, index ) =>
        {
            pipe( a[ index ], b[ index ] );
        } );
    };
};