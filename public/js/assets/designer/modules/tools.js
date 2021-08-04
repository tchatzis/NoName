export const Tools = function( scope )
{
    const axes = [ "x", "y", "z" ];

    this.color = ( value ) => value.substring( value.length - 7 );

    this.extract = ( obj ) =>
    {
        // Object() to key/value
        for ( let key in obj )
            return { key: key, value: obj[ key ] };
    };

    this.isArray = ( obj ) => Object.prototype.toString.call( obj ) === '[object Array]';

    this.isObject = ( obj ) => ( typeof obj === 'object' ) && ( obj !== null );

    this.isValue = ( value ) => !( ( value == "" ) || ( value == null ) || ( typeof value == "undefined" ) );

    this.precision = ( value, decimals ) => Math.round( value * Math.pow( 10, decimals ) ) / Math.pow( 10, decimals );

    this.query = async ( params ) =>
    {
        var response = await app.getters.db( params );
        var data = {};

        if ( !params.key )
            return response.data;
        else
            response.data.forEach( obj =>
            {
                var key = obj[ params.key ];
                delete obj[ params.key ];
                data[ key ] = obj;
            } );

        return data;
    };

    this.snap = ( point ) => axes.map( axis =>
    {
        var snap = scope.settings.grid.snap;

        if ( snap )
            return Math.round( point[ axis ] / snap ) * snap;
        else
            return point[ axis ];
    } );

    this.traverse =
    {
        //Tools.traverse.down( scope.groups, "uuid", data.parent );
        up: ( object, key, value ) =>
        {

        },
        down: ( object, key, value ) =>
        {
            var result = {};

            const traverseArray = ( arr ) => arr.forEach( obj => traverse( obj ) );
            const traverseObject = ( obj ) =>
            {
                for ( var prop in obj )
                {
                    if ( obj.hasOwnProperty( prop ) && prop == key && obj[ prop ] == value )
                        result = obj;
                    else if ( obj.hasOwnProperty( prop ) && prop !== "parent" )
                        traverse( obj[ prop ] );
                }
            };

            function traverse( obj )
            {
                if ( Tools.isArray( obj ) )
                    traverseArray( obj );
                else if ( Tools.isObject( obj ) )
                    traverseObject( obj );
            }

            traverse( object );

            return result;
        }
    };

    this.unset = ( set ) =>
    {
        // Set() to value
        for ( let item of set )
            return item;
    };

    this.vector =
    {
        round: ( vector, decimals ) => new THREE.Vector3().fromArray( Object.values( vector ).map( value => Tools.precision( value, decimals ) ) )
    };
};