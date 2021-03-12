var options = null;

var prop = function( name )
{
    const args =
    {
        name: name,
        parent: this.stage.persistent,
        inclination: 0,     // 0 sunrise, 0.5: noon, 1 sunset, 1.5 midnight
        azimuth: 0.25,      // 0: left, 0.25: middle, 0.5 right,
        sun: false,
        speed: 0.003,
        uniforms:
        {
            turbidity: 4,
            rayleigh: 5,
            mieCoefficient: 0.001,
            mieDirectionalG: 0.968,
            luminance: 1
        }
    };

    this.stage.scene.background = null;
    
    this.props[ name ] = new Sky();
    this.props[ name ].init.call( this, args );

    return this.props[ name ];
};

export { prop, options };