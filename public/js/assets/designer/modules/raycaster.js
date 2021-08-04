import { Tools } from "../modules/tools.js"

export const Raycaster = function( scope )
{
    var raycaster = this;
    var tools = new Tools( scope );

    this.disable = () => raycaster.enabled = false;

    this.enable = () => raycaster.enabled = true;

    this.initialize = () =>
    {
        this.intersect = [];
        this.intersects = [];
        this.disable();

        this.raycaster = new THREE.Raycaster();
        this.selected = null;
        this.snap = new THREE.Vector3( scope.settings.grid.snap, scope.settings.grid.snap, scope.settings.grid.snap );
        this.update();
    };

    this.objects =
    {
        add: () =>
        {
            this.intersects = [ scope.grid.object ];
            this.position = ( point ) => new THREE.Vector3().fromArray( tools.snap( point ) );
        }



        /*switch ( Raycaster.mode )
        {
            case "add":
                Raycaster.intersects = [ scope.grid.object ];
                Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, Raycaster.snap ) );
            break;

            case "edit":
                Raycaster.first = true;
                Raycaster.intersects = Objects.lines.all( scope.current.group, [] ).concat( scope.grid.object );
                Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, new THREE.Vector3() ) );
            break;

            case "select":
                Raycaster.first = false;
                Raycaster.intersects = Objects.lines.all( scope.group, [] );
                Raycaster.action = ( args ) => Process.raycaster[ Raycaster.mode ]( args );
                Raycaster.position = ( point ) => new THREE.Vector3().fromArray( Tools.snap( point, new THREE.Vector3() ) );
            break;

            case "view":
                Raycaster.intersects = [];
            break
        }*/


    };

    this.update = () =>
    {
        if ( raycaster.mode )
        {
            this.objects[ raycaster.mode ]();
            this.intersect = this.raycaster.intersectObjects( this.intersects );

            let enabled = scope.mouse.enabled && this.enabled;
            let index = this.first ? 0 : this.intersect.length - 1;

            if ( enabled )
            {
                this.raycaster.setFromCamera( scope.mouse, app.stage.camera );

                if ( !!this.intersect.length )
                {
                    let position = new THREE.Vector3().copy( this.position( this.intersect[ index ].point ) );
                    scope.crosshairs.move( position );
                }
            }
        }
    };
};