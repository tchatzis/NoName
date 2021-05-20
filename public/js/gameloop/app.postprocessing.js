QT.PostProcessing = function()
{
    this.stage.composers = {};

    var width = window.innerWidth;
    var height = window.innerHeight;
    var resolution = new THREE.Vector2( width, height );
    var enabled = 0;
    var composers = {};
        composers[ "fxaa" ] =
        {
            composer: new THREE.EffectComposer( this.stage.renderer ),
            passes:
            [
                { name: "ShaderPass", enabled: true, render: false, args: [ THREE.FXAAShader ] }
            ],
            layer: 0,
            enabled: false
        };
        composers[ "bloom" ] =
        {
            composer: new THREE.EffectComposer( this.stage.renderer ),
            passes:
            [
                { name: "RenderPass", enabled: true, render: false, args: [ this.stage.scene, this.stage.camera ] },
                { name: "UnrealBloomPass", enabled: true, render: true, args: [ resolution, 2, 1, 0.01 ] } //strength, radius, threshold
            ],
            layer: 1,
            enabled: true
        };

    for ( var name in composers )
    {
        if ( composers.hasOwnProperty( name ) )
        {
            if ( composers[ name ].enabled )
            {
                composers[ name ].passes.forEach( module =>
                {
                    if ( module.enabled )
                    {
                        var pass = new THREE[ module.name ]( ...module.args );
                            pass.renderToScreen = module.render;

                        composers[ name ].composer.addPass( pass );
                        composers[ name ].texture = composers[ name ].composer.renderTarget2.texture;
                        enabled++;
                    }
                } );

                this.stage.composers[ name ] = composers[ name ];
            }
        }
    }
};