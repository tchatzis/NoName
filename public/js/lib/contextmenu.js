const ContextMenu = function()
{
    var scope = this;
    var margin = 20;
    var px = "px";

    this.download = function()
    {
        this.image.style.opacity = 1;
        this.image.parentNode.href = this.image.src;
        this.image.parentNode.download = this.image.name;
        this.image.parentNode.click();
    }.bind( this );

    this.handlers = function()
    {
        this.element.addEventListener( "mouseout", scope.out, false );
        this.element.addEventListener( "mouseover", scope.over, false );
    };

    this.show = function()
    {
        this.element.style.display = "block";
    };

    this.items = function( items )
    {
        this.element.innerHTML = null;

        items.forEach( ( item ) =>
        {
            var link = document.createElement( "div" );
            link.classList.add( "item" );
            link.innerText = item.label;
            link.addEventListener( "click", item.action, false );
            link.addEventListener( "mouseover", scope.hold, false );

            this.element.appendChild( link );
        } );
    };

    this.move = function()
    {
        this.element.style.left = this.event.clientX - margin + px;
        this.element.style.top  = this.event.clientY - margin + px;
    };

    this.hide = function()
    {
        this.element.style.display = "none";
    }.bind( this );

    this.out = function()
    {
        this.timeout.start();
    }.bind( this );

    this.over = function()
    {
        this.timeout.cancel.all();

    }.bind( this );

    this.set = function( prop, value )
    {
        this[ prop ] = value;
    };

    this.start = function( items )
    {
        this.handlers();
        this.items( items );
        this.show();
        this.move();
        this.timeout = new Timeout( { group: "contextmenu", scope: this, function: this.hide, arguments: null, time: 3000 } );
    }
};