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

    // does not overwrite entire doc
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

    // TODO: tree shake

    /*function meta( data )
    {
        var timestamp = fv.serverTimestamp();

        data.meta = data.meta || {};
        data.meta.index = data.meta.index || 0;

        if ( !data.meta.created )
            data.meta.created = { time: timestamp, user: app.user.id };

        data.meta.modified = { time: timestamp, user: app.user.id };
    }

    function hasValue( value )
    {
        var valid = [];
            valid.push( value !== "" );
            valid.push( valid !== null );
            valid.push( valid !== undefined );

        return valid.every( item => item );
    }*/

    // add with generated doc id
    /*scope.add = ( data, path, callback ) =>
    {
        meta( data );

        var ref = reference( path );
            ref.add( data ).then( callback ).catch( scope.catch );
    };*/

    //scope.unsubscribe = {};

    /*scope.max = ( key, path, limit, callback ) =>
    {
        var ref = reference( path );
            ref.orderBy( key, "desc" ).limit( limit ).get().then( ( snapshot ) => callback( snapshot.docs ) ).catch( scope.catch );
    };*/

    /*scope.min = ( key, path, limit, callback ) =>
    {
        var ref = reference( path );
            ref.orderBy( key, "asc" ).limit( limit ).get().then( ( snapshot ) => callback( snapshot.docs ) ).catch( scope.catch );
    };*/

    /*scope.object =
    {
        get: ( params, callback ) =>
        {
            if ( hasValue( params.object ) )
            {
                var ref = reference( params.path );
                    ref.onSnapshot( ( snapshot ) =>
                    {
                        var data = snapshot.get( params.object );
                        var array = [];
                        var named = [];

                        for ( let item in data )
                        {
                            if ( data.hasOwnProperty( item ) )
                            {
                                array.push( data[ item ] );
                                named.push( { [ item ]: data[ item ] } );
                            }
                        }

                        //console.log( "snapshot", params, data, array );

                        callback( { array: array, tree: data, named: named, object: params.object, path: ref.path } )
                    } );
            }
        },
        merge: ( params, data, callback ) =>
        {
            var ref = reference( params.path );
                ref.set( data, { merge: true } ).then( () => callback( { data: data, object: params.object, path: ref.path } ) ).catch( scope.catch );
        },
        replace: ( params, data, callback ) =>
        {

        }
    };*/

    // save a value without a snapshot call
    /*scope.save = ( params ) =>
    {
        var ref = reference( params );

        if ( params.map )
            ref.update( { [ params.map ] : params.value } ).catch( scope.catch );
        else
            ref.set( params.value, { merge: true } ).catch( scope.catch );
    };*/
    
    /*scope.addDoc = ( params, callback ) =>
    {
        var ref = reference( params );
            ref.doc( params.key ).set( params.value ).catch( scope.catch );

        var output = new Output( ref, params, callback );
            output[ params.output ]();
    };*/

    /*scope.test = ( params, data, callback ) =>
    {
        var ref = reference( params.path );

        console.log( { data: data, key: params.key, object: params.object, path: ref.path } );
    };*/

    // statement: [ "name", "operator == ", "value" ]
    /*scope.query = ( statement, path, callback ) =>
    {
        var ref = reference( path );
            ref.where( ...statement ).get().then( callback ).catch( scope.catch );
    };*/

    /*scope.query( [ "meta.created.time", "==", null ], "test", ( docs ) =>
    {
        docs.forEach( doc =>
        {
            scope.delete( doc.ref.path, () => console.log( doc.id ) );
        } );
    } );*/

    // returns the collection
    /*scope.ordered = ( path, callback ) =>
    {
        var ref = reference( path );
            ref.orderBy( "meta.index" ).onSnapshot( callback );
    };*/

    /*scope.read = ( path, callback ) =>
    {
        var ref = reference( path );
            ref.get().then( callback ).catch( scope.catch );
    };*/

    /*scope.realtime = ( path, callback ) =>
    {
        var ref = reference( path );
            ref.onSnapshot( callback );
    };*/

    // removes a key
    /*scope.remove = ( key, path, callback ) =>
    {
        var ref = reference( path );
            ref.update( { [ key ]: fv.delete() } ).then( () => callback( { removed: key, path: path } ) ).catch( scope.catch );
    };*/

    // add with set doc id
    /*scope.set = ( key, data, path ) =>
    {
        meta( data );

        var ref = reference( path );
            ref.doc( data[ key ] ).set( data ).catch( scope.catch );
    };*/

    /*scope.update = ( data, path, callback ) =>
    {
        meta( data );

        var ref = reference( path );
            ref.update( data ).then( () => callback( data ) ).catch( scope.catch );
    };*/
};