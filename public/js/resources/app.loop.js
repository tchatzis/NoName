const Loop = function()
{
    var app = {};
    var scope = this;

    const sleep = ( milliseconds ) => new Promise( resolve => setTimeout( resolve, milliseconds ) );

    const loop = async function()
    {
        var z = Math.max( scope.dimensions.z, 1 );
        var y = Math.max( scope.dimensions.y, 1 );
        var x = Math.max( scope.dimensions.x, 1 );

        for ( let i = 0; i < z; i++ )
        {
            for ( let j = 0; j < y; j++ )
            {
                for ( let k = 0; k < x; k++ )
                {
                    scope.callback( new THREE.Vector3( i, j, k ) );

                    await sleep( scope.delay.x );
                }

                await sleep( scope.delay.y );
            }

            await sleep( scope.delay.z );
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        loop();
    };
}