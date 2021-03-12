var Options = function( ctx )
{
    var scope = this;
    var x = ctx.canvas.width;
    var y = ctx.canvas.height;

    this.roads = function( args )
    {
        switch ( args.sides.join( "" ) )
        {
            // void
            case "0000":
                scope.options =
                    [
                        { f: "park", a: { args: args } },
                        { f: "pond", a: { args: args } }
                    ];
            break;
    
            // dead end
            case "0001":
            case "0010":
            case "0100":
            case "1000":
                args.thickness = true;

                scope.options =
                    [
                        { f: "circle", a: { args: args } },
                        { f: "culdesac", a: { args: args } },
                        { f: "deadend", a: { args: args } },
                        { f: "square", a: { args: args } }
                    ];
            break;
    
            // corners
            case "0011":
                args.x = 0;
                args.y = y;

                scope.options =
                    [
                        { f: "corner", a: { args: args } },
                        { f: "deadend", a: { args: args } }
                    ];
            break;

            case "0110":
                args.x = x;
                args.y = y;

                scope.options =
                    [
                        { f: "corner", a: { args: args } },
                        { f: "deadend", a: { args: args } }
                    ];
            break;
    
            case "1001":
                args.x = 0;
                args.y = 0;

                scope.options =
                    [
                        { f: "corner", a: { args: args } },
                        { f: "deadend", a: { args: args } }
                    ];
            break;
    
            case "1100":
                args.x = x;
                args.y = 0;

                scope.options =
                    [
                        { f: "corner", a: { args: args } },
                        { f: "deadend", a: { args: args } }
                    ];
            break;
    
            // straight
            case "0101":
            case "1010":
                scope.options =
                    [
                        { f: "diamond", a: { args: args } },
                        { f: "stub", a: { args: args } }
                    ];
            break;
    
            // tees
            case "0111":
            case "1011":
            case "1101":
            case "1110":
                scope.options =
                    [
                        { f: "split", a: { args: args } },
                        { f: "stub", a: { args: args } }
                    ];
            break;
    
            // intersection
            case "1111":
                scope.options =
                    [
                        { f: "circle", a: { args: args } },
                        { f: "clover", a: { args: args } },
                        { f: "culdesac", a: { args: args } },
                        { f: "roundabout", a: { args: args } },
                        { f: "stub", a: { args: args } }
                    ];
            break;
        }
    };
};