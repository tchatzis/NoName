export default function()
{
    var scope = this;
    var config =
    {
        apiKey: "AIzaSyDWW-G627Z5gnPO4e04iZVreLoq1knqKa8",
        authDomain: "titoc-nonamegame.firebaseapp.com",
        databaseURL: "https://titoc-nonamegame-default-rtdb.firebaseio.com",
        projectId: "titoc-nonamegame",
        storageBucket: "titoc-nonamegame.appspot.com",
        messagingSenderId: "582446940541",
        appId: "1:582446940541:web:b0980ee31dbd80dfb10c14"
    };
    var firebase = window.firebase;
        firebase.initializeApp( config );
    var db = firebase.firestore();
    var fv = firebase.firestore.FieldValue;

    app.config.dependencies[ "firestore" ] = firebase.SDK_VERSION;

    function reference( params )
    {
        var delim = "/";
        var array = [ ...params.path.split( delim ) ];
        var path = [];
            path.push( "users" );
            path.push( app.user.id );
            array.forEach( item => path.push( item ) );
            path = path.join( delim ).replaceAll( delim + delim, delim );

        var type = array.length % 2 ? "collection" : "doc";

        return db[ type ]( path );
    }

    function Output( params, callback )
    {
        var ref = reference( params );

        function data( response )
        {
            var data = [];

            if ( params.map )
            {
               if ( response.docs )
                    data = response.docs.map( doc =>
                    {
                        var d = doc.data()[ params.map ];

                        if ( params.key )
                            d[ params.key ] = doc.id;

                        return d;
                    } );

                if ( response.data )
                    data = response.data()[ params.map ];
            }
            else
            {
                if ( response.docs )
                    data = response.docs.map( doc =>
                    {
                        var d = doc.data();

                        if ( params.key )
                           d[ params.key ] = doc.id;

                        return d;
                    } );

                if ( response.data )
                    data = response.data();
            }

            return { data: data };
        }

        this.realtime = () => ref.onSnapshot( ( response ) =>
        {
            var output = data( response );

            if ( callback )
                callback( output );

            return output;
        } );

        this.static = () => ref.get().then( ( response ) =>
        {
            var output = data( response );

            if ( callback )
                callback( output );

            return output;
        } ).catch( scope.catch );
    }

    scope.catch = ( error ) => console.error ( error );

    scope.delete =
    {
        /*collection: async ( params, callback ) =>
        {
            var data = await scope.get( params, callback );

            console.log( data );
        },*/

        data: ( params, callback ) =>
        {
            var ref = reference( params );
                ref.delete().then( callback ).catch( scope.catch );
        },

        field: ( params, callback ) =>
        {
            var ref = reference( params );
                ref.update( { [ params.map ]: fv.delete() } );

            var output = new Output( ref, params, callback );

            return output[ params.output ]();
        }
    };

    scope.get = ( params, callback ) =>
    {
        var output = new Output( params, callback );

        return output[ params.output ]();
    };

    scope.set = ( params, callback ) =>
    {
        var ref = reference( params );

        if ( params.map )
            ref.update( { [ params.map ] : params.value } ).catch( scope.catch );
        else
            ref.set( params.value, { merge: true } ).catch( scope.catch );

        var output = new Output( params, callback );

        return output[ params.output ]();
    };
};