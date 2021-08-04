export function Data()
{
    Object.defineProperty( this, "assign",
    {
        enumerable: false,
        value: ( key, object ) => Object.assign( this[ key ], object )
    } );

    Object.defineProperty( this, "get",
    {
        enumerable: false,
        value: ( key ) => this[ key ]
    } );

    Object.defineProperty( this, "set",
    {
        enumerable: false,
        value: ( key, value ) => this[ key ] = value
    } );

    Object.defineProperty( this, "setGroup",
    {
        enumerable: false,
        value: ( name, group, parent ) =>
        {
            this.name = name;
            this.group = group || new THREE.Group();
            this.group.name = name;
            this.group.userData.name = name;

            parent.add( this.group );
        }
    } );

    Object.defineProperty( this, "setGroups",
    {
        enumerable: false,
        value: ( breadcrumbs ) =>
        {
            function traverse( index, parent )
            {
                var name = breadcrumbs[ index ];
                var group = parent.children.find( child => child.name == name );

                index++;

                if ( name )
                {
                    this.setGroup( name, group, parent );

                    traverse.call( this, index, this.group );
                }
            }

            traverse.call( this, 0, scope.parent );
        }
    } );

    Object.defineProperty( this, "watch",
    {
        enumerable: false,
        value: () =>
        {
            for ( let key in this )
                if ( this.hasOwnProperty( key ) )
                    console.warn( key, this[ key ] );
        }
    } );
}