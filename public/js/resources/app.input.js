const Input = function( app, output )
{
    var scope = this;

    scope.data = [];

    scope.bar = function( data )
    {
        if ( scope.mesh )
        {
            sample( data, scope.dimensions.x );

            var on = scope.attributes.alternate.value.clone().add( new THREE.Color( 2, 2, 2 ) );
            var off = scope.attributes.alternate.value.clone();

            for ( let c = 0; c < data.length; c++ )
            {
                let value = data[ c ].value * scope.dimensions.y;
    
                for ( let r = 0; r < scope.dimensions.y; r++ )
                {
                    let i = r + scope.dimensions.y * c;
                    let alternate = r < value ? on : off;

                    app.utils.attributes.set( scope.mesh.geometry, "alternate", i, alternate );                    
                }
            }

            scope.mesh.material.uniforms.time.value = 0;
        }
    };

    scope.level = function( data )
    {
        if ( scope.mesh )
        {
            sample( data, scope.dimensions.x );

            var on = scope.attributes.alternate.value.clone().add( new THREE.Color( 2, 2, 2 ) );
            var off = scope.attributes.alternate.value.clone();

            for ( let c = 0; c < data.length; c++ )
            {
                let value = data[ c ].value * scope.dimensions.y;

                for ( let r = 0; r < scope.dimensions.y; r++ )
                {
                    let i = r + scope.dimensions.y * c;
                    let alternate = r === Math.round( value ) ? on : off;

                    app.utils.attributes.set( scope.mesh.geometry, "alternate", i, alternate );
                }
            }

            scope.mesh.material.uniforms.time.value = 0;
        }
    };

    scope.realtime = function( data )
    {
        if ( scope.mesh )
        {
            sample( data, scope.dimensions.z );

            for ( let c = 0; c < scope.data.length; c++ )
            {
                let data = scope.data[ c ];

                for ( let r = 0; r < data.length; r++ )
                {
                    let percent = data[ r ].percent;
                    let i = r + data.length * c;
                    let start = new THREE.Vector3( ...app.utils.attributes.get( scope.mesh.geometry, "start", i ) );
                    let end = new THREE.Vector3( start.x, start.y + percent, start.z );

                    app.utils.attributes.set( scope.mesh.geometry, "end", i, end );
                }
            }

            scope.mesh.instanceMatrix.needsUpdate = true;
            scope.mesh.material.uniforms.time.value = 0;
        }
    };

    function sample( data, length )
    {
        if ( data )
            scope.data.unshift( data );

        if ( scope.data.length > length )
            scope.data.pop();
    }

    app.audio.init( scope.audio );
    app.audio.connect( scope[ output ] );
};