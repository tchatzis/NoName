const Mandlebulb = function()
{
    var app = {};
    var scope = this;
    var t = 0;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.shader = "mandlebulb";

        init();
        gui();
        controls();
    };

    function controls()
    {
        app.ui.container.classList.add( "expand" );

        const isArray = ( o ) => Object.prototype.toString.call( o ) === '[object Array]';
        const isObject = ( o ) => typeof o === "object";

        function traverse( object, parent )
        {
            if ( isArray( object ) )
                traverseArray( object, parent );
            else if ( ( typeof object === 'object' ) && ( object !== null ) )
                traverseObject( object, parent );
        }

        function traverseArray( object, parent )
        {
            var f = 0;

            for ( let prop of object )
            {
                if ( isObject( prop ) )
                {
                    let folder = parent.addFolder( f++ );
                    traverse( prop, folder );
                }
                else
                {
                    parent.add( object, prop ).name( prop );
                }
            }
        }

        function traverseObject( object, parent )
        {
            var folder;

            for ( let prop in object )
            {
                if ( object.hasOwnProperty( prop ) )
                {
                    if ( isObject( object[ prop ] ) )
                    {
                        folder = parent.addFolder( prop );
                    }
                    else
                    {
                        folder = parent;
                        folder.add( object, prop ).name( prop );
                    }

                    traverse( object[ prop ], folder );
                }
            }
        }

        traverse( scope.uniforms, app.gui );
    }

    function gui()
    {
        var gui = document.getElementById( "gui" );
        if ( gui ) gui.innerHTML = null;

        app.gui = new GUI();
        app.gui.setParentElement( app.ui.container );
    }

    async function init()
    {
        const shader =
        {
            includes: {},
            params: scope.params,
            uniforms: scope.uniforms
        };

        var material = await app.shaders.load( scope.shader, shader );
        var quad = new app.textures.Quad( { name: scope.name, width: shader.uniforms.resolution.x, height: shader.uniforms.resolution.y, material: material, static: true } );

        scope.mesh = quad.mesh;
        scope.parent.add( quad.mesh );
        scope.initial = app.utils.clone( scope.uniforms );
        
        //app.arrays.functions.push( { name: scope.name, scope: scope, function: update, args: null } );
    }
    
    function update()
    {
        var u = scope.mesh.material.uniforms;
        var r = 2;

        u.camera.value.x = Math.sin( t ) * r;
        u.camera.value.z = Math.cos( t ) * r;

        t += 0.01;
    }
};