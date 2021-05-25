import { Designer } from '../../assets/designer/designer.js';

var options = {};

var prop = function( name )
{
    var designer =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new Designer();
    this.props[ name ].init.call( this, designer );

    return this.props[ name ];
};

export { prop, options };