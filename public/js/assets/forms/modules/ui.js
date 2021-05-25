export const UI =
{
    add: ( element, parent ) => parent.appendChild( element ),
    cancel: ( parent ) =>
    {
        UI.clear( parent );
        UI.hide( parent );
    },
    clear: ( parent ) => parent.innerHTML = null,
    hide: ( parent ) => parent.classList.add( "hide" ),
    init: ( parent ) => UI.reset( parent ),
    message: ( message ) => console.warn( message ),
    reset: ( parent ) =>
    {
        UI.clear( parent );
        UI.show( parent );
    },
    show: ( parent ) => parent.classList.remove( "hide" )
};