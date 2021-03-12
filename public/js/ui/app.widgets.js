const Widget = function()
{
    var app = {};
    var scope = this;
    var axes = [ "x", "y", "z" ];
    var components = [ "r", "g", "b" ];
    var colors = [ "red", "green", "blue" ];
    var classes = [ "circlename", "circlevalue" ];
    var circle = Math.PI * 2;
    var out = "#333";
    var label = "silver";
    var handle = 4;
    var collapsed = 21;

    scope.init = function( args )
    {
        Object.assign( app, this );

        scope.height = args.height || 0.8;
        scope.target = args.target;
        scope.parent = args.parent;
        scope.time = args.time || 50;
        scope.title = args.title;
        scope.collapsed = args.collapsed === false;
        scope.size = parseInt( find( args.parent, "width" ) );
        scope.uuid = app.utils.uuid();
        scope.hover = {};
        scope.updates = [];
        scope.linked = {};
        scope.link( args.link );

        initialize();
        scope.dimensions = dimensions();

        scope.elements = {};
        scope.elements.svg = svg( "svg" );
        scope.elements.svg.setAttribute( "width", scope.dimensions.width );

        scope.elements.div = document.createElement( "div" );
        scope.elements.div.style.width = scope.dimensions.width + "px";
        scope.elements.div.classList.add( "svglike" );

        scope.parent.classList.remove( "hide" );

        extract();
        handlers();

        scope.elements.svg.setAttribute( "height", scope.collapsed ? scope.dimensions.height : collapsed );
        scope.elements.div.style.height = scope.collapsed ? scope.dimensions.height + "px" : collapsed + "px";
        scope.elements.title.textContent = args.title;

        scope.update();
    };
    
    scope.link = function( link )
    {
        if ( link )
        {
            let widget = link.widget;
                widget.master = widget.master || {};
                widget.master[ link.property ] = !link.master;
                widget.property = link.property;

            scope.linked[ link.property ] = widget;

            if ( widget.master[ link.property ] )
                widget.link( { widget: this, property: link.property, master: widget.master[ link.property ] } );
        }
    };

    // public add listener and subsequent common listeners
    scope.listener = function ( name, type, listener, args )
    {
        scope.elements[ name ].id = `${ scope.uuid }_${ name }`;
        scope.elements[ name ].name = name;
        scope.elements[ name ].style.cursor = "pointer";
        scope.elements[ name ].addEventListener( type, ( e ) => listener( e, args ) );

        if ( Object.keys( scope.hover ).find( n => name === n ) )
        {
            scope.elements[ name ].addEventListener( "mouseover", mouseover );
            scope.elements[ name ].addEventListener( "mouseout", mouseout );
        }
    };

    scope.update = function()
    {
        scope.updates.forEach( type => scope[ type ].update() );
    };

    // component constructors
    const Components =
    {
        Button: function( group )
        {
            var process = scope.config.process;
            var id = "button";
            var hover = {};
                hover[ id ] = { out: out, over: label };

            this.group = group;

            scope[ process ].label = scope.target.value;

            this.group[ id ] =
            {
                shape: "rect",
                handlers: [ { event: "click", handler: scope[ process ].action } ],
                attributes:
                {
                    x: scope.dimensions.pad,
                    y: scope.dimensions.top,
                    rx: handle,
                    width: scope.dimensions.size - scope.dimensions.pad,
                    height: scope.dimensions.row,
                    style: `fill: ${ hover[ id ].out }; stroke: silver; stroke-width: 1; opacity: 1`,
                    "data-button": id
                }
            };
            this.group[ "label" ] =
            {
                shape: "text",
                attributes:
                {
                    x: scope.dimensions.pad * 2,
                    y: scope.dimensions.top - handle + scope.dimensions.row,
                    class: "svglabel"
                }
            };

            Object.assign( scope.hover, hover );

            add( process );
        },
        Dial: function( group )
        {
            var process = scope.config.process === "mesh" ? "rotation" : scope.config.process;
            var defs   = svg( "defs" );
            var stroke = 4;

            scope.elements.svg.appendChild( defs );

            // small radial gradient - the dot
            function gradient( i )
            {
                var stop0 = svg( "stop" );
                    stop0.setAttribute( "offset", "0%" );
                    stop0.setAttribute( "stop-color", scope[ process ].palette( i, "#FFFFFF" ) );

                var stop1 = svg( "stop" );
                    stop1.setAttribute( "offset", "90%" );
                    stop1.setAttribute( "stop-color", "black" );

                var gradient = svg( "radialGradient" );
                    gradient.id = `${ scope.uuid }_${ scope[ process ].keys[ i ] }`;
                    gradient.setAttribute( "cy", "10%" );
                    gradient.setAttribute( "r", "5%" );

                gradient.appendChild( stop0 );
                gradient.appendChild( stop1 );
                defs.appendChild( gradient );
            }

            // call gradient for each key
            for( let i = 0; i < scope[ process ].keys.length; i++ )
               gradient( i );

            this.group = group;
            this.group[ "dial" ] =
            {
                shape: "circle",
                handlers: [ { event: "dblclick", handler: scope[ process ].change }, { event: "mousedown", handler: scope[ process ].enable }, { event: "mouseup", handler: scope[ process ].disable } ],
                attributes:
                {
                    cx: scope.dimensions.center + scope.dimensions.pad,
                    cy: scope.dimensions.center + scope.dimensions.row,
                    r:  ( scope.size * 0.5 - stroke * 2 - scope.dimensions.pad ) * ( scope.radius || 1 ),
                    style: `fill: black; stroke-width: ${ stroke }; opacity: 1`
                }
            };
            [ "name", "value" ].map( ( name, i ) =>
            {
                this.group[ name ] =
                {
                    shape: "text",
                    attributes:
                    {
                        x: scope.dimensions.center + scope.dimensions.pad,
                        y: scope.dimensions.center + scope.dimensions.top + scope.dimensions.row * i,
                        class: classes[ i ]
                    }
                };
            } );

            add( process );
        },
        FPS: function( group )
        {
            var process = scope.config.process;

            this.group = group;

            var width = ( scope.dimensions.size - scope.dimensions.pad ) / scope.target.history - 1;

            for ( let i = 0; i < scope.target.history; i++ )
            {
                let value = 0;
                let height = scope.dimensions.clearance * 0.8;
                    height = clamp( height * value, 0, height );

                this.group[ `${ process }${ i }` ] =
                {
                    shape: "rect",
                    handlers: [],
                    attributes:
                    {
                        x: ( width + 1 ) * i + scope.dimensions.pad,
                        y: scope.dimensions.base - height,
                        width: width,
                        height: height,
                        style: `fill: ${ out }; opacity: 1`
                    }
                };
            }

            this.group[ process ] =
            {
                shape: "text",
                handlers: [],
                attributes:
                {
                    x: scope.dimensions.center,
                    y: scope.dimensions.row,
                    style: `fill: ${ label };`
                }
            };

            add( process );
        },
        HTMLList: function( group )
        {
            var process = scope.config.process;
            var hover = {};
            var height = collapsed;

            this.group = group;
            this.group[ "ul" ] = { shape: "ul", handlers: [], attributes: {} };

            scope[ process ].keys.map( ( data, i ) =>
            {
                height += scope.dimensions.row + 5;

                this.group[ "li" + i ] =
                {
                    shape: "li",
                    parent: "ul",
                    handlers:
                    [
                        { event: "dragstart", handler: scope[ process ].dragstart },
                        { event: "dragover", handler: scope[ process ].dragover },
                        { event: "drop", handler: scope[ process ].drop }
                    ],
                    attributes:
                    {
                        draggable: true,
                        "data-index": i
                    }
                };
                this.group[ "input" + i ] =
                {
                    shape: "input",
                    parent: "li" + i,
                    handlers: [ { event: "input", handler: ( event ) => scope.target.onLabelChange( data, event.target.value ) } ],
                    attributes:
                    {
                        type: "text",
                        size: 4,
                        value: scope.target.onLabelChange( data, data.label || String.fromCharCode( 97 + i ) ),
                        placeholder: i,
                        "data-index": i
                    }
                };
                this.group[ "button" + i ] =
                {
                    shape: "span",
                    parent: "li" + i,
                    handlers: [ { event: "click", handler: ( event ) => scope.target.onItemDelete(
                    {
                        elements: scope.elements,
                        object: scope[ process ].keys,
                        index: i,
                        target: event.target
                    } ) } ],
                    attributes:
                    {
                        style: "width: 23px; padding: 2px;",
                        innerText: "\u274e",
                        "data-index": i
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        HTMLTitle: function( group )
        {
            this.group = group;
            this.group[ "title" ] =
            {
                shape: "div",
                handlers: [ { event: "click", handler: collapse } ],
                attributes:
                {
                    style: `color: ${ label }; font-size: 1.2em; cursor: pointer;`,
                    "data-state": scope.collapsed ? 1 : 0
                }
            }
        },
        Multiple: function( group )
        {
            var process = scope.config.process;
            var hover = {};
            var height = scope.dimensions.row + scope.dimensions.pad;

            this.group = group;

            scope[ process ].label = {};

            scope[ process ].keys.map( ( name, i ) =>
            {
                var y = ( scope.dimensions.row + 2 ) * i;
                var id = `button.${ name }`;
                var state = scope[ process ].data.find( value => value === i ) ? 1 : 0;
                var text = typeof scope.target.object[ name ] === "object" ? name : scope.target.object[ name ];

                height += scope.dimensions.row + 2;
                hover[ id ] = { out: colors[ state ], over: label };

                scope[ process ].label[ i ] = [ `\u274e ${ text }`, `\u2705 ${ text }` ];

                this.group[ id ] =
                {
                    shape: "rect",
                    handlers: [ { event: "click", handler: scope[ process ].action } ],
                    attributes:
                    {
                        x: scope.dimensions.pad,
                        y: scope.dimensions.top + y,
                        rx: handle,
                        width: scope.dimensions.size - scope.dimensions.pad,
                        height: scope.dimensions.row,
                        style: `fill: ${ hover[ id ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-value": text,
                        "data-button": id,
                        "data-option": i,
                        "data-state": state
                    }
                };
                this.group[ `label.${ name }` ] =
                {
                    shape: "text",
                    attributes:
                    {
                        x: scope.dimensions.pad * 2,
                        y: scope.dimensions.top - handle + scope.dimensions.row + y,
                        class: "svglabel"
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        Object: function( group )
        {
            var process = scope.config.process;
            var hover = {};
                hover.text = { out: out, over: label };
            var height = scope.dimensions.row + scope.dimensions.pad;

            this.group = group;

            scope[ process ].keys.map( ( name, i ) =>
            {
                var y = scope.dimensions.row * i;

                height += scope.dimensions.row + 2;

                this.group[ `${ name }.text` ] =
                {
                    shape: "text",
                    handlers: [ { event: "mousedown", handler: scope[ process ].enable }, { event: "mouseup", handler: scope[ process ].disable } ],
                    attributes:
                    {
                        x: scope.dimensions.pad,
                        y: scope.dimensions.base + scope.dimensions.pad + y,
                        style: `fill: ${ label };`,
                        "data-fill": hover.text.over,
                        "data-name": name
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        Option: function( group )
        {
            var process = scope.config.process;
            var hover = {};
            var height = scope.dimensions.row + scope.dimensions.pad;

            this.group = group;

            scope[ process ].label = {};

            scope[ process ].keys.map( ( name, i ) =>
            {
                var y = ( scope.dimensions.row + 2 ) * i;
                var id = `button.${ name }`;
                var state = scope[ process ].data.find( value => value === i ) ? 1 : 0;
                var text = name;

                height += scope.dimensions.row + 2;
                hover[ id ] = { out: colors[ state ], over: label };

                scope[ process ].label[ i ] = [ `\u274e ${ text }`, `\u2705 ${ text }` ];

                this.group[ id ] =
                {
                    shape: "rect",
                    handlers: [ { event: "click", handler: scope[ process ].action } ],
                    attributes:
                    {
                        x: scope.dimensions.pad,
                        y: scope.dimensions.top + y,
                        rx: handle,
                        width: scope.dimensions.size - scope.dimensions.pad,
                        height: scope.dimensions.row,
                        style: `fill: ${ hover[ id ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-value": text,
                        "data-button": id,
                        "data-option": i,
                        "data-state": state
                    }
                };
                this.group[ `label.${ name }` ] =
                {
                    shape: "text",
                    attributes:
                    {
                        x: scope.dimensions.pad * 2,
                        y: scope.dimensions.top - handle + scope.dimensions.row + y,
                        class: "svglabel"
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        Single: function( group )
        {
            var process = scope.config.process;
            var hover = {};
            var height = scope.dimensions.row + scope.dimensions.pad;

            this.group = group;

            scope[ process ].label = {};

            scope[ process ].keys.map( ( name, i ) =>
            {
                var y = ( scope.dimensions.row + 2 ) * i;
                var id = `button.${ name }`;
                var state = scope[ process ].data.find( value => value == name ) ? 1 : 0;
                var text = typeof scope.target.object[ name ] === "object" ? name : scope.target.object[ name ];

                height += scope.dimensions.row + 2;
                hover[ id ] = { out: out, over: label };

                scope[ process ].label[ i ] = [ text, `\u25b6 ${ text }` ];

                this.group[ id ] =
                {
                    shape: "rect",
                    handlers: [ { event: "click", handler: scope[ process ].action } ],
                    attributes:
                    {
                        x: scope.dimensions.pad,
                        y: scope.dimensions.top + y,
                        rx: handle,
                        width: scope.dimensions.size - scope.dimensions.pad,
                        height: scope.dimensions.row,
                        style: `fill: ${ hover[ id ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-value": text,
                        "data-button": id,
                        "data-option": i,
                        "data-state": state
                    }
                };
                this.group[ `label.${ name }` ] =
                {
                    shape: "text",
                    attributes:
                    {
                        x: scope.dimensions.pad * 2,
                        y: scope.dimensions.top - handle + scope.dimensions.row + y,
                        class: "svglabel"
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        Title: function( group )
        {
            this.group = group;
            this.group[ "title" ] =
            {
                shape: "text",
                handlers: [ { event: "click", handler: collapse } ],
                attributes:
                {
                    x: scope.dimensions.pad,
                    y: scope.dimensions.row,
                    style: `fill: ${ label }; font-size: 1.2em; cursor: pointer;`,
                    "data-state": scope.collapsed ? 1 : 0
                }
            };
        },
        Toggle: function( group )
        {
            var process = scope.config.process;
            var hover = {};
            var height = scope.dimensions.row + scope.dimensions.pad;
            var name = scope.target.key;

            this.group = group;

            scope[ process ].label = [ `not ${ scope.target.key }`, `${ scope.target.key }` ];

            [ scope.target.key ].map( ( name, i ) =>
            {
                var y = ( scope.dimensions.row + 2 ) * i;
                var id = `button.${ name }`;
                var state = scope[ process ].data.find( value => value === i ) ? 1 : 0;
                var text = typeof scope.target.object[ name ] === "object" ? name : scope.target.object[ name ];

                height += scope.dimensions.row + 2;
                hover[ id ] = { out: colors[ state ], over: label };

                this.group[ id ] =
                {
                    shape: "rect",
                    handlers: [ { event: "click", handler: scope[ process ].action } ],
                    attributes:
                    {
                        x: scope.dimensions.pad,
                        y: scope.dimensions.top + y,
                        rx: handle,
                        width: scope.dimensions.size - scope.dimensions.pad,
                        height: scope.dimensions.row,
                        style: `fill: ${ hover[ id ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-value": text,
                        "data-button": id,
                        "data-option": i,
                        "data-state": state
                    }
                };
                this.group[ `label.${ name }` ] =
                {
                    shape: "text",
                    attributes:
                    {
                        x: scope.dimensions.pad * 2,
                        y: scope.dimensions.top - handle + scope.dimensions.row + y,
                        class: "svglabel"
                    }
                };
            } );

            scope.dimensions.height = height;

            Object.assign( scope.hover, hover );

            add( process );
        },
        UpDown: function( group )
        {
            var process = scope.config.process;
            var cols = Math.max( scope[ process ].keys.length, 3 );
            var size = scope.dimensions.size / cols - scope.dimensions.pad;

            function plot( button, x, y )
            {
                var a = { x: size / 2, y: 0 };
                var b = { x: 0, y: size };
                var c = { x: size, y: size };
                var d = { x: 0, y: 0 };
                var e = { x: size, y: 0 };
                var f = { x: size / 2, y: size };
                var points = [];

                var data =
                {
                    up:   [ a, b, c ],
                    down: [ d, e, f ]
                };

                data[ button ].forEach( point =>
                {
                    points.push( [ round( point.x + x, 1 ), round( point.y + y, 1 ) ] );
                } );

                return points.join( " " );
            }

            var buttons = [ "up", "down" ];
            var hover = {};
                hover.text = { out: out, over: label };

            this.group = group;

            scope[ process ].keys.map( ( name, i ) =>
            {
                var x = scope.dimensions.size * i / cols + scope.dimensions.pad;

                buttons.map( ( button, b ) =>
                {
                    var y = scope.dimensions.top + ( size + 2 ) * b;
                    var p = plot( button, x, y );
                    var id = `${ name }.${ button }`;

                    hover[ id ] = { out: out, over: label };

                    this.group[ id ] =
                    {
                        shape: "polygon",
                        handlers: [ { event: "click", handler: scope.updown[ button ] } ],
                        attributes:
                        {
                            points: p,
                            x: x,
                            y: y,
                            width: size,
                            height: size,
                            style: `fill: ${ hover.text.out }; stroke: ${ label }; stroke-width: 1;`,
                            "data-fill": hover.text.over,
                            "data-name": name
                        }
                    };
                } );

                this.group[ `${ name }.text` ] =
                {
                    shape: "text",
                    handlers: [ { event: "mousedown", handler: scope.updown.enable }, { event: "mouseup", handler: scope.updown.disable } ],
                    attributes:
                    {
                        x: x,
                        y: scope.dimensions.base + scope.dimensions.pad,
                        style: `fill: ${ label };`,
                        "data-fill": hover.text.over,
                        "data-name": name
                    }
                };
            } );

            Object.assign( scope.hover, hover );

            add( process );
        },
        Values: function( group )
        {
            var process = scope.config.process === "mesh" ? "position" : scope.config.process;
            var cols = Math.max( scope[ process ].keys.length, 3 );
            var hover = {};
                hover.text = { out: out, over: label };

            this.group = group;

            scope[ process ].keys.map( ( name, i ) =>
            {
                var x = scope.dimensions.size * i / cols + scope.dimensions.pad;

                this.group[ `${ name }.text` ] =
                {
                    shape: "text",
                    handlers: [ { event: "mousedown", handler: scope[ process ].enable }, { event: "mouseup", handler: scope[ process ].disable } ],
                    attributes:
                    {
                        x: x,
                        y: scope.dimensions.base + scope.dimensions.pad,
                        style: `fill: ${ label };`,
                        "data-fill": hover.text.over,
                        "data-name": name
                    }
                };
            } );

            Object.assign( scope.hover, hover );

            add( process );
        },
        Vector2: function( group )
        {
            var process = scope.config.process;
            var a = { x: 5, y: 0 };
            var b = { x: 2.5, y: 2.5 };
            var c = { x: 7.5, y: 2.5 };
            var d = { x: 10, y: 5 };
            var e = { x: 7.5, y: 7.5 };
            var f = { x: 5, y: 10 };
            var g = { x: 2.5, y: 7.5 };
            var h = { x: 0, y: 5 };

            var data =
            {
                up:    { axis: "y", points: [ a, b, c ] },
                right: { axis: "x", points: [ c, d, e ] },
                down:  { axis: "y", points: [ e, f, g ] },
                left:  { axis: "x", points: [ b, g, h ] }
            };

            var hover = {};

            this.group = group;

            Object.keys( data ).map( name =>
            {
                hover[ name ] = { out: out, over: colors[ axes.indexOf( data[ name ].axis ) ] };

                this.group[ name ] =
                {
                    shape: "polygon",
                    handlers: [ { event: "click", handler: scope[ process ].run }, { event: "mouseup", handler: scope[ process ].kill }, { event: "mousedown", handler: scope[ process ][ name ] } ],
                    attributes:
                    {
                        points: points( data[ name ].points ),
                        style: `fill: ${ hover[ name ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-axis": data[ name ].axis
                    }
                };
            } );

            Object.assign( scope.hover, hover );

            add( process );
        },
        Vector3: function( group )
        {
            var process = scope.config.process === "mesh" ? "position" : scope.config.process;
            var a = { x: 2, y: 2 };
            var b = { x: 6, y: 4 };
            var c = { x: 4, y: 5 };
            var d = { x: 0, y: 3 };
            var e = { x: 8, y: 2 };
            var f = { x: 10, y: 3 };
            var g = { x: 6, y: 5 };
            var h = { x: 4, y: 4 };
            var i = { x: 6, y: 9 };
            var j = { x: 4, y: 8 };
            var k = { x: 2, y: 7 };
            var l = { x: 0, y: 6 };
            var m = { x: 4, y: 0 };
            var n = { x: 6, y: 1 };
            var o = { x: 10, y: 6 };
            var p = { x: 8, y: 7 };

            var data =
            {
                left:     { axis: "x", points: [ a, b, c, d ] },
                down:     { axis: "y", points: [ h, g, i, j ] },
                right:    { axis: "x", points: [ b, o, p, c ] },
                forward:  { axis: "z", points: [ e, f, g, h ] },
                up:       { axis: "y", points: [ m, n, g, h ] },
                backward: { axis: "z", points: [ h, g, k, l ] }
            };

            var hover = {};

            this.group = group;

            Object.keys( data ).map( name =>
            {
                hover[ name ] = { out: out, over: colors[ axes.indexOf( data[ name ].axis ) ] };

                this.group[ name ] =
                {
                    shape: "polygon",
                    handlers: [ { event: "click", handler: scope[ process ].run }, { event: "mouseup", handler: scope[ process ].kill }, { event: "mousedown", handler: scope[ process ][ name ] } ],
                    attributes:
                    {   points: points( data[ name ].points ),
                        style: `fill: ${ hover[ name ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                        "data-axis": data[ name ].axis
                    }
                };
            } );

            Object.assign( scope.hover, hover );

            add( process );
        }
    };

    // add components to widgets
    const Display =
    {
        button: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Button( group );

            return group;
        },
        /*color: function()
        {
            var group = {};

            new RGB( group );
            new Title( group );
            new RGBValues( group );

            return group;
        },*/
        dial: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Dial( group );

            return group;
        },
        /*float: function()
        {
            var group = {};

            new Title( group );
            new Float( group );

            return group;
        },*/
        fps: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.FPS( group );

            return group;
        },
        /*hsl: function()
        {
            var group = {};

            scope.hsl.hue = new HSL( group );
            new Title( group );
            new HSLValues( group );

            return group;
        },
        integer: function()
        {
            var group = {};

            new Title( group );
            new Integer( group );

            return group;
        },*/
        list: function()
        {
            var group = {};

            new Components.HTMLTitle( group );
            new Components.HTMLList( group );

            return group;
        },
        multiple: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Multiple( group );

            return group;
        },
        mesh: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Vector3( group );
            new Components.Dial( group );
            new Components.Values( group );

            return group;
        },
        object: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Object( group );

            return group;
        },
        option: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Option( group );

            return group;
        },
        /*select: function()
        {
            var group = {};

            new Title( group );
            new Select( group );

            return group;
        },*/

        single: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Single( group );

            return group;
        },
        toggle: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Toggle( group );

            return group;
        },
        undefined: () => { throw( scope.type ) },
        updown: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.UpDown( group );

            return group;
        },
        values: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Values( group );

            return group;
        },
        vector2: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Vector2( group );
            new Components.Values( group );

            return group;
        },
        vector3: function()
        {
            var group = {};

            new Components.Title( group );
            new Components.Vector3( group );
            new Components.Values( group );

            return group;
        }
    };

    /*var Float = function( group )
    {
        var hover = {};
            hover.slider = { out: out, over: label };

        this.group = group;
        this.group.slider =
        {
            shape: "rect",
            handlers: [ { event: "mousedown", handler: scope.float.enable }, { event: "mouseup", handler: scope.float.disable } ],
            attributes:
            {
                x: scope.dimensions[0 ],
                y: scope.dimensions.top,
                width: scope.dimensions.bar,
                height: scope.dimensions.row,
                style: `fill: ${ hover.slider.out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                "data-fill": hover.slider.out,
                "data-stroke": label
            }
        };
        this.group.text =
        {
            shape: "text",
            handlers: [ { event: "mousedown", handler: scope.float.enable }, { event: "mouseup", handler: scope.float.disable } ],
            attributes:
            {
                x: scope.dimensions.bar + scope.dimensions.pad * 2,
                y: scope.dimensions.top + scope.dimensions.row,
                style: `fill: ${ label };`,
                "data-fill": hover.slider.over
            }
        };

        Object.assign( scope.hover, hover );

        add( "float" );
    };

    var ;

    var HSL = function( group )
    {
        var defs = svg( "defs" );
        var stroke = 4;
        var id = scope.uuid;
        var hover = {};
        var width = scope.dimensions.size / 6;

        scope.elements.svg.appendChild( defs );

        var gradient = function()
        {
            this.stop0 = svg( "stop" );
            this.stop0.setAttribute( "offset", "0%" );
            this.stop0.setAttribute( "stop-color", scope.hsl.convert() );

            var stop1 = svg( "stop" );
                stop1.setAttribute( "offset", "90%" );
                stop1.setAttribute( "stop-color", "black" );

            var gradient = svg( "radialGradient" );
                gradient.id = id;
                gradient.setAttribute( "cy", "10%" );
                gradient.setAttribute( "r", "5%" );

            gradient.appendChild( this.stop0 );
            gradient.appendChild( stop1 );

            defs.appendChild( gradient );
        };

        gradient.call( this );

        this.size = scope.size * 0.2;

        this.group = group;
        this.group[ "dial" ] =
        {
            shape: "circle",
            handlers: [ { event: "mousedown", handler: scope.hsl.enable }, { event: "mouseup", handler: scope.hsl.disable } ],
            attributes:
            {
                cx: this.size + scope.dimensions.pad,
                cy: scope.dimensions.base - this.size,
                r:  this.size,
                style: `fill: url( #${ id } ); stroke-width: ${ stroke }; stroke: ${ scope.hsl.convert() }, opacity: 1`,
                "data-component": "h",
                "data-fill": `url( #${ id } )`,
                "data-stroke": scope.hsl.convert()
            }
        };

        [ "name", "value" ].map( ( name, i ) =>
        {
            this.group[ name ] =
            {
                shape: "text",
                attributes:
                {
                    x: this.size + scope.dimensions.pad,
                    y: scope.dimensions.base - this.size + scope.dimensions.row * i,
                    class: classes[ i ]
                }
            };
        } );

        [ "saturation", "luminosity" ].map( ( name, i ) =>
        {
            hover[ name ] = { out: out, over: label };

            this.group[ name ] =
            {
                shape: "rect",
                handlers: [ { event: "mousedown", handler: scope.hsl.enable }, { event: "mouseup", handler: scope.hsl.disable } ],
                attributes:
                {
                    x: scope.dimensions.center + scope.dimensions.pad + ( width + scope.dimensions.pad ) * i,
                    y: scope.dimensions.bottom,
                    width: width,
                    height: scope.dimensions.clearance,
                    style: `fill: ${ hover[ name ].out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                    "data-component": name.charAt( 0 ),
                    "data-fill": hover[ name ].out,
                    "data-stroke": label
                }
            };
        } );

        Object.assign( scope.hover, hover );

        add( "hsl" );
    };

    var HSLValues = function( group )
    {
        this.group = group;

        scope.type.keys.map( ( name, i ) =>
        {
            this.group[ name ] =
            {
                shape: "text",
                handlers: [ { event: "mousedown", handler: scope.hsl.enable }, { event: "mouseup", handler: scope.hsl.disable } ],
                attributes:
                {
                    x: scope.dimensions[ i ],
                    y: scope.dimensions.bottom,
                    style: `fill: ${ label }; font-size: 1em;`,
                    "data-component": name,
                    "data-fill": label
                }
            };
        } );

        add( "hsl" );
    };
    
    var Integer = function( group )
    {
        var hover = {};
            hover.slider = { out: out, over: label };

        this.group = group;
        this.group.slider =
        {
            shape: "rect",
            handlers: [ { event: "mousedown", handler: scope.integer.enable }, { event: "mouseup", handler: scope.integer.disable } ],
            attributes:
            {
                x: scope.dimensions[0 ],
                y: scope.dimensions.top,
                width: scope.dimensions.bar,
                height: scope.dimensions.row,
                style: `fill: ${ hover.slider.out }; stroke: ${ label }; stroke-width: 1; opacity: 1`,
                "data-fill": hover.slider.out,
                "data-stroke": label
            }
        };
        this.group.text =
        {
            shape: "text",
            handlers: [ { event: "mousedown", handler: scope.integer.enable }, { event: "mouseup", handler: scope.integer.disable } ],
            attributes:
            {
                x: scope.dimensions.bar + scope.dimensions.pad * 2,
                y: scope.dimensions.top + scope.dimensions.row,
                style: `fill: ${ label };`,
                "data-fill": hover.slider.over
            }
        };

        Object.assign( scope.hover, hover );

        add( "integer" );
    };

    var RGB = function( group )
    {
        var hover = {};

        this.group = group;

        colors.map( ( name, i ) =>
        {
            hover[ name ] = { out: out, over: name };

            this.group[ name ] =
            {
                shape: "rect",
                handlers: [ { event: "mousedown", handler: scope.color.enable }, { event: "mouseup", handler: scope.color.disable } ],
                attributes:
                {
                    x: scope.dimensions[ i ],
                    y: scope.dimensions.bottom,
                    width: scope.dimensions.size / colors.length - scope.dimensions.pad,
                    height: scope.dimensions.size - scope.dimensions.row,
                    style: `fill: ${ hover[ name ].out }; stroke: silver; stroke-width: 1; opacity: 1`,
                    "data-component": name.charAt( 0 ),
                    "data-fill": hover[ name ].out
                }
            };
        } );

        Object.assign( scope.hover, hover );

        add( "color" );
    };

    var RGBValues = function( group )
    {
        this.group = group;

        components.map( ( name, i ) =>
        {
            this.group[ name ] =
            {
                shape: "text",
                handlers: [ { event: "mousedown", handler: scope.color.enable }, { event: "mouseup", handler: scope.color.disable } ],
                attributes:
                {
                    x: scope.dimensions[ i ],
                    y: scope.dimensions.bottom,
                    style: `fill: ${ label };`,
                    "data-component": name,
                    "data-fill": label
                }
            };
        } );

        add( "color" );
    };

    var Rotate = function( group )
    {
        var defs = svg( "defs" );
        var stroke = 4;

        scope.elements.svg.appendChild( defs );

        // small radial gradient
        function gradient( i )
        {
            var stop0 = svg( "stop" );
                stop0.setAttribute( "offset", "0%" );
                stop0.setAttribute( "stop-color", colors[ i ] );

            var stop1 = svg( "stop" );
                stop1.setAttribute( "offset", "90%" );
                stop1.setAttribute( "stop-color", "black" );

            var gradient = svg( "radialGradient" );
                gradient.id = `${ scope.uuid }_${ axes[ i ] }`;
                gradient.setAttribute( "cy", "10%" );
                gradient.setAttribute( "r", "5%" );

            gradient.appendChild( stop0 );
            gradient.appendChild( stop1 );
            defs.appendChild( gradient );
        }

        // call gradient for each axis
        for( let i = 0; i < axes.length; i++ )
           gradient( i );

        this.group = group;
        this.group[ "dial" ] =
        {
            shape: "circle",
            handlers: [ { event: "dblclick", handler: scope.rotate.change }, { event: "mousedown", handler: scope.rotate.enable }, { event: "mouseup", handler: scope.rotate.disable } ],
            attributes:
            {
                cx: scope.dimensions.center + scope.dimensions.pad,
                cy: scope.dimensions.center + scope.dimensions.row,
                r:  ( scope.size * 0.5 - stroke * 2 - scope.dimensions.pad ) * ( scope.radius || 1 ),
                style: `fill: black; stroke-width: ${ stroke }; opacity: 1`
            }
        };
        [ "name", "value" ].map( ( name, i ) =>
        {
            this.group[ name ] =
            {
                shape: "text",
                attributes:
                {
                    x: scope.dimensions.center + scope.dimensions.pad,
                    y: scope.dimensions.center + scope.dimensions.top + scope.dimensions.row * i,
                    class: classes[ i ]
                }
            };
        } );

        add( "rotate" );
    };

    var */

    // build the widget handlers
    const Process = function( name )
    {
        this.button = function()
        {
            scope[ name ] = {};
            Process.Methods.Button.call( scope[ name ] );
        };

        this.fps = function()
        {
            scope[ name ] = {};
            Process.Methods.FPS.call( scope[ name ] );
            Process.Methods.AutoUpdate.call( scope[ name ] );
        };

        this.list = function()
        {
            scope[ name ] =
            {
                data: { ...scope.target.value },
                dragover: prevent,
                dragstart: ( event ) =>
                {
                    if ( event.target instanceof HTMLLIElement )
                    {
                        event.dataTransfer.dropEffect = "move";
                        scope[ name ].index = Number( event.target.dataset.index );
                        scope[ name ].target = event.target;
                    }
                    else
                        prevent( event );
                },
                drop: ( event ) =>
                {
                    prevent( event );

                    var point = scope[ name ].keys[ scope[ name ].index ];

                    event.path.forEach( element =>
                    {
                        if ( element instanceof HTMLLIElement )
                        {
                            let ul = element.parentNode;
                                ul.insertBefore( scope[ name ].target, element );

                            scope[ name ].keys.splice( scope[ name ].index, 1 );
                            scope[ name ].keys.splice( Number( element.dataset.index ), 0, point );
                        }
                    } );

                    scope[ name ].update();
                },
                disable: Process.Methods.Stub,
                index: -1,
                keys: scope.target.object,
                name: name,
                target: null,
                update: () =>
                {
                    scope[ name ].keys.map( ( data, i ) =>
                    {
                        for ( let el in scope.elements )
                        {
                            if ( scope.elements.hasOwnProperty( el ) )
                            {
                                let element = scope.elements[ el ];

                                if ( el.includes( data.index ) )
                                {
                                    if ( element.dataset.hasOwnProperty( "index" ) )
                                    {
                                        element.dataset.index = i;

                                        if ( element instanceof HTMLInputElement )
                                        {
                                            element.value = data.label;
                                        }
                                    }
                                }
                            }
                        }
                    } );

                    scope.elements.div.style.height = scope.dimensions.height + "px";

                    scope.target.onItemChange();
                }
            };
        };

        this.mesh = function()
        {
            var p = scope.target.value[ "rotation" ];

            scope[ "rotation" ] =
            {
                name: "rotation",
                keys: axes,
                data: { x: p._x, y: p._y, z: p._z },
                palette: ( i, color ) => Process.Methods.palette.call( scope[ "rotation" ], i, color )
            };

            Process.Methods.Rotation.call( scope[ "rotation" ] );

            scope[ "position" ] =
            {
                action: ( e ) => Process.Methods.Action.call( scope[ "position" ], e ),
                data: { ...scope.target.value[ "position" ] },
                disable: ( e ) => Process.Methods.Disable.call( scope[ "position" ], e ),
                enable: ( e ) => Process.Methods.Enable.call( scope[ "position" ], e ),
                keys: Object.keys( scope.target.value[ "position" ] ),
                name: "position",
                palette: ( i, color ) => Process.Methods.palette.call( scope[ "position" ], i, color ),
            };

            Process.Methods.Run.call( scope[ "position" ] );
            Process.Methods.Position.call( scope[ "position" ] );
        };

        this.object = function()
        {
            scope[ name ] =
            {
                action: ( e ) => Process.Methods.Action.call( scope[ name ], e ),
                data: { ...scope.target.value },
                disable: ( e ) => Process.Methods.Disable.call( scope[ name ], e ),
                enable: ( e ) => Process.Methods.Enable.call( scope[ name ], e ),
                keys: Object.keys( scope.target.value ),
                name: name,
                update: ( e ) => Process.Methods.Object.call( scope[ name ] )
            };
        };

        this.option = function()
        {
            scope[ name ] = {};
            Process.Methods.Button.call( scope[ name ] );
            Process.Methods.Options.call( scope[ name ] );
        };

        this.position = function()
        {
            scope[ name ] =
            {
                action: ( e ) => Process.Methods.Action.call( scope[ name ], e ),
                data: scope.target.value,
                disable: ( e ) => Process.Methods.Disable.call( scope[ name ], e ),
                enable: ( e ) => Process.Methods.Enable.call( scope[ name ], e ),
                keys: Object.keys( scope.target.value ),
                name: name,
                palette: ( i, color ) => Process.Methods.palette.call( scope[ name ], i, color ),
                update: ( e ) => Process.Methods.Update.call( scope[ name ] )
            };

            Process.Methods.Run.call( scope[ name ] );
            Process.Methods.Direction.call( scope[ name ] );
        };

        this.rotation = function()
        {
            var p = scope.target.value;

            scope[ name ] =
            {
                name: name,
                keys: axes,
                data: { x: p._x, y: p._y, z: p._z },
                palette: ( i, color ) => Process.Methods.palette.call( scope[ name ], i, color )
            };

            Process.Methods.Rotation.call( scope[ name ] );
            Process.Methods.Euler.call( scope[ name ] );
        };

        this.updown = function()
        {
            scope[ name ] =
            {
                action: ( e ) => Process.Methods.Action.call( scope[ name ], e ),
                data: { ...scope.target.value },
                disable: ( e ) => Process.Methods.Disable.call( scope[ name ], e ),
                enable: ( e ) => Process.Methods.Enable.call( scope[ name ], e ),
                down: ( e ) => Process.Methods.Decrement.call( scope[ name ], e ),
                up: ( e ) => Process.Methods.Increment.call( scope[ name ], e ),
                keys: Object.keys( scope.target.value ),
                name: name,
                update: ( e ) => Process.Methods.Update.call( scope[ name ] )
            };
        };

        this.values = function()
        {
            scope[ name ] =
            {
                action: ( e ) => Process.Methods.Action.call( scope[ name ], e ),
                data: { ...scope.target.value },
                disable: ( e ) => Process.Methods.Disable.call( scope[ name ], e ),
                enable: ( e ) => Process.Methods.Enable.call( scope[ name ], e ),
                increments: { x: 0.01, y: 0.01, z: 0.01 },
                keys: Object.keys( scope.target.value ),
                name: name,
                palette: ( i, color ) => Process.Methods.palette.call( scope[ name ], i, color ),
                setValue: ( value ) => Process.Methods.SetValue.call( scope[ name ], value ),
                update: ( e ) => Process.Methods.Update.call( scope[ name ] )
            };
        };

        this[ name ].call( this );
    };

    Process.Methods =
    {
        Action: function( e )
        {
            if ( this.active )
            {
                var amount = movement( e );
                var el = this.active;
                var data = el.dataset;
                var name = data.name;

                this.index = this.keys.indexOf( name );
                this.data[ name ] += this.increments[ name ] * Math.sign( amount );
                this.active.style.fill = this.palette( this.index, "#FFFFFF" );
                this.update();
            }
        },
        AutoUpdate: function()
        {
            app.arrays.functions.push( { name: "widgets", scope: scope, function: scope.update, args: null } );
        },
        Button: function()
        {
            this.action = function( e )
            {
                switch( scope.config.display )
                {
                    case "multiple":
                        this.setData( e.target );
                    break;

                    case "option":
                    case "single":
                        this.clear();
                        this.setData( e.target );
                    break;
                }

                this.update();
            }.bind( this );

            this.clear = function()
            {
                this.data = [];
            }.bind( this );
            
            this.data = Array.isArray( scope.target.value ) ? [ ...scope.target.value ] : [ scope.target.value ];
            this.disable = Process.Methods.Stub;
            this.enable = Process.Methods.Stub;
            this.index = 0;
            this.keys = scope.target.hasOwnProperty( "object" ) ? Object.keys( scope.target.object ) : [];

            // toggle only
            this.setBoolean = function()
            {
                var predicate = this.data.every( item => item === true );

                this.data = [ !predicate ];
            }.bind( this );

            // multiple, single
            this.setCallback = function( el )
            {
                var value = el.dataset.value;

                this.data.map( name =>
                {
                    if ( name == value )
                        if ( scope.target.callback )
                        {
                            if ( Array.isArray( scope.target.object ) )
                            {
                                let value = scope.target.object.find( item => name == item );
                                let index = scope.target.object.indexOf( value );
                                scope.target.callback( { key: index, value: value, object: scope.target.object } );
                            }
                            else
                                scope.target.callback( { key: name, value: this.data, object: scope.target.object[ name ] } );
                        }
                } );
            }.bind( this );

            this.setData = function( el )
            {
                var value = el.dataset.value;
                var index = this.data.indexOf( value );

                if ( index !== -1 )
                    this.data.splice( index, 1 );
                else
                    this.data.push( value );

                this.data.sort();
            };

            // button only
            this.setHandlers = function( el )
            {
                if ( scope.target.handlers )
                    scope.target.handlers.forEach( data => el.addEventListener( data.event, data.handler, false ) );
            };
            
            this.setIndex = function( el )
            {
                this.index = parseInt( el.dataset.option );
            }.bind( this );

            this.setLabel = function( i, el, label )
            {
                switch( scope.config.display )
                {
                    case "button":
                        label.textContent = this.label;
                    break;

                    case "multiple":
                    case "option":
                    case "single":
                        label.textContent = this.label[ i ][ parseInt( el.dataset.state ) ];
                    break;

                    case "toggle":
                    default:
                        label.textContent = this.label[ parseInt( el.dataset.state ) ];
                    break;
                }
            }.bind( this );

            this.setObject = function( el )
            {
                if ( this.data.find( item => item == el.dataset.value ) )
                    switch( scope.config.display )
                    {
                        case "option":
                            Process.Methods.Set.call( this, this.keys.indexOf( this.data[ 0 ] ) );
                        break;

                        case "toggle":
                            Process.Methods.Set.call( this, !this.data.every( item => item === true ) );
                        break;
                    }
            }.bind( this );

            this.setState = function( el, state )
            {
                var out = colors[ state ];

                el.dataset.state = state;
                el.style = `fill: ${ out }; stroke: silver; stroke-width: 1; opacity: 1`;

                scope.hover[ el.dataset.button ].out = out;
            }.bind( this );

            this.setValue = function( value )
            {
                this.data = [ value ];
                this.update();
            }.bind( this );
            
            this.update = function()
            {
                var dataset = {};
                var i = 0;
                var el;
                var state;

                for ( let name in scope.elements )
                {
                    if ( scope.elements.hasOwnProperty( name ) )
                    {
                        if ( scope.elements[ name ].hasAttribute( "data-button" ) )
                        {
                            el = scope.elements[ name ];
                            dataset = button.dataset;

                            switch( scope.config.display )
                            {
                                case "button":

                                break;

                                case "multiple":
                                    state = this.data.find( item => item == el.dataset.value ) ? 1 : 0;
                                    this.setIndex( el );
                                    this.setState( el, state );
                                    this.setCallback( el );
                                break;

                                case "option":
                                    state = this.data.find( item => item == el.dataset.value ) ? 1 : 0;
                                    el.dataset.state = state;
                                    this.setIndex( el );
                                    this.setObject( el );
                                break;

                                case "single":
                                    state = this.data.find( item => item == el.dataset.value ) ? 1 : 0;
                                    el.dataset.state = state;
                                    this.setIndex( el );
                                    this.setCallback( el );
                                break; 

                                case "toggle":
                                    state = this.data.every( item => item === true ) ? 1 : 0;
                                    this.setBoolean();
                                    this.setState( el, state );
                                    this.setObject( el );
                                break;
                            }
                        }

                        if ( name.includes( "label" ) )
                        {
                            this.setLabel( i, el, scope.elements[ name ] );
                            i++;
                        }
                    }
                }
            }.bind( this );
        },
        Decrement: function( e )
        {
            var el = e.target;
            var data = el.dataset;
            var name = data.name;

            this.data[ name ] -= scope.target.increments;
            this.update();
        },
        Direction: function()
        {
            this.increments = { x: 0.01, y: 0.01, z: 0.01 };

            this.right = function()
            {
                this.data.x += this.increments.x;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.right, scope.time );
            }.bind( this );

            this.left = function()
            {
                this.data.x -= this.increments.x;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.left, scope.time );
            }.bind( this );

            this.up = function()
            {
                this.data.y += this.increments.y;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.up, scope.time );
            }.bind( this );

            this.down = function()
            {
                this.data.y -= this.increments.y;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.down, scope.time );
            }.bind( this );

            this.backward = function()
            {
                this.data.z += this.increments.z;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.backward, scope.time );
            }.bind( this );

            this.forward = function()
            {
                this.data.z -= this.increments.z;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.forward, scope.time );
            }.bind( this );
        },
        Disable: function()
        {
            if ( this.active )
                this.active.style.fill = this.active.dataset.fill;

            this.active = null;
            document.removeEventListener( "mousemove", this.action );
        },
        Enable: function( e )
        {
            this.axis = e.target.dataset.name;
            this.active = e.target;
            document.addEventListener( "mousemove", this.action );
        },
        Euler: function()
        {
            this.update = function()
            {
                this.axis = this.keys[ this.index ];

                var angle = this.data[ this.axis ];

                scope.elements.dial.dataset.name = this.axis;
                scope.elements.dial.style.stroke = this.palette( this.index, "#FFFFFF" );
                scope.elements.dial.style.fill   = `url( #${ scope.uuid }_${ this.axis } )`;
                scope.elements.dial.setAttribute( "transform", `rotate( ${ angle }, ${ scope.dimensions.center + scope.dimensions.pad }, ${ scope.dimensions.center + scope.dimensions.row } )` );

                scope.elements.name.textContent  = this.axis;
                scope.elements.value.textContent = round( angle, 0 );

                scope.target[ this.axis ] = circle * angle / 360;

                Process.Methods.Link.call( this );
            }.bind( this );
        },
        FPS: function()
        {
            this.action = function()
            {
                scope.target.values.push( scope.target.fps );

                if ( scope.target.values.length > scope.target.history )
                    scope.target.values.shift();

                scope.elements[ scope.config.process ].textContent = round( scope.target.fps, 1 );

                for ( let i = 0; i < scope.target.values.length; i++ )
                {
                    let value = scope.target.values[ i ] / scope.target.value;
                    let height = scope.dimensions.clearance * 0.7;
                        height = clamp( height * value, 0, height );
                    let fill = value < 1 ? "red" : out;

                    scope.elements[ `fps${ i }` ].setAttribute( "style", `fill: ${ fill }` );
                    scope.elements[ `fps${ i }` ].setAttribute( "y", scope.dimensions.base - height );
                    scope.elements[ `fps${ i }` ].setAttribute( "height", height );
                }
            };

            this.disable = Process.Methods.Stub;

            this.update = function()
            {
                scope.target.time = performance.now();
                scope.target.elapsed = ( scope.target.time - scope.target.last ) / 1000;

                if ( scope.target.frame > 0 && !( scope.target.frame % scope.target.samples ) )
                {
                    scope.target.fps = Math.round( scope.target.samples * 10 / scope.target.elapsed ) / 10;
                    this.action();

                    scope.target.last = scope.target.time;
                }

                scope.target.frame++;
            };
        },
        Increment: function( e )
        {
            var el = e.target;
            var data = el.dataset;
            var name = data.name;

            this.data[ name ] += scope.target.increments;
            this.update();
        },
        Link: function()
        {
            if ( scope.linked.hasOwnProperty( this.name ) )
            {
                if ( this.name === scope.linked[ this.name ].property )
                {
                    let widget = scope.linked[ this.name ];
                        widget[ this.name ].data = this.data;
                        widget[ this.name ].index = this.index;
                        widget.master[ this.name ] = !widget.master[ this.name ];

                    if ( widget.master[ this.name ] )
                        widget.update();
                }
            }
        },
        Object: function()
        {
            this.keys.forEach( key =>
            {
                scope.elements[ `${ key }.text` ].textContent = `${ key }: ${ JSON.stringify( this.data[ key ] ) }`;
                scope.target[ key ] = this.data[ key ];
            } );

            Process.Methods.Link.call( this );
        },
        Options: function()
        {
            this.data = [ scope.target.value ];
            this.index = scope.target.value;
            this.keys = Object.keys( scope.target.options );
        },
        Run: function()
        {
            this.kill = function()
            {
                this.settings.running = false;
                clearTimeout( this.settings.timeout );
            }.bind( this );

            this.run = function()
            {
                this.settings.running = true;
            }.bind( this );

            this.settings =
            {
                running: true,
                timeout: 0
            };
        },
        palette: function( i, color )
        {
            var index = this.keys.length - i - 1;
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( color );
            var component = ( c ) => parseInt( c, 16 ) * index / this.keys.length;

            return result ? `rgb( ${ component( result[ 1 ] ) }, ${ circular( 127 + component( result[ 2 ] ), 255 ) }, ${ 255 - component( result[ 3 ] ) }  )` : "rgb( 255, 255, 255 )";
        },
        Position: function()
        {
            this.increments = { x: 0.01, y: 0.01, z: 0.01 };

            this.right = function()
            {
                scope.target.object.value.translateX( this.increments.x );
                this.data.x += this.increments.x;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.right, scope.time );
            }.bind( this );

            this.left = function()
            {
                scope.target.object.value.translateX( -this.increments.x );
                this.data.x -= this.increments.x;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.left, scope.time );
            }.bind( this );

            this.up = function()
            {
                scope.target.object.value.translateY( this.increments.y );
                this.data.y += this.increments.y;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.up, scope.time );
            }.bind( this );

            this.down = function()
            {
                scope.target.object.value.translateY( -this.increments.y );
                this.data.y -= this.increments.y;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.down, scope.time );
            }.bind( this );

            this.backward = function()
            {
                scope.target.object.value.translateZ( this.increments.z );
                this.data.z += this.increments.z;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.backward, scope.time );
            }.bind( this );

            this.forward = function()
            {
                scope.target.object.value.translateZ( -this.increments.z );
                this.data.z -= this.increments.z;
                this.update();

                if ( this.settings.running )
                    this.settings.timeout = setTimeout( this.forward, scope.time );
            }.bind( this );
        },
        Rotation: function()
        {
            this.action = function( e )
            {
                if ( this.active )
                {
                    var amount = movement( e );
                    this.increment = Math.sign( amount );

                    this.data[ this.axis ] += this.increment;
                    this.data[ this.axis ] = circular( this.data[ this.axis ], 360 );
                    this.update();
                }
            }.bind( this );

            this.change = function()
            {
                this.index++;
                this.index = circular( this.index, this.keys.length );

                this.update();
            }.bind( this );

            this.disable = function()
            {
                document.removeEventListener( "mousemove", this.action );
            }.bind( this );

            this.enable = function( e )
            {
                this.axis = e.target.dataset.name;
                this.active = e.target;
                document.addEventListener( "mousemove", this.action );
            }.bind( this );

            this.increment = 0;
            this.index = 0;
            this.axis = this.keys[ this.index ];

            this.update = function()
            {
                this.axis = this.keys[ this.index ];

                var angle = this.data[ this.axis ];

                scope.elements.dial.dataset.name = this.axis;
                scope.elements.dial.style.stroke = this.palette( this.index, "#FFFFFF" );
                scope.elements.dial.style.fill   = `url( #${ scope.uuid }_${ this.axis } )`;
                scope.elements.dial.setAttribute( "transform", `rotate( ${ angle }, ${ scope.dimensions.center + scope.dimensions.pad }, ${ scope.dimensions.center + scope.dimensions.row } )` );

                scope.elements.name.textContent  = this.axis;
                scope.elements.value.textContent = round( angle, 0 );

                scope.target[ `rotate${ this.axis.toUpperCase() }` ]( circle * this.increment / 360 );

                Process.Methods.Link.call( this );
            }.bind( this );
        },
        Set: function( value )
        {
            console.log( "Process.Methods.Set", scope.target.object, value );
            scope.target.object[ scope.target.key ] = value;
        },
        SetValue: function( value )
        {
            this.data = value;
            this.update();
        },
        Standardize: function( constructor )
        {
            if ( !scope.target.hasOwnProperty( "value" ) )
                scope.target = new Widget.Converted( { object: scope.target, name: constructor } );
        },
        Stub: function()
        {

        },
        Update: function()
        {
            var object = scope.target.hasOwnProperty( "key" ) ? scope.target.object[ scope.target.key ] : scope.target.object;

            this.keys.forEach( key =>
            {
                scope.elements[ `${ key }.text` ].textContent = `${ key }: ${ round( this.data[ key ], 2 ) }`;
                object[ key ] = this.data[ key ];
            } );

            Process.Methods.Link.call( this );
        }
    };

    // add type to update
    function add( type )
    {
        // widget handlers
        if ( scope.updates.indexOf( type ) === -1 )
            scope.updates.push( type );
    }

    // reset value to start
    function circular( value, max )
    {
        if ( max <= 1 )
            return value;

        return value < 0 ? ( value % max + max ) % max : value % max;
    }

    // clamp value to range
    function clamp( value, min, max )
    {
        value = Math.max( min, value );
        value = Math.min( max, value );

        return value;
    }

    // widget collapse/expand
    function collapse( e )
    {
        var states = [ collapsed, scope.dimensions.height ];
        var state = 1 - parseInt( e.target.dataset.state );

        e.target.dataset.state = state;

        if ( scope.elements.svg )
            scope.elements.svg.setAttribute( "height", states[ state ] );

        if ( scope.elements.div )
            scope.elements.div.style.height = states[ state ] + "px";
    }

    // common widget values
    function dimensions()
    {
        var width = scope.size;
        var pad = width * 0.05;
        var rounded = width * 0.05;
        var row = 18;
        var clearance = scope.height * width;
        var height = clearance + pad * 2 + row * 2;
        var size = width - pad * 2;
        var top = row + pad;
        var right = width - pad;
        var base = height - pad - row;
        var bottom = height - pad;
        var center = size / 2;
        var bar = size * 0.7;

        return {
            0:         pad,
            1:         pad + size / 3,
            2:         pad + size * 2 / 3,
            bar:       bar,
            base:      base,
            bottom:    bottom,
            center:    center,
            clearance: clearance,
            height:    height,
            left:      pad,
            pad:       pad,
            rounded:   rounded,
            right:     right,
            row:       row,
            size:      size,
            top:       top,
            width:     width
        };
    }

    // set attributes and append to svg element and add event listeners
    function draw( name, data )
    {
        var parent;

        switch( data.shape )
        {
            case "div":
            case "input":
            case "li":
            case "span":
            case "ul":
                scope.elements[ name ] = document.createElement( data.shape );
                parent = ( data.parent ) ? scope.elements[ data.parent ] : scope.elements.div;
                parent.appendChild( scope.elements[ name ] );
                scope.parent.appendChild( scope.elements.div );
            break;

            default:
                scope.elements[ name ] = svg( data.shape );
                scope.elements.svg.appendChild( scope.elements[ name ] );
                scope.parent.appendChild( scope.elements.svg );
            break;
        }

        if ( data.handlers )
            data.handlers.forEach( listener => scope.listener( name, listener.event, listener.handler ) );

        for ( let attr in data.attributes )
        {
            if ( data.attributes.hasOwnProperty( attr ) )
            {
                scope.elements[ name ].setAttribute( attr, data.attributes[ attr ] );

                if ( attr === "data-button" )
                    scope[ scope.config.process ].setHandlers( scope.elements[ name ] );

                if ( attr === "innerText" )
                    scope.elements[ name ][ attr ] = data.attributes[ attr ];
            }
        }
    }

    // parse Display for draw
    function extract()
    {
        var obj = Display[ scope.config.display ]();

        for ( let name in obj )
        {
            if ( obj.hasOwnProperty( name ) )
            {
                let data = obj[ name ];

                draw( name, data );
            }
        }
    }

    // get style property value
    function find( el, prop )
    {
        var style = getComputedStyle( el );

        return style[ prop ];
    }

    // set up default handlers
    function handlers()
    {
        document.addEventListener( "mouseup", stop );
    }

    // copy target values to data
    // 1. add a public constructor at bottom of this script
    // 2. add the constructor name case here
    // 3. add a widget handling object in each case
    // 4. add a private component group constructor above
    // 5. add the widget configuration data up top
    function initialize()
    {
        var constructor = scope.target.constructor.name;
        var name = constructor.toLowerCase();
        var process;

        //console.log( "initialize", name );

        Process.Methods.Standardize( constructor );

        switch( constructor )
        {
            case "Button":
                process = "button";
                Process( process );

                scope.height = 0;
                scope.config = { process: process, display: name };
            break;

            /*case "Color":
                scope.color =
                {
                    action: function( e )
                    {
                        var amount = movement( e );
                        var component = scope.color.component;

                        scope.color.active.style.fill = colors[ components.indexOf( component ) ];

                        scope.color.data[ component ] += scope.color.increments[ component ] * Math.sign( amount );
                        scope.color.data[ component ] = clamp( scope.color.data[ component ], scope.color.range.min, scope.color.range.max );

                        scope.color.update();
                    },
                    data: { r: 0, g: 0, b: 0 },
                    disable: function()
                    {
                        if ( scope.color.active )
                            scope.color.active.style.fill = scope.color.active.dataset.fill;

                        scope.color.active = null;
                        scope.color.component = null;
                        document.removeEventListener( "mousemove", scope.color.action );
                    },
                    enable: function( e )
                    {
                        scope.color.active = e.target;
                        scope.color.component = e.target.dataset.component;
                        document.addEventListener( "mousemove", scope.color.action );
                    },
                    increments: { r: 0.01, g: 0.01, b: 0.01 },
                    range: { min: 0, max: 1 },
                    update: function()
                    {
                        colors.forEach( color =>
                        {
                            var component = color.charAt( 0 );
                            var value = scope.color.data[ component ] * scope.dimensions.clearance + handle;

                            scope.elements[ color ].setAttribute( "height", value );
                            scope.elements[ color ].setAttribute( "y", scope.dimensions.base - value );

                            scope.target[ component ] = scope.color.data[ component ];
                        } );

                        components.forEach( component =>
                        {
                            scope.color.data[ component ] = scope.target[ component ];
                            scope.elements[ component ].textContent = `${ component }: ${ round( scope.color.data[ component ], 3 ) }`;
                        } );
                    }
                };

                scope.color.data = scope.target;
                scope.height = 0.4;

                scope.type = { name: name, keys: components };
            break;*/

            case "Euler":
                process = "rotation";
                Process( process );

                scope.height = 0.7;
                scope.config = { process: process, display: "dial" };
            break;

            /*case "Float":
                scope.float =
                {
                    action: function( e )
                    {
                        var amount = movement( e );

                        scope.float.data += scope.target.increments * Math.sign( amount );

                        setValue( clamp( scope.float.data, scope.target.min, scope.target.max ) );

                        scope.float.active.style.fill = label;

                        scope.float.update();
                    },
                    data: 0,
                    disable: function()
                    {
                        if ( scope.float.active )
                            scope.float.active.style.fill = scope.float.active.dataset.fill;
                        scope.float.active = null;
                        document.removeEventListener( "mousemove", scope.float.action );
                    },
                    enable: function( e )
                    {
                        scope.float.active = e.target;
                        document.addEventListener( "mousemove", scope.float.action );
                    },
                    update: function()
                    {
                        scope.float.data = getValue();

                        scope.elements.slider.setAttribute( "width", ( scope.float.data - scope.target.min ) / ( scope.target.max - scope.target.min ) * scope.dimensions.bar + handle );
                        scope.elements.text.textContent = round( scope.float.data, 2 );
                    }
                };

                scope.target = scope.target.value;
                scope.float.data = scope.target;

                scope.height = 0;
                scope.type = { name: "float" };
            break;*/

            case "FPS":
                Process( name );

                scope.height = 0.2;
                scope.config = { process: name, display: name };
            break;

            /*case "HSL":
                scope.hsl =
                {
                    action: function( e )
                    {
                        var amount = movement( e );
                        var component = scope.hsl.component;
                        var value = scope.hsl.increments[ component ] * Math.sign( amount );

                        if ( scope.hsl.active.tagName === "circle" )
                        {
                            scope.hsl.data[ component ] += value * scope.torque;
                            scope.hsl.data[ "h" ] = circular( scope.hsl.data[ "h" ], 1 );
                            scope.hsl.turn();
                        }
                        else
                        {
                            scope.hsl.active.style.fill = label;

                            scope.hsl.data[ component ] += value;
                            scope.hsl.data[ component ] = clamp( scope.hsl.data[ component ], scope.hsl.range.min, scope.hsl.range.max );
                        }

                        scope.target.setHSL( ...Object.values( scope.hsl.data ) );
                        scope.hsl.update();
                    },
                    data: { h: 0, s: 0, l: 0 },
                    disable: function()
                    {
                        if ( scope.hsl.active )
                        {
                            scope.hsl.active.style.fill = scope.hsl.active.dataset.fill;
                            scope.hsl.active.style.stroke = scope.hsl.active.dataset.stroke;
                        }

                        scope.hsl.active = null;
                        scope.hsl.component = null;
                        document.removeEventListener( "mousemove", scope.hsl.action );
                    },
                    enable: function( e )
                    {
                        scope.hsl.active = e.target;
                        scope.hsl.component = e.target.dataset.component;
                        document.addEventListener( "mousemove", scope.hsl.action );
                    },
                    increments: { h: 0.001, s: 0.01, l: 0.01 },
                    range: { min: 0, max: 1 },
                    convert: function()
                    {
                        return `hsl( ${ scope.hsl.data.h * 360 }, ${ scope.hsl.data.s * 100 }%, ${ scope.hsl.data.l * 100 }% )`;
                    },
                    turn: function()
                    {
                        var angle = scope.hsl.data[ "h" ] * 360;

                        scope.elements.dial.setAttribute( "transform", `rotate( ${ angle }, ${ scope.hsl.hue.size + scope.dimensions.pad }, ${ scope.dimensions.base - scope.hsl.hue.size } )` );
                        scope.elements.value.textContent = circular( round( angle, 0 ), 360 );
                    },
                    update: function()
                    {
                        var hue = scope.hsl.convert();
                        var predicate = scope.target.equals( new THREE.Color( 1, 1, 1 ) );

                        if ( !predicate )
                            scope.target.getHSL( scope.hsl.data )
                        else
                            scope.hsl.data = { h: scope.hsl.data.h || 0, s: scope.hsl.data.s || 1, l: 1 }; // hack for 0, 0, 1

                        scope.hsl.component = scope.hsl.component || "h";
                        scope.hsl.hue.stop0.setAttribute( "stop-color", hue );
                        scope.elements.dial.style.fill     = `url( #${ scope.uuid } )`;
                        scope.elements.dial.style.stroke   = hue;
                        scope.elements.dial.dataset.stroke = hue;
                        scope.elements.name.textContent    = "h";

                        [ "saturation", "luminosity" ].forEach( component =>
                        {
                            var value = scope.hsl.data[ component.charAt( 0 ) ] * scope.dimensions.clearance + handle;

                            scope.elements[ component ].setAttribute( "height", value );
                            scope.elements[ component ].setAttribute( "y", scope.dimensions.base - value );
                        } );

                        scope.type.keys.forEach( component =>
                        {
                            scope.elements[ component ].textContent = `${ component }: ${ round( scope.hsl.data[ component ], 2 )}`;
                        } );

                        if ( scope.hsl.component === "h" )
                            scope.hsl.turn();
                    }
                };

                scope.target = scope.target.value;

                scope.height = 0.4;
                
                scope.type = { name: name, keys: Object.keys( scope.hsl.data ) };
            break;*/
            
            /*case "Integer":
                scope.integer =
                {
                    action: function( e )
                    {
                        var amount = movement( e );

                        scope.integer.data += scope.target.increments * Math.sign( amount );

                        setValue( clamp( round( scope.integer.data, 0 ), scope.target.min, scope.target.max ) );

                        scope.integer.active.style.fill = label;

                        scope.integer.update();
                    },
                    data: 0,
                    disable: function()
                    {
                        if ( scope.integer.active )
                            scope.integer.active.style.fill = scope.integer.active.dataset.fill;
                        scope.integer.active = null;
                        document.removeEventListener( "mousemove", scope.integer.action );
                    },
                    enable: function( e )
                    {
                        scope.integer.active = e.target;
                        document.addEventListener( "mousemove", scope.integer.action );
                    },
                    update: function()
                    {
                        scope.integer.data = getValue();

                        scope.elements.slider.setAttribute( "width", ( scope.target - scope.target.min ) / ( scope.target.max - scope.target.min ) * scope.dimensions.bar + handle );
                        scope.elements.text.textContent = round( scope.integer.data, 2 );
                    }
                };

                scope.target = scope.target.value;
                scope.integer.data = scope.target;

                scope.height = 0;
                scope.type = { name: name };
            break;*/

            case "List":
                Process( name );

                scope.height = 0;
                scope.config = { process: name, display: name };
            break;

            case "Mesh":
                Process( name );

                scope.radius = 0.5;
                scope.height = 0.9;
                scope.config = { process: name, display: name };
            break;

            case "Multiple":
            case "Single":
            case "Toggle":
                process = "button";
                Process( process );

                scope.height = 0;
                scope.config = { process: process, display: name };
            break;

            /*case "Select":
                scope.select =
                {
                    action: function( e )
                    {
                        var amount = movement( e );
                        var value  = Math.sign( amount );

                        scope.select.data += value / ( scope.type.keys.length * scope.torque );
                        scope.select.index = circular( Math.floor( scope.select.data ), scope.type.keys.length );
                        scope.target = scope.type.keys[ scope.select.index ];
                        scope.target.object[ scope.target.key ] = scope.select.index;

                        scope.select.update();
                    },
                    change: function()
                    {
                        scope.select.index++;
                        scope.select.index = circular( scope.select.index, scope.type.keys.length );
                        scope.target = scope.type.keys[ scope.select.index ];
                        scope.target.object[ scope.target.key ] = scope.select.index;

                        scope.select.update();
                    },
                    data: 0,
                    disable: function()
                    {
                        scope.select.axis = null;
                        document.removeEventListener( "mousemove", scope.select.action );
                    },
                    enable: function( e )
                    {
                        scope.select.axis = e.target.dataset.axis;
                        document.addEventListener( "mousemove", scope.select.action );
                    },
                    index: 0,
                    rgb: ,
                    dial: function()
                    {
                        var angle = circular( scope.select.index, scope.type.keys.length ) * 360 / scope.type.keys.length;

                        scope.elements.dial.dataset.axis = scope.select.index;
                        scope.elements.dial.style.stroke = scope.select.rgb( scope.select.index, "#FFFFFF" );
                        scope.elements.dial.setAttribute( "transform", `rotate( ${ angle }, ${ scope.dimensions.center + scope.dimensions.pad }, ${ scope.dimensions.center + scope.dimensions.row } )` );

                    },
                    update: function()
                    {
                        scope.select.index = scope.type.keys.indexOf( scope.target );
                        scope.elements.name.textContent = scope.select.index;
                        scope.elements.value.textContent = scope.target;

                        scope.select.dial();
                    }
                };

                setTarget();

                scope.height = 0.7;
                scope.type = { name: name, keys: Object.keys( scope.target.options ) };
            break;*/

            case "Object":
                process = "values";
                Process( process );

                scope.height = 0;
                scope.config = { process: process, display: name };
            break;

            case "Option":
                Process( name );

                scope.height = 0;
                scope.config = { process: name, display: name };
            break;

            case "UpDown":
                //.Methods.FromWidget();
                Process( name );

                scope.height = 0.6;
                scope.config = { process: name, display: name };
            break;


            case "Values":
                process = "values";
                Process( process );

                scope.height = 0;
                scope.config = { process: process, display: name };
            break;
            
            case "Vector2":
                process = "position"; // TODO: to values
                Process( process );

                scope.height = 1;
                scope.config = { process: process, display: name };
            break;

            case "Vector3":
                process = "position";
                Process( process );
                
                scope.height = 0.9;
                scope.config = { process: process, display: name };
            break;

            default:
                scope.height = 0;
                console.error( "undefined", constructor );
            break;
        }

        //console.log( constructor, name, scope.config, scope );
    }

    // mouse events for buttons
    function mouseout( e )
    {
        prevent( e );

        e.target.style.fill = scope.hover[ e.target.name ].out;
    }

    function mouseover( e )
    {
        prevent( e );

        e.target.style.cursor = "pointer";
        e.target.style.fill = scope.hover[ e.target.name ].over;
    }

    // normalized mouse movement
    function movement( e )
    {
        prevent( e );

        var data = [ e.movementX, -e.movementY ];
        var max = 0;
        var amount = 0;

        for( let i = 0; i < data.length; i++ )
        {
            let value = Math.abs( data[ i ] );

            if ( value > max )
            {
                max = value;
                amount = data[ i ];
            }
        }

        return amount;
    }

    // map data points to svg polygon
    function points( data )
    {
        var points = [];

        data.forEach( point =>
        {
            var size = scope.dimensions.size / 10;

            points.push( [ round( point.x * size + scope.dimensions.pad, 1 ), round( point.y * size + scope.dimensions.top, 1 ) ] );
        } );

        return points.join( " " );
    }

    // prevent event default and stop propagation
    function prevent( e )
    {
        e.preventDefault();
        e.stopPropagation();
    }

    function round( value, precision )
    {
        var exp = Math.pow( 10, precision );

        return Math.round( value * exp ) / exp;
    }

    // stop scope.translate.settings.timeouts
    function stop()
    {
        scope.updates.forEach( type =>
        {
            scope[ type ].disable();
        } );
    }

    // create SVG element
    function svg( tag )
    {
        return document.createElementNS( "http://www.w3.org/2000/svg", tag );
    }
};

