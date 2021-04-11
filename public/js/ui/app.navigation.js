const navigation = function()
{
    var scope = "navigation";
    var app = this;
        app[ scope ] = {};
    var visible = "lime";
    var timeout;

    // public
    app[ scope ].previous = { button: null, background: {}, ground: {}, prop: null };
    app[ scope ].current = null;
    app[ scope ].buttons = [];
    app[ scope ].visited = {};

    app[ scope ].stop = function()
    {
        var name = app[ scope ].previous.button;

        if ( app.raycaster ) app.raycaster.running = false;
        if ( app.path )      app.path.running = false;

        if ( app.ammo )     app.ammo.stop();
        if ( app.audio )    app.audio.stop();
        if ( app.emitter )  app.emitter.stop();
        if ( app.oimo )     app.oimo.stop();

        app.ui.widget.innerHTML = null;
        app.ui.widget.classList.add( "hide" );

        // remove progress bars
        document.querySelectorAll( "[data-progress]" ).forEach( progress =>
        {
            progress.remove();
        } );

        app.arrays.videos.forEach( video =>
        {
            video.currentTime = 0;
            video.pause();
        } );

        app.arrays.videos = [];

        if ( name )
        {
            app.controls.active[ name ] = false;
            app.kill( app.arrays.animations, name );
            app.kill( app.arrays.functions, name );
            app.kill( app.arrays.functions, "widgets" );
        }
    };

    app[ scope ].reset = function()
    {
        app[ scope ].stop();
        app.stage.props.children = [];
        app.stage.persistent.children = [];
        app.arrays.persistent.background = [];
        app.arrays.persistent.ground = [];
        app.arrays.persistent.functions = [];
    };

    app[ scope ].replay = function()
    {
        app[ scope ].buttons.forEach( item =>
        {
            item.parent.classList.add( "expand" );
            item.button.click();
        } );
    };

    // data 
    var menus =
    {
        properties:         new Data( { label: "property explorer", id: "properties",  permanent: true,  control: true, class: "tab", action: expand, data: {
            db:             new Data( { label: "app.db",                id: "db",               hud: true, control: true, class: "menu", action: dump, data: app.db } ),
            instanced:      new Data( { label: "app.instanced",         id: "instanced",        hud: true, control: true, class: "menu", action: instanced, data: null } ),
            lipstick:       new Data( { label: "app.lipstick",          id: "lipstick",         hud: true, control: true, class: "menu", action: dump, data: app.lipstick } ),
            path:           new Data( { label: "app.path",              id: "path",             hud: true, control: true, class: "menu", action: dump, data: app.path } ),
            patterns:       new Data( { label: "app.patterns",          id: "patterns",         hud: true, control: true, class: "menu", action: dump, data: app.patterns } ),
            persexpl:       new Data( { label: "app.persistent",        id: "persexpl",         hud: true, control: true, class: "menu", action: dump, data: app.persistent } ),
            raycaster:      new Data( { label: "app.raycaster",         id: "raycaster",        hud: true, control: true, class: "menu", action: dump, data: app.raycaster } ),
            trajectory:     new Data( { label: "app.trajectory",        id: "trajectory",       hud: true, control: true, class: "menu", action: dump, data: app.trajectory } ),
            textures:       new Data( { label: "app.textures",          id: "textures",         hud: true, control: true, class: "menu", action: dump, data: app.textures } ),
            utils:          new Data( { label: "app.utils",             id: "utils",            hud: true, control: true, class: "menu", action: dump, data: app.utils } )
        } } ),
        inspect:            new Data( { label: "inspect",           id: "inspect",     permanent: true,  control: true, class: "tab", action: expand, data: {
            scene:          new Data( { label: "scene children",        id: "scene",            hud: true, control: true, class: "menu", action: table, data: app.stage.scene.children } ),
            props:          new Data( { label: "props children",        id: "props",            hud: true, control: true, class: "menu", action: table, data: app.stage.props.children } ),
            persistent:     new Data( { label: "persistent children",   id: "persistent",       hud: true, control: true, class: "menu", action: table, data: app.stage.persistent.children } ),
            animations:     new Data( { label: "game loop animations",  id: "animations",       hud: true, control: true, class: "menu", action: table, data: app.arrays.animations } ),
            functions:      new Data( { label: "game loop functions",   id: "functions",        hud: true, control: true, class: "menu", action: table, data: app.arrays.functions } ),
            perfunct:       new Data( { label: "persistent functions",  id: "perfunct",         hud: true, control: true, class: "menu", action: dump,  data: app.arrays.persistent } ),
            sprites:        new Data( { label: "sprites",               id: "sprites",          hud: true, control: true, class: "menu", action: table, data: Object.values( sprites ) } ),
            textures:       new Data( { label: "textures",              id: "textures",         hud: true, control: true, class: "menu", action: table, data: Object.values( app.assets.textures ) } ),
            displacements:  new Data( { label: "displacement textures", id: "displacements",    hud: true, control: true, class: "menu", action: table, data: Object.values( app.assets.displacements ) } )
        } } ),
        helpers:            new Data( { label: "helpers",           id: "helpers",     permanent: true,  control: true, class: "tab", action: expand, data: new Converter( app.helpers, "switch", illuminate ) } ),
        lights:             new Data( { label: "lights",            id: "lights",      permanent: true,  control: true, class: "tab", action: expand, data: new Converter( app.stage.lights, "switch", illuminate ) } ),
        utilities:          new Data( { label: "utilities",         id: "utilities",   permanent: true,  control: true, class: "tab", action: expand, data: {
            //gui: new Data( { label: "parameters gui", id: "gui", hud: true, control: true, class: "menu", action: null, data: null } ),
            record: new Data(
            {
                label: "record",
                id: "record",
                hud: true,
                control: true,
                class: "momentary",
                action: () => app.record.init.call( this,
                {
                    name: app[ scope ].current,
                    time: 15,
                    width: 512,
                    height: 512,
                    onRecordComplete: null
                } ),
                data: null
            } ),
            playback: new Data(
            {
                label: "playback",
                id: "playback",
                hud: false,
                control: true,
                class: "menu",
                action: ( button ) => expand( button, new PlaybackData() ),
                data: null
            } ),
            stop: new Data( { label: "stop", id: "stop", class: "momentary", action: app[ scope ].stop, data: null } ),
            reset: new Data( { label: "clear sample data", id: "reset", class: "momentary", action: app[ scope ].reset, data: null } )
        } } ),
        environment:        new Data( { label: "environment",       id: "environment", permanent: false, control: true, class: "tab", action: expand, data: {
            background:     new Data( { label: "background",            id: "background", persistent: true, control: true, class: "menu", action: expand, data: new NavData( { class: "menu", action: open, data: { path: "environment/background/" }, type: "background" } ) } ),
            ground:         new Data( { label: "ground",                id: "ground",     persistent: true, control: true, class: "menu", action: expand, data: new NavData( { class: "menu", action: open, data: { path: "environment/ground/" }, type: "ground" } ) } )
        }, persistent: true } ),
        samples:            new Data( { label: "samples",           id: "samples",      permanent: false, control: true, class: "tab", action: expand, data: new NavGroups( "default" ) } ),
        //applications:       new Data( { label: "applications",      id: "applications", permanent: false, control: true, class: "tab", action: expand, data: new NavGroups( "applications" ) } ),
        replay:             new Data( { label: "replay",            id: "replay",       permanent: true,  control: true, class: "tab", action: app[ scope ].replay, data: null } )
    };

    // render tabs and containers
    new Menu( { parent: app.ui.navigation, data: menus, id: "tabs", bottom: 0, left: 0, level: 0 } );

    // constructors ///////////////////////////////////////////////////////////////////////////////
    // button data
    function Data( args )
    {
        this.label = args.label;
        this.id = args.id;
        this.class = args.class;
        this.action = args.action;
        this.data = args.data;
        this.hud = !!args.hud;
        this.control = !!args.control;
        this.permanent = !!args.permanent;
        this.persistent = !!args.persistent;
    }

    // convert app objects to switches - lights, helpers
    function Converter( object, css, action )
    {
        for ( let key in object )
        {
            if ( object.hasOwnProperty( key ) )
            {
                let o = object[ key ];
                this[ key ] = new Data( { label: o.name.replace( "_", " " ), id: o.name, control: true, class: css, action: action, data: o } );
            }
        }
    }

    // get and convert app.navigation.data
    function NavData( params )
    {
        var object = app.navdata.data;

        for ( let key in object )
        {
            if ( object.hasOwnProperty( key ) )
            {
                let o = object[ key ];
                let predicate = params.filter ? ( o.type === params.type && o.types.indexOf( params.filter ) > -1 ) : o.type === params.type;

                if ( predicate )
                {
                    this[ key ] = new Data(
                    {
                        label: o.label || key,
                        id: key,
                        hud: !!o.hud,
                        control: !!o.control,
                        class: params.class,
                        persistent: !!o.persistent,
                        action: params.action,
                        data: { path: params.data.path + key.toLowerCase(), type: params.type, name: key }
                    } );
                }
            }
        }
    }

    function NavGroups( type )
    {
        var object = app.navdata.data;
        var lastType = null;

        for ( let key in object )
        {
            if ( object.hasOwnProperty( key ) )
            {
                let o = object[ key ];

                // filter out type
                if ( o.type == type )
                {
                    o.types.forEach( t =>
                    {
                        // group the types
                        if ( lastType !== t )
                        {
                            // open immediately
                            if ( o.nosubmenu )
                                this[ key ] = new Data(
                                {
                                    label: key,
                                    id: key,
                                    hud: !!o.hud,
                                    control: !!o.control,
                                    class: "menu",
                                    persistent: !!o.persistent,
                                    action: open,
                                    data:
                                    {
                                        path: `${ t }/${ key }`,
                                        type: type,
                                        name: key
                                    }
                                } );
                            // build submenu from nav data
                            else
                                this[ key ] = new Data(
                                {
                                    label: t,
                                    id: t,
                                    hud: !!o.hud,
                                    control: !!o.control,
                                    class: "menu",
                                    persistent: !!o.persistent,
                                    action: expand,
                                    data: new NavData(
                                    {
                                        class: "menu",
                                        action: open,
                                        data:
                                        {
                                            path: `${ t }/`,
                                            type: type,
                                            name: key
                                        },
                                        type: type,
                                        filter: t
                                    } )
                                } );
                        }

                        lastType = t;
                    } );
                }
            }
        }
    }

    // turn recordings array to list items
    function PlaybackData()
    {
        for ( let r in app.record.recordings )
        {
            if ( app.record.recordings.hasOwnProperty( r ) )
            {
                this[ r ] = new Data(
                {
                    label: r,
                    id: `playback_${ r }`,
                    hud: true,
                    control: true,
                    class: "momentary",
                    action: () =>
                    {
                        var args =
                        {
                            name: "playback",
                            recording: r,
                            loop: 0,
                            debug: false,
                            hud: true,
                            target: false,
                            onPlaybackComplete: () => { app.ui.hud.innerHTML = null; app.ui.hud.classList.remove( "expand" ) }
                        };

                        new app.textures.Playback( args );
                    },
                    data: null
                } )
            }
        }
    }

    // get/set list container and populate items
    function Menu( args )
    {
        var px = "px";
        var list = { el: document.getElementById( args.id ) };

        if ( !list.el )
        {
            list = new Element( { id: args.id, class: "list", parent: args.parent } );

            for ( let item in args.data )
            {
                if ( args.data.hasOwnProperty( item ) )
                {
                    args.data[ item ].level = args.level;
                    new Button( args.data[ item ], list.el );
                }
            }
        }

        list.el.style.left   = args.left + px;
        list.el.style.bottom = args.bottom + px;
        list.el.classList.toggle( "expand" );
        list.el.setAttribute( "data-level", args.level );
    }

    // generic div creator
    function Element( args )
    {
        this.el = document.createElement( "div" );
        this.el.classList.add( args.class );
        this.el.id = args.id;

        args.parent.appendChild( this.el );
    }

    function Button( args, parent )
    {
        function click( e )
        {
            e.stopPropagation();
            e.preventDefault();

            document.title = `${ parent.id }/${ args.id }`;

            var button = e.target;

            if ( !( args.persistent || args.control ) )
                app[ scope ].stop();
            else
                button.setAttribute( "data-persistent", !!args.persistent );

            clearGUI();
            clearHUD( button );
            setNavData( button );

            args.action( button, args.data );

            setState( button );

            if ( args.hud ) hud( button );

            app[ scope ].previous.button = button.dataset.id;

            if ( !args.control )
            {
                app[ scope ].buttons[ args.level ] = { args: args, button: button, level: args.level, parent: parent };
                // truncate array to length of level
                app[ scope ].buttons = app[ scope ].buttons.slice( 0, args.level + 1 );
            }

            clearTimeout( timeout );
            timeout = setTimeout( hide, 10000 );
        }

        function hide()
        {
            var node = parent;

            if ( parent.id === "tabs" )
            {
                for ( let child of parent.childNodes )
                {
                    if ( child.classList.contains( "list" ) )
                        child.classList.remove( "expand" );
                }

                return;
            }

            while ( node.id !== "tabs" )
            {
                node.classList.remove( "expand" );
                node = node.parentNode;
            }
        }

        function setNavData( button )
        {
            var data = app.navdata.data[ button.dataset.id ];

            if ( data && data.camera )
            {
                app.stage.camera.position.set( ...data.camera.position );
                app.stage.camera.rotation.set( ...data.camera.rotation );

                if ( data.camera.lookat )
                    app.stage.camera.lookAt( new THREE.Vector3( ...data.camera.lookat ) );
            }
        }

        function setState( button )
        {
            var checks = [];
                checks.push( button.parentNode.children );
                checks.push( !button.classList.contains( "switch" ) );
                checks.push( !button.classList.contains( "tab" ) || !args.permanent );

            if ( checks.every( check => check ) )
            {
                let children = Array.from( button.parentNode.children );
                    children.forEach( child =>
                    {
                        if ( child.tagName == "BUTTON" )
                        {
                            let list = document.getElementById( child.dataset.id );

                            if ( button == child )
                            {
                                child.classList.add( "active" );

                                if ( list )
                                    list.classList.add( "expand" );
                            }
                            else
                            {
                                child.classList.remove( "active" );

                                if ( list )
                                    list.classList.remove( "expand" );
                            }
                        }
                    } );
            }
        }

        this.el = document.createElement( "button" );
        this.el.classList.add( args.class );
        this.el.innerText = args.label;
        this.el.setAttribute( "data-id", args.id );
        this.el.setAttribute( "data-parent", parent.id );
        this.el.setAttribute( "data-level", args.level );
        this.el.addEventListener( "click", ( e ) => click.call( this, e ), false );
        if ( args.class === "switch" ) color( this.el, args.data );

        parent.appendChild( this.el );
    }

    function Visited( data )
    {
        Object.assign( this, data );

        app[ scope ].visited[ data.name ] = { name: data.name, options: data.options, prop: data.prop };
    }

    // private functions //////////////////////////////////////////////////////////////////////////
    // clear data between samples
    function clear( name, data )
    {
        app[ scope ].current = name;

        var persistent = false;
        var checks = [];
            checks.push( data.type !== "default" );
        if ( checks.every( check => check ) )
            persistent = app[ scope ].previous[ data.type ];
            checks.push( !!persistent );
        if ( checks.every( check => check ) )
            checks.push( !!Object.keys( persistent ).length );
        if ( checks.every( check => check ) )
            clearPersistent( data.type, persistent );

            checks = [];
            checks.push( data.type === "default" );
        if ( checks.every( check => check ) )
            clearProps();

        app[ scope ].previous[ data.type ] = data.name;
    }

    function clearGUI()
    {
        var gui = document.getElementById( "gui" );
        if ( gui ) gui.innerHTML = null;
    }

    function clearHUD( button )
    {
        app.ui.hud.innerHTML = null;

        if ( button.classList.contains( "tab" ) )
            app.ui.hud.classList.remove( "expand" )
    }

    function clearPersistent( type, name )
    {
        for ( let i = app.stage.persistent.children.length - 1; i >= 0; i-- )
        {
            let child = app.stage.persistent.children[ i ];

            if ( child.name === name )
                app.stage.persistent.remove( child );

            app.arrays.persistent[ type ] = [];
            app.arrays.persistent.functions = [];
        }
    }

    function clearProps()
    {
        for ( let i = app.stage.props.children.length - 1; i >= 0; i-- )
        {
            let child = app.stage.props.children[ i ];

            if ( child.name !== app[ scope ].current )
                app.stage.props.remove( child );
        }
    }

    function clearReload()
    {
        for ( let i = app.stage.props.children.length - 1; i >= 0; i-- )
        {
            let child = app.stage.props.children[ i ];

            app.stage.props.remove( child );
        }
    }

    // border color for switch class
    function color( button, object )
    {
        button.style.borderLeft = `8px solid ${ object.visible ? convert( object.color ) : "transparent" }`;
    }

    // convert THREE.Color to web RGB
    function convert( color )
    {
        color = color || new THREE.Color( visible );

        return `rgb( ${ color.r * 255 }, ${ color.g * 255 }, ${ color.b * 255 } )`;
    }

    // object properties dump for explorer
    function dump( button, object )
    {
        var text;

        for ( var prop in object )
        {
            var row = document.createElement( "div" );
                row.classList.add( "table" );

            if ( object.hasOwnProperty( prop ) )
            {
                var key = document.createElement( "div" );
                key.classList.add( "key" );
                key.innerText = prop;

                var value = document.createElement( "div" );
                value.classList.add( "value" );

                switch ( typeof object[ prop ] )
                {
                    case "boolean":
                        text = object[ prop ];
                        value.classList.add( "boolean" );
                        break;

                    case "string":
                        text = object[ prop ];
                        break;

                    case "object":
                        if ( object[ prop ] )
                        {
                            if ( Array.isArray( object[ prop ] ) )
                            {
                                text = `[ ${ object[ prop ].length } ]`;
                                value.classList.add( "array" );
                            }
                            else
                            {
                                if ( object[ prop ].hasOwnProperty( "type" ) )
                                {
                                    text = `${ object[ prop ].type }`;
                                    if ( object[ prop ].hasOwnProperty( "name" ) && object[ prop ].name )
                                        text = text + ` "${ object[ prop ].name }"`;
                                }
                                else
                                {
                                    text = JSON.stringify( object[ prop ] );
                                    value.classList.add( "pre" );
                                    value.classList.add( "truncate" );
                                    value.addEventListener( "click", truncate, false );
                                }
                            }
                        }
                        else
                        {
                            text = object[ prop ];
                        }
                        break;

                    case "function":
                        text = object[ prop ].toString();
                        value.classList.add( "pre" );
                        value.classList.add( "truncate" );
                        value.addEventListener( "click", truncate, false );
                        break;

                    case "number":
                        text = object[ prop ];
                        value.classList.add( "number" );
                        break;

                    default:
                        console.error( prop, object, typeof object[ prop ]  );
                        break;
                }

                value.innerText = text;
                row.appendChild( key );
                row.appendChild( value );
            }

            app.ui.hud.appendChild( row );
        }
    }

    // expand menu
    function expand( button, data )
    {
        var scrollbar = 13;
        var parent = button.parentNode;
        var bottom = button.offsetHeight;
        var offset = button.classList.contains( "tab" ) ? 0 : button.offsetWidth;
        var left = parent.offsetLeft + button.offsetLeft + offset + scrollbar;
        var level = Number( parent.dataset.level ) + 1;

        new Menu( { parent: parent, id: button.dataset.id, data: data, bottom: bottom, left: left, level: level } );
    }

    // toggle HUD display
    function hud( button )
    {
        let state = button.classList.contains( "active" ) ? "add" : "remove";

        app.ui.hud.classList[ state ]( "expand" );
    }

    // toggle light visibility
    function illuminate( button, object )
    {
        object.visible = !object.visible;
        color( button, object );
    }

    // explore instanced properties
    function instanced()
    {
        var params =
        {
            name: "dump",
            size: 1,
            spacing: 0.1,
            scale: new THREE.Vector3( 1, 1, 1 ),
            shader: "instanced",
            attributes:
            {
                color:    { type: "vec3", value: new THREE.Color( 1, 1, 1 ) },
                alternate:{ type: "vec3", value: new THREE.Color( 1, 0, 0 ) },
                start:    { type: "vec3", value: new THREE.Vector3() },
                end:      { type: "vec3", value: new THREE.Vector3() },
                opaque:   { type: "float", value: 1 },
                level:    { type: "float", value: 16 },
                rotation: { type: "vec3", value: new THREE.Vector3() }
            },
            uniforms:
            {
                lightPosition:  { type: "vec3", value: app.stage.lights[ "directional" ].position },
                diffuseColor:   { type: "vec3", value: app.stage.lights[ "directional" ].color },
                specularColor:  { type: "vec3", value: new THREE.Color( 0.2, 0.2, 0.2 ) },
                time:           { type: "float", value: 0 },
                duration:       { type: "float", value: 0.25 },
                phase:          { type: "float", value: -1 },
                amplitude:      { type: "float", value: 0.5 }
            }
        };

        var instanced = new Instanced( app, params );

        dump( null, instanced );
    }

    function parent( type )
    {
        return type === "default" ? "props" : "persistent";
    }

    function submenu( name, button, options, data, prop )
    {
        let args = {};
            args.id = name;
            args.data = {};

        for ( let key in options )
        {
            if ( options.hasOwnProperty( key ) )
            {
                let option = options[ key ];
                    option.name = options[ key ].name || key;

                let label = option.name;
                    label = label.replace( /_/g, " " );

                args.data[ key ] = new Data(
                {
                    label: label,
                    id: key,
                    persistent: button.hasAttribute( "data-persistent" ),
                    class: "menu",
                    action: () => { clear( key, data ); prop.submenu( option, key ) },
                    data: data
                } );
            }
        }

        expand( button, args.data );

        app[ scope ].previous.prop = prop;
    }

    // import script
    function open( button, data )
    {
        var name = data.name.toLowerCase();

        // remove previous object of same type
        clear( name, data );

        // used for menu placement
        data.button = button;

        // this is the callback if there are submenu options
        data.options = options;

        // load script for first time
        if ( !data.loaded )
            app.samples.load( data );
        // script is already loaded
        else
        {
            let recalled = recall( name );
            let options = !!Object.keys( recalled.options ).length;

            // recall options
            if ( options )
                submenu( name, button, recalled.options, data, recalled.prop );
            // re-add prop group
            else
            {
                app.stage[ parent( data.type ) ].add( recalled.prop.group );
                clearReload();
                // invoke export prop()
                 app.samples.loaded[ name ].prop.call( app, name );//,data
            }
        }
    }

    // get the options from the imported script and build menu
    function options( imported )
    {
        var args = {};
            args.id = imported.name.toLowerCase();
            args.data = {};
        var persistent = imported.data.button.hasAttribute( "data-persistent" );
        // save the data
        new Visited( imported );

        submenu( args.id, imported.data.button, imported.options, imported.data, imported.prop );
    }

    function recall( name )
    {
        return app[ scope ].visited[ name ];
    }

    // array values dump for inspect
    function table( button, array )
    {
        array.forEach( object =>
        {
            var text;

            var row = document.createElement( "div" );
                row.classList.add( "table" );

            var key = document.createElement( "div" );
                key.classList.add( "key" );
                key.innerText = object.name;

            var value = document.createElement( "div" );
                value.classList.add( "value" );
                value.classList.add( "pre" );
                value.classList.add( "truncate" );
                value.addEventListener( "click", truncate, false );

            if ( object.image )
            {
                value.appendChild( object.image )
            }
            else if ( object.type || object.path || object.function || object.length )
            {
                text = object.type || object.path || object.function || object.length;
                value.innerText = text;
            }
            else if ( object.hasOwnProperty( "stops" ) )
            {
                object.debug = true;
                app.textures.Sprite( object );
            }
            else
            {
                console.log( object );
            }

            row.appendChild( key );
            row.appendChild( value );
            app.ui.hud.appendChild( row );
        } );
    }

    // truncate long values in dump and table
    function truncate()
    {
        this.classList.toggle( "truncate" );
    }
};