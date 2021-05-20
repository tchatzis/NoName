export const Utilities =
{
    bubble: function( element, css )
    {
        while ( element && !element.classList.contains( css ) )
            element = element.parentNode;

        return element;
    },

    copy: function( value )
    {
        var primitive = value !== Object( value );

        if ( primitive )
            return value;
        else
        {
            if ( Array.isArray( value ) )
                return [ ...value ];
            else if ( typeof value == "object" && value !== null )
                return { ...value };
            else
                console.error( value, typeof value );

            return null;
        }
    },

    create: function( css )
    {
        var div = document.createElement( "div" );
            div.classList.add( css );

        return div;
    }
};