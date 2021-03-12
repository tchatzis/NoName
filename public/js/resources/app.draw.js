const Draw = function( ctx )
{
    this.ctx = ctx;

    this.circle = function( data )
    {
        this.ctx.strokeStyle = color( data.color );
        this.ctx.beginPath();
        this.ctx.arc( data.center.x, data.center.y, data.radius, 0, 2 * Math.PI, false );
        this.ctx.lineWidth = data.line || 1;
        this.ctx.stroke();
    };

    this.clear = function( data )
    {
        data = data || { from: { x: 0, y: 0 }, size: { x: this.ctx.canvas.width, y: this.ctx.canvas.height } };

        this.ctx.clearRect( data.from.x || 0, data.from.y || 0, data.size.x || this.ctx.canvas.width, data.size.y || this.ctx.canvas.height );
    };

    this.dot = function( data )
    {
        this.ctx.fillStyle = color( data.color );
        this.ctx.beginPath();
        this.ctx.arc( data.center.x, data.center.y, data.radius, 0, 2 * Math.PI, false );
        this.ctx.fill();
    };

    this.line = function( data )
    {
        this.ctx.strokeStyle = color( data.color );
        this.ctx.beginPath();
        this.ctx.moveTo( data.from.x, data.from.y );
        this.ctx.lineTo( data.to.x, data.to.y );
        this.ctx.lineWidth = data.line || 1;
        this.ctx.stroke();
    };

    this.rect = function( data )
    {
        this.ctx.fillStyle = color( data.color );
        this.ctx.fillRect( data.from.x, data.from.y, data.size.x, data.size.y );
        this.ctx.fill();
    };

    function color( color )
    {
        if ( Array.isArray( color ) )
            return `rgb( ${ color.toString() } )`;
        else
            return color;
    }
};