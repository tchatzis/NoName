var options = null;

var prop = function()
{
    this.stage.scene.background = null;

    for ( let i = this.stage.persistent.children.length - 1; i >= 0; i-- )
    {
        let child = this.stage.persistent.children[ i ];

        if ( child.userData.type === "background" )
            this.stage.persistent.remove( child );
        
        this.arrays.persistent[ child.userData.type ] = [];
    }

    return {};
};

export { prop, options };