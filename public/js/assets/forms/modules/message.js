function Message()
{
    this.add = ( name, message, status, delay ) =>
    {
        var existing = this.messages.querySelector( `[ data-name = "${ name }" ]` );

        this.div = existing || document.createElement( "div" );
        this.div.setAttribute( "data-name", name );
        this.div.innerText = message;
        this.div.classList.remove( "hide" );
        this.div.classList.add( status );

        if ( !existing )
            this.messages.appendChild( this.div );

        this.hide( delay );
    };

    this.cancel = () =>
    {
        clearTimeout( this.timeout );
        this.timeout = null;
        this.remove();
    };

    this.hide = ( delay ) =>
    {
        delay = delay || 5;

        this.timeout = setTimeout( ()=>
        {
            this.remove();
        }, delay * 1000 );
    };

    this.remove = () =>
    {
        if ( this.div )
            this.div.remove();
    };

    this.init = () =>
    {
        this.messages = document.createElement( "div" );
        this.messages.classList.add( "formmessages" );

        scope.form.appendChild( this.messages );
    };
}

export { Message };