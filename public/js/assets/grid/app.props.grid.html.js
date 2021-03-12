const Html = function( args )
{
    const image = function( args )
    {
        var canvas = document.createElement( "canvas" );
        canvas.width = args.width;
        canvas.height = args.height;

        var ctx = canvas.getContext( "2d" );
        ctx.putImageData( args, 0, 0 );

        var image = new Image();
        image.src = canvas.toDataURL();
        image.width = args.width;
        image.height = args.height;

        return image;
    };

    this.init = function()
    {
        var side = 0;
        var v;
        const bw = 0;
        const border =
        {
            0: `${ bw }px solid ${ args.colors.foreground }`,
            1: `${ bw }px solid transparent`
        };
        const px = "px";
        var id = `${ args.data.row }_${ ( args.data.col % args.cols ) }`;
        var img = image( args.image );
        var width = img.width;
        var height = img.height;

        if ( document.getElementById( id ) )
            document.body.removeChild( document.getElementById( id ) );

        var div = document.createElement( "div" );
            div.id = id;
            div.classList.add( "node" );
            div.style.width = width + px;
            div.style.height = height + px;
            div.style.left = ( args.data.col % args.cols ) * width + px;
            div.style.top = args.data.row * height + px;
            div.appendChild( img );

        if ( bw )
        {
            while ( side < 4 )
            {
                v = args.data.sides[ side ];

                if ( side === 0 ) div.style.borderTop    = border[ v ];
                if ( side === 1 ) div.style.borderRight  = border[ v ];
                if ( side === 2 ) div.style.borderBottom = border[ v ];
                if ( side === 3 ) div.style.borderLeft   = border[ v ];

                side++;
            }
        }

        this.div = div;
    };
};