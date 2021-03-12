const CubeMap = function()
{
    var id = 0;
    var ctx;
    var image = {};
    var display = {};
    var initial = {};
    var px = "px";
    var margin = 20;

    const utils = ( function()
    {
        // shortcuts
        const ac = function( parent, child )
        {
            parent.appendChild( child );
        };

        const ce = function( tag )
        {
            return document.createElement( tag );
        };

        const dimensions = function( object )
        {
            var factor = [ 3/4, 4/3 ];
            var dimensions = [ object.width, object.height ];

            for ( var index = 0; index < dimensions.length; index++ )
            {
                if ( dimensions[ index ] * factor[ index ] > dimensions[ 1- index ] * factor[ 1 - index ] )
                    break;
            }

            dimensions[ 1 - index ] = Math.round( dimensions[ index ] * factor[ index ] );

            return dimensions;
        };

        // utils
        const exponent = function( value )
        {
            return Math.log( value ) / Math.log( 2 );
        };

        const map = function( id )
        {
            const map =
            {
                '0': { name: "yp.png", align: "end", justify: "end" },
                '1': { name: "yp.png", align: "end" },
                '2': { name: "yp.png", align: "end" },
                '3': { name: "yp.png", align: "end", justify: "start" },
                '4': { name: "xn.png", align: "start", justify: "end" },
                '5': { name: "zp.png", align: "start" },
                '6': { name: "xp.png", align: "start" },
                '7': { name: "zn.png", align: "start", justify: "start" },
                '8': { name: "yn.png", align: "start", justify: "end" },
                '9': { name: "yn.png", align: "start" },
                '10': { name: "yn.png", align: "start" },
                '11': { name: "yn.png", align: "start", justify: "start" }
            };

            return map[ id ];
        };

        const node = function( el, tag, inputs )
        {
            if ( el.tagName.toLowerCase() === tag.toLowerCase() )
                inputs.push( el );

            el.childNodes.forEach( ( child ) =>
            {
                if ( child.nodeType === 1 )
                {
                    el = child;
                    node( el, tag, inputs );
                }
            } );

            return inputs;
        };

        const outline = function( width, height, display )
        {
            output.outline.style.width = width + px;
            output.outline.style.height = height + px;
            output.outline.style.display = display ? "block" : "none";

            output.guides.style.width = "100%";
            output.guides.style.height = "100%";
        };

        const powerOf2 = function( value )
        {
            return Math.pow( 2, Math.round( exponent( value ) ) );
        };

        const quantize = function( object )
        {
            var axes = [ "width", "height" ];
            var value = { width: 0, height: 0 };
            var axis;

            for ( var index = 0; index < axes.length; index++ )
            {
                axis = axes[ index ];
                value[ axis ] = utils.powerOf2( object[ axis ] );

                if ( value[ axis ] < value[ axes[ 1 - index ] ] )
                {
                    break;
                }
            }

            return value[ axis ];
        };

        const scale = function( image, action )
        {
            var size = utils.quantize( ctx.canvas ) / 4;
            var canvas = utils.ce( "canvas" );
                canvas.width = size;
                canvas.height = size;
            var scale =
            {
                fill: Math.max( canvas.width / image.width, canvas.height / image.height ),
                fit:  Math.min( canvas.width / image.width, canvas.height / image.height )
            };
            var x = ( canvas.width / 2 ) -  ( image.width / 2 )  * scale[ action ];
            var y = ( canvas.height / 2 ) - ( image.height / 2 ) * scale[ action ];
            var context = canvas.getContext( "2d" );
                context.drawImage( image, x, y, image.width * scale[ action ], image.height * scale[ action ] );
            var img = new Image();
                img.src = canvas.toDataURL( "image/png" );
                img.addEventListener( "load", () =>
                {
                    img.width = display.width / 4;
                    img.height = display.height / 3;
                } );

            return img;
        };

        const scrollbar = function( element )
        {
            return element.offsetWidth - element.clientWidth;
        };

        const transparent = function()
        {
            var canvas = utils.ce( "canvas" );
                canvas.width = 32;
                canvas.height = 32;
            var ctx = canvas.getContext( "2d" );
                ctx.fillStyle = "white";
                ctx.fillRect( 0, 0, 16, 16 );
                ctx.fillRect( 16, 16, 32, 32 );
                ctx.fillStyle = "#CCCCCC";
                ctx.fillRect( 16, 0, 32, 16 );
                ctx.fillRect( 0, 16, 16, 32 );
            var image = utils.ce( "img" );
                image.src = canvas.toDataURL( "image/png" );

            return image.src;
        };

        return {
            ac: ac,
            ce: ce,
            dimensions: dimensions,
            exponent: exponent,
            map: map,
            node: node,
            outline: outline,
            powerOf2: powerOf2,
            quantize: quantize,
            scale: scale,
            scrollbar: scrollbar,
            transparent: transparent
        };
    } )();

    // processing
    const run = ( function()
    {
        // resize to 4 : 3
        const aspect = function()
        {
            var dims = utils.dimensions( ctx.canvas );
            var delta = { width: dims[ 0 ] - ctx.canvas.width, height: dims[ 1 ] - ctx.canvas.height };
            var left = -delta.width / 2;
            var top =  -delta.height / 2;
            var right = ctx.canvas.width - left;
            var bottom = ctx.canvas.height - top;
            var value = [];
                value.push( left );
                value.push( top );
                value.push( right );
                value.push( bottom );
            var data = ctx.getImageData( left, top, ...dims );

            ctx.canvas.width = dims[ 0 ];
            ctx.canvas.height = dims[ 1 ];
            ctx.clearRect( 0, 0, ...dims );
            ctx.putImageData( data, 0, 0 );

            utils.outline( ...dims, true );

            actions.message( `aspect set at ${ dims }` );

            ui.crop.update( [ 0, 0, ...dims ] );
        };

        const background = function( color )
        {
            var imgData = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height );
            var data = imgData.data;
            var length = data.length;

            color = color.split( "," );

            for ( var i = 0; i < length; i += 4 )
            {
                // replace 0 alpha with new background color
                if ( data[ i + 3 ] === 0 )
                {
                    data[ i ]     = color[ 0 ];
                    data[ i + 1 ] = color[ 1 ];
                    data[ i + 2 ] = color[ 2 ];
                    data[ i + 3 ] = 255;
                }
                // replace less than full alpha with new background color and averaged alpha
                else if ( data[ i + 3 ] > 0 && data[ i + 3 ] < 255 )
                {
                    data[ i ]     = color[ 0 ];
                    data[ i + 1 ] = color[ 1 ];
                    data[ i + 2 ] = color[ 2 ];
                    data[ i + 3 ] = ( data[ i + 3 ] + color[ 3 ] ) / 2;
                }
            }

            ctx.putImageData( imgData, 0, 0 );
        };

        const crop = function()
        {
            var left = 0;
            var top = 0;
            var width = ui.crop.settings.value[ 2 ] - ui.crop.settings.value[ 0 ];
            var height = ui.crop.settings.value[ 3 ] - ui.crop.settings.value[ 1 ];

            var value = [];
                value.push( left );
                value.push( top );
                value.push( width );
                value.push( height );

            ctx.canvas.width = ui.crop.settings.value[ 2 ];
            ctx.canvas.height = ui.crop.settings.value[ 3 ];
            ctx.drawImage( ctx.canvas, ...ui.crop.settings.value, ...value );

            utils.outline( width, height, true );

            actions.message( `cropped at ${ ui.crop.settings.value }` );

            ui.crop.update( value );
        };

        // copy image to canvas
        const copy = function()
        {
            var canvas = utils.ce( "canvas" );
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.id = 0;
                canvas.menu = "Canvas";
                canvas.addEventListener( "contextmenu", listeners.contextmenu, false );
            utils.ac( output.panels, canvas );

            ctx = canvas.getContext( "2d" );
            ctx.drawImage( image, 0, 0, image.width, image.height );

            actions.message( `image copied to canvas` );
        };

        // called from actions.load() - start point
        const reset = function( e )
        {
            id = 0;
            output.panels.innerHTML = null;
            image = e.path[ 0 ];

            if ( image )
            {
                copy();
                update();
            }
            else
            {
                actions.message( "image not found" );
            }
        };

        const split = function()
        {
            var width = ctx.canvas.width / 4;
            var height = ctx.canvas.height / 3;
            var left, top, right, bottom;
            var data = {};
            var w, h;
            var value = [];
            var id = 0;

            output.panels.innerHTML = null;
            utils.outline( display.width, display.height, true );

            for ( var row = 0; row < 3; row++ )
            {
                top = height * row;
                bottom = height * ( row + 1 );
                h = bottom - top;
                value[ 1 ] = top;
                value[ 3 ] = h;

                for ( var col = 0; col < 4; col++ )
                {
                    left = width * col;
                    right = width * ( col + 1 ) ;
                    w = right - left;
                    value[ 0 ] = left;
                    value[ 2 ] = w;

                    data = ctx.getImageData( ...value );

                    output.cell( data, id );
                    id++;
                }
            }
        };

        const trim = function()
        {
            var value = ui.move.settings.parameters.value;
            var data = ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height );

            ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
            ctx.putImageData( data, value[ 0 ], value[ 1 ] );
        };

        const update = function()
        {
            // update background
            ui.background.update( ui.background.settings.value );

            // update outline
            ui.outline.update( ui.outline.settings.value );
            output.outline.style.width = image.width + px;
            output.outline.style.height = image.height + px;

            // update crop
            ui.crop.update( [ 0, 0, image.width, image.height ] );
            ui.crop.controls[ 2 ].number.setAttribute( "max", image.width );
            ui.crop.controls[ 3 ].number.setAttribute( "max", image.height );

            ui.outline.element.classList.remove( "hidden" );
            ui.canvas.element.classList.remove( "hidden" );

            initial.width  = ctx.canvas.width;
            initial.height = ctx.canvas.height;
        };

        return {
            aspect: aspect,
            background: background,
            crop: crop,
            reset: reset,
            split: split
        };
    } )();

    // ui listeners
    const listeners = ( function()
    {
        // output.preview()
        document.addEventListener( "ui_background", ( e ) =>
        {
            e.preventDefault();
            e.stopPropagation();

            var background = `url( ${ utils.transparent() } )`;
            var parameters = ui.background.settings.parameters;
                parameters.colors.forEach( ( color, index ) =>
                {
                    var swatch = ui.background.controls[ index ];

                    if ( color === parameters.value[ 0 ] )
                    {
                        swatch.classList.add( "selected" );
                        swatch.classList.remove( "opaque" );

                        if ( color === "transparent" )
                        {
                            output.panels.style.backgroundImage = background;
                            output.panels.style.backgroundRepeat = "repeat, repeat";
                            output.zoom.style.backgroundImage = background;
                            output.zoom.style.backgroundRepeat = "repeat, repeat";
                        }
                        else
                        {
                            output.panels.style.backgroundColor = color;
                            output.panels.style.backgroundImage = "none";
                            output.zoom.style.backgroundColor = color;
                            output.zoom.style.backgroundImage = "none";
                        }
                    }
                    else
                    {
                        swatch.classList.remove( "selected" );
                        swatch.classList.add( "opaque" );
                    }
                } );
        }, false );

        document.addEventListener( "ui_outline", ( e ) =>
        {
            e.preventDefault();
            e.stopPropagation();

            var remove = function( element, exclude )
            {
                var array = element.classList.value.split( " " );

                array.forEach( ( cls ) =>
                {
                    if ( exclude.indexOf( cls ) === -1 )
                    {
                        element.classList.remove( cls );
                    }
                } );
            };

            remove( output.outline, [ "outline" ] );
            remove( output.guides, [ "guides" ] );

            var parameters = ui.outline.settings.parameters;
                parameters.colors.forEach( ( color, index ) =>
                {
                    var swatch = ui.outline.controls[ index ];

                    if ( color === parameters.value[ 0 ] )
                    {
                        swatch.classList.add( "selected" );
                        swatch.classList.remove( "opaque" );

                        output.outline.style.outlineColor = color;

                        output.guides.childNodes.forEach( ( child ) =>
                        {
                            child.style.borderColor = color;
                        } );
                    }
                    else
                    {
                        swatch.classList.remove( "selected" );
                        swatch.classList.add( "opaque" );
                    }
                } );

        }, false );

        // run.process()
        document.addEventListener( "ui_dimensions", function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            var controls = e.detail.controls;
            var value = e.detail.settings.value;

            controls.forEach( ( control, index ) =>
            {
                control.number.value = value[ index ];
            } );
        } );

        document.addEventListener( "ui_quantize", function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            var controls = e.detail.controls;
            var value = e.detail.settings.value;

            controls.forEach( ( control, index ) =>
            {
                control.range.value = Math.min( utils.exponent( value[ 0 ] ), utils.exponent( value[ 1 ] ) );
                control.width.value = Math.pow( 2, control.range.value );
                control.height.value = Math.pow( 2, control.range.value ) * 0.75;

                e.detail.settings.scale = ( control.range.value - control.range.min ) * 2;
            } );
        } );

        document.addEventListener( "ui_crop", function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            var controls = e.detail.controls;
            var value = e.detail.settings.value;

            actions.outline( value );

            controls.forEach( ( control, index ) =>
            {
                control.number.value = value[ index ];
            } );
        } );

        document.addEventListener( "ui_canvas", function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            var controls = e.detail.controls;
            var value = e.detail.settings.value;

            controls.forEach( ( control ) =>
            {
                control.text.value = value;
            } );
        }, false );

        // set up distinct menus for each element.menu value
        const contextmenu = function( e )
        {
            const options =
            {
                Canvas: function()
                {
                    ContextMenu.call( this );

                    var items =
                    [
                        { label: "Fit to Workspace", action: actions.workspace },
                        { label: "Pick Canvas Background Color", action: picker },
                        { label: "Show Crop Settings", action: actions.crop },
                        { label: "Set 4:3 Aspect", action: run.aspect },
                        { label: "Split Image", action: run.split },
                        { label: "Cancel", action: this.cancel }
                    ];

                    this.init = function( e )
                    {
                        this.element = output.contextmenu;
                        this.event = e;
                        this.start( items );
                        image = this.event.target;
                    }.bind( this );
                },

                Cell: function()
                {
                    ContextMenu.call( this );

                    var zoom = new options.Zoom();

                    var items =
                    [
                        { label: "Download", action: this.download },
                        { label: "Zoom", action: zoom.init },
                        { label: "Cancel", action: this.cancel }
                    ];

                    this.init = function( e )
                    {
                        this.element = output.contextmenu;
                        this.event = e;
                        this.start( items );
                        this.image = this.event.target;
                        this.image.name = utils.map( this.image.id ).name;
                        zoom.image = this.image;
                    }.bind( this );
                },

                Zoom: function()
                {
                    ContextMenu.call( this );

                    var items =
                    [
                        { label: "Download", action: this.download },
                        { label: "Cancel", action: this.cancel }
                    ];

                    this.init = function( e )
                    {
                        this.element = output.contextmenu;
                        this.event = e;
                        this.start( items );
                        this.append();
                    }.bind( this );

                    this.move = function()
                    {
                        console.log( "move" );
                        this.element.style.right  = margin + px;
                        this.element.style.bottom = margin + px;
                    };

                    this.append = function()
                    {
                        this.element.innerHTML = null;

                        var img = utils.ce( "img" );
                            img.src = this.image.src;
                            img.id = this.image.id;
                            img.name = utils.map( this.image.id ).name;
                            img.menu = "Zoom";
                            img.addEventListener( "contextmenu", listeners.contextmenu, false );

                        utils.ac( this.element, img );
                    }
                }
            };

            var menu = new options[ e.target.menu ]();
                menu.init( e );
        };

        // enable arrow keys for outline
        var movement =
        {
            left: 0,
            top: 0
        }

        // outline arrow keys handler
        const outline = function( e )
        {
            e.stopPropagation();

            if( [ 37, 38, 39, 40 ].indexOf( e.keyCode ) > -1 )
            {
                switch( e.key )
                {
                    case "ArrowUp":
                        movement.top--;
                        e.preventDefault();
                    break;

                    case "ArrowDown":
                        movement.top++;
                        e.preventDefault();
                    break;

                    case "ArrowLeft":
                        movement.left--;
                        e.preventDefault();
                    break;

                    case "ArrowRight":
                        movement.left++;
                        e.preventDefault();
                    break;
                }

                var origin =
                {
                    left: output.panels.scrollLeft + output.panels.offsetLeft,
                    top:  output.panels.scrollLeft + output.panels.offsetTop
                };
                var left = origin.left + movement.left;
                var top =  origin.top  + movement.top;
                var right = ui.crop.settings.value[ 2 ];
                var bottom = ui.crop.settings.value[ 3 ];

                output.outline.style.left = left + px;
                output.outline.style.top  = top  + px;

                ui.crop.update( [ left - origin.left, top - origin.top, right, bottom ] );
            }
        };

        // get context menu position in relation to element
        const position = function( e, element )
        {
            //var parent = e.target.parentNode;
            var origin =
            {
                x: element.parentNode.offsetLeft,
                y: element.parentNode.offsetTop
            };
            var scroll =
            {
                x: element.scrollLeft,
                y: element.scrollTop
            };
            var menu =
            {
                x: e.clientX,//parseInt( parent.style.left ),
                y: e.clientY//parseInt( parent.style.top )

            }
            var value =
            {
                x: menu.x  + scroll.x - origin.x,
                y: menu.y + scroll.y - origin.y
            };

            return value;
        };

        const pick = function( e )
        {
            var value = position( e, output.panels, margin );
            var data = ctx.getImageData( value.x, value.y, 1, 1 ).data;

            ui.canvas.update( data );

            return "rgba(" + data.toString() + ")";
        };

        // color picker
        const picker = function( e )
        {
            var start = Date.now();

            var listener = function( event )
            {
                var color = pick( event );
                output.panels.style.cursor = "crosshair";
                e.target.style.borderColor = color;
                ui.canvas.controls[ 0 ].text.style.backgroundColor = color;

                if ( Date.now() - start > 2000 )
                {
                    output.panels.style.cursor = "auto";
                    output.panels.removeEventListener( "click", listener, false );
                }

                start = Date.now();
            };

            output.panels.addEventListener( "click", listener, false );
        };

        // kill keys
        const prevent = function( e )
        {
            if( [ 37, 38, 39, 40 ].indexOf( e.keyCode ) > -1 )
            {
                e.preventDefault();
            }
        };

        // TODO: fix or trash
        const resize = function()
        {
            output.panels.style.height = "calc( 100vh - 40px )";

            var width = utils.powerOf2( output.panels.offsetHeight * 4 / 3 );
            var height = width * 3 / 4;

            output.panels.style.width = width + px;
            output.panels.style.height = height + px;

            //output.outline.style.width = width + px;
            //output.outline.style.height = height + px;

            //output.guides.style.width = width + px;
            //output.guides.style.height = height + px;

            display = { width: width, height: height };
        };

        // moves outline with scroll
        const scroll = function( e )
        {
            var value = ui.crop.settings.value;
            var left = - ( e.target.scrollLeft - value[ 0 ] - margin );
            var top =  - ( e.target.scrollTop  - value[ 1 ] - margin );

            output.outline.style.left = left + px;
            output.outline.style.top  = top  + px;
        };

        window.addEventListener( "load", resize, false );
        window.addEventListener( "resize", resize, false );
        window.addEventListener( "keydown", outline, false );
        window.addEventListener( "keydown", prevent, false );
        window.addEventListener( "keyup", prevent, false );
        window.addEventListener( "contextmenu", ( e ) => e.preventDefault(), false );

        return {
            contextmenu: contextmenu,
            outline: outline,
            picker: picker,
            prevent: prevent,
            resize: resize,
            scroll: scroll
        };
    } )();

    // ui actions
    const actions = ( function()
    {
        const crop = function( e )
        {
            ui.crop.element.classList.toggle( "hidden" );

            if ( ui.crop.element.classList.contains( "hidden" ) )
            {
                e.target.style.borderColor = "red";
            }
            else
            {
                e.target.style.borderColor = "green";
            }
        };

        // called from listeners ui_crop
        const outline = function( value )
        {
            var l = output.panels.offsetLeft - output.panels.scrollLeft;
            var t = output.panels.offsetTop  - output.panels.scrollTop;
            var left =   l + value[ 0 ] - margin;
            var top =    t + value[ 1 ] - margin;
            var right =  l - value[ 2 ];
            var bottom = t - value[ 3 ];
            var width =  l - value[ 0 ] - right;
            var height = t - value[ 1 ] - bottom;

            output.outline.style.left = left + margin + px;
            output.outline.style.top = top + margin + px;
            output.outline.style.width = width + px;
            output.outline.style.height = height + px;

            value = [];
            value.push( left );
            value.push( top );
            value.push( width );
            value.push( height );
        };

        const load = function( src )
        {
            var img = new Image();
                img.src = src;
                img.addEventListener( "load", run.reset, false );
                img.addEventListener( "error", () => actions.message( "error loading file" ), false );
        };

        const message = function( value )
        {
            output.message.innerText = value;
            output.message.classList.add( "show" );

            setTimeout( () => output.message.classList.remove( "show" ), 5000 );
        };

        const resize = function()
        {
            // TODO: figure this out

            //ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, ctx.canvas.width, ctx.canvas.height );
        };

        const test = function()
        {
            return true;
        };

        const workspace = function( e )
        {
            if ( !ctx.canvas.workspace )
            {
                ctx.canvas.style.width  = display.width  + px;
                ctx.canvas.style.height = display.height + px;
                utils.outline( display.width, display.height, true );
                e.target.style.borderColor = "green";
            }
            else
            {
                ctx.canvas.style.width  = initial.width  + px;
                ctx.canvas.style.height = initial.height + px;
                utils.outline( initial.width, initial.height, true );
                e.target.style.borderColor = "red";
            }

            ctx.canvas.workspace = !ctx.canvas.workspace;
        };

        return {
            crop: crop,
            outline: outline,
            load: load,
            message: message,
            resize: resize,
            test: test,
            workspace: workspace
        };
    } )();

    // ui controls
    const inputs = ( function()
    {
        // multiple text inputs
        const array = function()
        {
            var parameters = this.settings.parameters;
            var element = utils.ce( "div" );
                element.classList.add( "table-row" );
                element.dataset.name = `${ parameters.name } inputs`;

            // render axes
            this.settings.value.forEach( ( value, index ) =>
            {
                element.appendChild( text.call( this, { index: index } ) );
            } );

            if ( parameters.button )
                element.appendChild( button.call( this, { label: parameters.button } ) );

            return element;
        };

        const button = function( args )
        {
            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;
            var element = utils.ce( "div" );
                element.classList.add( "action" );
                element.innerText = ( args && args.hasOwnProperty( "label" ) ) ? args.label : this.settings.label;
                element.id = id;
                element.addEventListener( "click", ( e ) => parameters.action.call( this ) );

            return element;
        };

        const dimensions = function( args )
        {
            this.value.style.display = "none";

            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;

            var change = function( e )
            {
                e.preventDefault();
                e.stopPropagation();

                var el = e.target;
                var value = parseFloat( el.value );

                parameters.value[ 0 ] = Math.pow( 2, value );
                parameters.value[ 1 ] = parameters.value[ 0 ] * 0.75;

                console.log( parameters.value, value );
                this.update( parameters.value );
            }.bind( this );

            var element = utils.ce( "div" );
                element.classList.add( "table-row" );

            var range = utils.ce( "input" );
                range.id = id;
                range.classList.add( "text" );
                range.type = "range";
                range.style.width = "90%";
                range.min = parameters.min;
                range.max = parameters.max;
                range.step = 1;
                range.dataset.name = parameters.name;
                range.value = range.min;
                range.addEventListener( "input", change, false );
            var div2 = utils.ce( "div" );
                div2.classList.add( "table-cell" );
                div2.classList.add( "align-top" );
                div2.classList.add( "h-pad" );
                div2.appendChild( range );

            // reaonly output
            var width = utils.ce( "input" );
                width.classList.add( "number" );
                width.type = "number"
                width.value = parameters.value[ 0 ];
                width.readOnly = parameters.readOnly;
                width.placeholder = "width";
            var div1 = utils.ce( "div" );
                div1.classList.add( "table-cell" );
                div1.classList.add( "align-top" );
                div1.appendChild( width );

            var height = utils.ce( "input" );
                height.classList.add( "number" );
                height.type = "number";
                height.value = parameters.value[ 1 ];
                height.readOnly = parameters.readOnly;
                height.placeholder = "height";
            var div3 = utils.ce( "div" );
                div3.classList.add( "table-cell" );
                div3.classList.add( "align-top" );
                div3.appendChild( height );

            element.appendChild( div2 );
            element.appendChild( div1 );
            element.appendChild( div3 );

            this.controls.push(
            {
                range: range,
                width: width,
                height: height
            } );

            return element;
        };

        const number = function( args )
        {
            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;

            var change = function( e )
            {
                e.preventDefault();
                e.stopPropagation();

                var el = e.target;
                var value = parseFloat( el.value );
                var isNumber = !isNaN( value );

                if ( isNumber )
                {
                    el.style.borderColor = "green";

                    parameters.value[ id ] = value;
                    this.update( parameters.value );
                }
                else
                {
                    el.style.borderColor = "red";
                }
            }.bind( this );

            var element = utils.ce( "div" );
                element.classList.add( "table-row" );
            var label = utils.ce( "div" );
                label.classList.add( "number-label" );
                label.classList.add( "table-cell" );
                label.innerText = args ? args.label : "";
            var number = utils.ce( "input" );
                number.id = id;
                number.type = "number";
                number.classList.add( "table-cell" );
                number.classList.add( "number" );
                number.min = 0;
                number.value = parameters.value[ id ];
                number.readOnly = parameters.readOnly;
                number.addEventListener( "keyup", change, false );
                number.addEventListener( "change", change, false );
                number.addEventListener( "keydown", listeners.prevent, false );

                element.appendChild( label );
                element.appendChild( number );

            this.controls.push( { number: number } );

            return element;
        };

        const power = function( args )
        {
            this.value.style.display = "none";

            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;
            var other = 1 - id;
            var invert = [ 3 / 4, 4 / 3 ];
            var scale = [ 1, 0.75 ];

            var change = function( e )
            {
                var el = e.target;
                var value = Math.round( Math.pow( 2, el.value ) );

                if ( parameters.value.length === 2 )
                {
                    parameters.value[ other ] = value * invert[ id ];
                }

                parameters.value[ id ] = value;
                console.log( parameters.value );

                this.update( parameters.value );
            }.bind( this );

            var element = utils.ce( "div" );
                element.classList.add( "table-row" );

            var label = utils.ce( "div" );
                label.classList.add( "number-label" );
                label.classList.add( "table-cell" );
                label.innerText = args ? args.label : "";

            // image size readonly
            var input = utils.ce( "input" );
                input.classList.add( "number" );
                input.type = "number"
                input.readOnly = true;
                input.value = parameters.value[ id ];
            var div1 = utils.ce( "div" );
                div1.classList.add( "table-cell" );
                div1.classList.add( "align-top" );
                div1.appendChild( input );

            // power of 2 range from 1024 to 4096
            var range = utils.ce( "input" );
                range.id = id;
                range.classList.add( "text" );
                range.type = "range";
                range.style.width = "80px";
                range.min = utils.exponent( Math.pow( 2, 10 ) * scale[ id ] );
                range.max = utils.exponent( Math.pow( 2, 12 ) * scale[ id ] );
                range.step = 1;
                range.dataset.name = parameters.name;
                range.value = range.min;
                range.addEventListener( "input", change, false );
            var div2 = utils.ce( "div" );
                div2.classList.add( "table-cell" );
                div2.classList.add( "align-top" );
                div2.classList.add( "h-pad" );
                div2.appendChild( range );

            // reaonly output
            var output = utils.ce( "input" );
                output.classList.add( "number" );
                output.type = "number";
                output.readOnly = parameters.readOnly;
            var div3 = utils.ce( "div" );
                div3.classList.add( "table-cell" );
                div3.classList.add( "align-top" );
                div3.appendChild( output );

            element.appendChild( label );
            element.appendChild( div1 );
            element.appendChild( div2 );
            element.appendChild( div3 );

            this.controls.push(
            {
                input: input,
                range: range,
                output: output
            } );

            return element;
        };

        // multiple power inputs
        const resize = function()
        {
            var parameters = this.settings.parameters;
            var element = utils.ce( "div" );
                element.classList.add( "table-row" );
                element.dataset.name = `${ parameters.name } inputs`;

            // render axes
            parameters.axes.forEach( ( axis, index ) =>
            {
                element.appendChild( power.call( this, { index: index, label: axis } ) );
            } );

            if ( parameters.button )
                element.appendChild( button.call( this, { label: parameters.button } ) );

            return element;
        };

        const swatch = function( args )
        {
            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;
            var element = utils.ce( "div" );
                element.classList.add( "table-row" );
            var swatch;
            var background = `url( ${ utils.transparent() } )`;

            var change = function( e )
            {
                e.preventDefault();
                e.stopPropagation();

                parameters.value = [ e.target.style.backgroundColor ];

                event = new Event( name );
                document.dispatchEvent( event );

                this.update( parameters.value );
            }.bind( this );

            // render element
            parameters.colors.forEach( ( color ) =>
            {
                swatch = utils.ce( "div" );
                swatch.id = id;
                swatch.classList.add( "table-cell" );
                swatch.classList.add( "thirty-two" );
                swatch.classList.add( "pointer" );
                swatch.style.backgroundColor = color;
                swatch.style.backgroundImage = ( color === "transparent" ) ? background : "none";
                swatch.addEventListener( "click", change, false );

                this.controls.push( swatch );

                element.appendChild( swatch );
            } );

            return element;
        };

        const text = function( args )
        {
            this.value.style.display = "none";

            var parameters = this.settings.parameters;
            var id = ( args && args.hasOwnProperty( "index" ) ) ? args.index : 0;

            var change = function( e )
            {
                var el = e.target;
                var value = el.value;

                if ( e.key == "Enter" )
                {
                    parameters.action.call( this, value );
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                parameters.value[ id ] = value;

                this.update( parameters.value );
            }.bind( this );

            var element = utils.ce( "div" );
                element.classList.add( "table-row" );
            var text = utils.ce( "input" );
                text.id = id;
                text.classList.add( "text" );
                text.classList.add( "table-cell" );
                text.value = parameters.value[ id ];
                text.readOnly = parameters.readOnly;
                text.placeholder = parameters.placeholder ? parameters.placeholder : null;
                text.addEventListener( "keyup", change, false );

            this.controls.push( { text: text } );

            element.appendChild( text );

            return element;
        };

        // multiple number inputs
        const vector = function()
        {
            var parameters = this.settings.parameters;
            var element = utils.ce( "div" );
                element.classList.add( "table-row" );

            // render axes
            parameters.axes.forEach( ( axis, index ) =>
            {
                element.appendChild( number.call( this, { index: index, label: axis } ) );
            } );

            if ( parameters.button )
                element.appendChild( button.call( this, { label: parameters.button } ) );

            return element;
        };

        return {
            array: array,
            button: button,
            dimensions: dimensions,
            number: number,
            power: power,
            resize: resize,
            swatch: swatch,
            text: text,
            vector: vector
        };
    } )();

    // ui output
    const output = ( function()
    {
        const console = ( function()
        {
            var console = utils.ce( "div" );
                console.classList.add( "console" );

            utils.ac( document.body, console );

            return console;
        } )();

        const preview = ( function()
        {
            var preview = utils.ce( "div" );
                preview.classList.add( "preview" );

            utils.ac( document.body, preview );

            return preview;
        } )();

        const outline = ( function()
        {
            var outline = utils.ce( "div" );
                outline.classList.add( "outline" );

            utils.ac( preview,outline );

            return outline;
        } )();

        // called from run();
        const cell = function( data, id )
        {
            var a = utils.ce( "a" );
            var cell = utils.ce( "div" );
                cell.classList.add( "cell" );
                cell.style.justifySelf = utils.map( id ).justify;
                cell.style.alignSelf = utils.map( id ).align;
                cell.width = display.width / 4 + px;
                cell.height = display.height / 3 + px;
            // new canvas for unsized image
            var canvas = utils.ce( "canvas" );
                canvas.width = ctx.canvas.width / 4;
                canvas.height = ctx.canvas.height / 3;
            var context = canvas.getContext( "2d" );
                context.clearRect( 0, 0, canvas.width, canvas.height );
                context.putImageData( data, 0, 0 );
            // copy canvas to new image for scaling
            var image = utils.scale( canvas, "fit" );
                image.id = id;
                image.menu = "Cell";
                image.style.justifySelf = utils.map( id ).justify;
                image.style.alignSelf = utils.map( id ).align;
                image.addEventListener( "contextmenu", listeners.contextmenu, false );

            ui.outline.update( [ "transparent" ] );

            utils.ac( a, image );
            utils.ac( cell, a );
            utils.ac( output.panels, cell );

            return cell;
        };

        const contextmenu = ( function()
        {
            var contextmenu = utils.ce( "div" );
                contextmenu.classList.add( "contextmenu" );

            utils.ac( document.body, contextmenu );

            return contextmenu;
        } )();

        const guides = ( function()
        {
            var guides = utils.ce( "div" );                
                guides.classList.add( "guides" );

            var horizontal = utils.ce( "div" );
                horizontal.classList.add( "horizontal" );

            var vertical = utils.ce( "div" );
                vertical.classList.add( "vertical" );

            utils.ac( guides, horizontal );
            utils.ac( guides, vertical );
            utils.ac( outline, guides );

            return guides;
        } )();

        const message = ( function()
        {
            var message = utils.ce( "div" );
                message.classList.add( "message" );

            utils.ac( document.body, message );

            return message;
        } )();

        const panels = ( function()
        {
            var panels = utils.ce( "div" );
                panels.classList.add( "grid" );
                panels.classList.add( "panels" );
                panels.addEventListener( "keydown", listeners.outline, false );
                panels.addEventListener( "scroll", listeners.scroll, false );

            utils.ac( preview, panels );

            return panels;
        } )();

        const zoom = ( function()
        {
            var zoom = utils.ce( "div" );
                zoom.classList.add( "zoom" );

            utils.ac( document.body, zoom );

            return zoom;
        } )();

        return {
            cell: cell,
            console: console,
            contextmenu: contextmenu,
            guides: guides,
            message: message,
            outline: outline,
            panels: panels,
            preview: preview,
            zoom: zoom
        };
    } )();

    // ui class
    const Control = function( args )
    {
        this.settings = args;
        this.settings.parameters.name = args.name;
        this.settings.parameters.value = args.value;
        this.controls = [];

        this.dispatch = function()
        {
            var event = new CustomEvent( `ui_${ args.name }`, { detail: this } );
            document.dispatchEvent( event );
        };

        this.init = function()
        {
            var element = utils.ce( "div" );
                element.classList.add( "grid" );
                element.classList.add( "control" );
                element.dataset.name = args.name;
                if ( !args.display )
                    element.classList.add( "hidden" );

            this.element = element;

            var value = utils.ce( "div" );
                value.classList.add( "value" );
                value.innerText = args.value;
            this.value = value;

            var label = utils.ce( "div" );
                label.classList.add( "label" );
                label.innerText = args.label;

            var input = args.input.call( this );

            utils.ac( element, label );
            utils.ac( element, input );
            utils.ac( element, value );
            utils.ac( output.console, element );
        };

        this.update = function( array )
        {
            this.settings.value = array;
            this.settings.parameters.value = array;
            this.value.innerText = JSON.stringify( array );
            this.dispatch();
        };

        this.init();
    };

    // ui controls
    const ui = ( function()
    {
        return {
            source: new Control( { name: "source", label: "Source", value: [ "/images/env/sky.png" ],
                input: inputs.text,
                display: true,
                parameters:
                {
                    action: actions.load
                } } ),
            background: new Control( { name: "background", label: "Background", value: [ "black" ],
                input: inputs.swatch,
                display: true,
                parameters:
                {
                    colors: [ "transparent", "white", "black", "red", "lime", "cyan" ]
                } } ),
            outline: new Control( { name: "outline", label: "Outline", value: [ "cyan" ],
                input: inputs.swatch,
                display: false,
                parameters:
                {
                    colors: [ "transparent", "white", "black", "red", "lime", "cyan" ]
                } } ),
            canvas: new Control( { name: "canvas", label: "Canvas Background", value: [ "" ],
                input: inputs.text,
                display: false,
                parameters:
                {
                    action: run.background,
                    readOnly: false,
                    placeholder: "press enter when done"
                } } ),
            crop: new Control( { name: "crop", label: "Crop", value: [ 0, 0, 0, 0 ],
                input: inputs.vector,
                display: false,
                parameters:
                {
                    action: run.crop,
                    axes: [ "left", "top", "right", "bottom" ],
                    button: "Crop",
                    readOnly: false
                } } ),

            /*
            aspect: new Control( { name: "aspect", label: "Set 4 : 3", value: [],
                input: inputs.button,
                display: false,
                parameters:
                {
                    action: run.aspect
                } } ),

            split: new Control( { name: "split", label: "Split", value: [],
                input: inputs.button,
                display: false,
                parameters:
                {
                    action: run.split
                } } ),
            dimensions: new Control( { name: "dimensions", label: "Original Size", value: [ 0, 0 ],
                input: inputs.vector,
                display: false,
                parameters:
                {
                    axes: [ "width", "height" ],
                    readOnly: true
                } } ),
            resize: new Control( { name: "resize", parent: console, label: "Resized", value: [ 0, 0 ],
                input: inputs.vector,
                display: false,
                parameters:
                {
                    action: null,
                    axes: [ "width", "height" ],
                    readOnly: true
                } } ),
            quantize: new Control( { name: "quantize", label: "Quantize", value: [ 0, 0 ],
                input: inputs.dimensions,
                display: false,
                parameters:
                {
                    action: actions.resize,
                    axes: [ "width", "height" ],
                    button: "Quantize",
                    readOnly: true,
                    min: 10,
                    max: 12
                } } ),*/

        };
    } )();
};