Widget.Button = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Button", writeable: false } );
};

Widget.Converted = function( args )
{
    console.warn( "Converted", typeof args.object, args );

    this.value = { ...args.object };
    this.object = args.object;

    Object.defineProperty( this.__proto__.constructor, "name", { value: args.name, writeable: false } );
};

Widget.Float = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Float", writeable: false } );
};

Widget.FPS = function( args )
{
    this.elapsed = 0;
    this.fps = 0;
    this.history = args.history || 10;
    this.frame = 0;
    this.last = performance.now();
    this.samples = args.samples;
    this.time = 0;
    this.value = args.value;
    this.values = [];

    Object.defineProperty( this.__proto__.constructor, "name", { value: "FPS", writeable: false } );
};

Widget.HSL = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "HSL", writeable: false } );
};

Widget.Integer = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Integer", writeable: false } );
};

Widget.List = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "List", writeable: false } );
};

Widget.Multiple = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Multiple", writeable: false } );
};

Widget.Option = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Option", writeable: false } );
};

Widget.Select = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Select", writeable: false } );
};

Widget.Single = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Single", writeable: false } );
};

Widget.Toggle = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Toggle", writeable: false } );
};

Widget.UpDown = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "UpDown", writeable: false } );
};

Widget.Values = function( args )
{
    Object.assign( this, args );
    Object.defineProperty( this.__proto__.constructor, "name", { value: "Values", writeable: false } );
};

/*
var Text = function( args )
{
    this.input = document.createElement( "input" );
    this.input.setAttribute( "type", "text" );
    this.input.setAttribute( "name", args.name );
    this.input.setAttribute( "value", args.data[ args.key ] );
    this.input.setAttribute( "size", args.size || 10 );
    this.input.setAttribute( "placeholder", args.index );
    this.input.addEventListener( "input", function( event )
    {
        this.setAttribute( "value", event.target.value );

        args.data[ args.key ] = event.target.value;

        if ( args.callback )
            args.callback.call( this, event.target.value );
    } );
}
 */