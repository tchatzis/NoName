const Shapes = function ()
{
	var app = {};
	var scope = this;
	var c = Math.PI * 2;
	var axis = [ "width", "height" ];
	var fn = [ "sin", "cos", "tan" ];
	var mod = [ "linear", "power" ];
	var a = 0.01;

	// build the gui controls from parameters
	function controls()
	{
        app.ui.container.classList.add( "expand" );

        var t = params[ scope.settings.type ];
        var options = Object.keys( Object.assign( {}, app.navigation.visited.shapes.options ) );
        var option = app.gui.add( options, options.indexOf( scope.name ), options )
            .name( "select" )
            .onChange( () =>
            {
                var select = option.domElement.firstChild;
                var name = app.navigation.previous.prop;
                var type = select.options[ select.selectedIndex ].value
                var data = { path: '/assets/' + name, name: type, type: type };
                var prop = app.samples.loaded[ name ].prop.call( app, name );
                    prop.submenu.call( prop, data );

                app.navigation.current = type;
                document.title = `${ name }/${ type }`;
            } );

		Object.keys( t ).forEach(
			axis =>
			{
				var modifiers = t[ axis ];
				var f0 = app.gui.addFolder( axis );
				f0.open();

				Object.keys( modifiers ).forEach(
					modifier =>
					{
						var props = modifiers[ modifier ];
						var f1 = f0.addFolder( modifier );
						f1.open();

						Object.keys( props ).forEach(
							prop =>
							{
								var attributes = props[ prop ];
								var control = {};

								Object.keys( attributes ).sort().reverse().forEach(
									attribute =>
									{
										if ( attribute === "value" )
										{
											control = f1.add( attributes, attribute, attributes.options )
												.name( prop )
												.onChange( scope.change );
										}
									}
								);

								[ "min", "max", "step" ].forEach(
									attribute =>
									{
										if ( control[ attribute ] && attributes.hasOwnProperty( attribute ) )
										{
											control[ attribute ]( attributes[ attribute ] );
										}
									}
								);
							}
						);
					}
				);
			}
		);

        scope.update();
	}

	// shared geometry functions
	function arc( p, axis, theta )
	{
		var output = {};

		fn.forEach( f => output[ f ] = Math[ f ]( p[ axis ].angle * theta ) / c );

		return output;
	}

	function inverse( value )
	{
		value = value || 1;

		return 1 / value;
	}

	function scale( p, x, y, z )
	{
		return new THREE.Vector3( p.width.plane * params[ scope.settings.type ].scale.axis.x.value * x, p.height.plane * params[ scope.settings.type ].scale.axis.y.value * y, p[ scope.settings.depth ].plane * params[ scope.settings.type ].scale.axis.z.value * z );
	}

	// classes
	const Settings = function ()
	{
		this.count = ( scope.geometry.parameters.widthSegments + 1 ) * ( scope.geometry.parameters.heightSegments + 1 );
		this.iterations = 2000;
		this.go = {
			width: 0,
			height: 0
		};
		this.stop = {
			width: this.iterations,
			height: this.iterations
		};
		this.rotations = 1;
		this.tick = 0;
		this.start = [];
		this.end = [];
		this.depth = "height";
		this.previous = new THREE.Vector3();
		this.type = scope.type;

		this.set = function ( name, iterations )
		{
			var temp = this.iterations;

			this.iterations = iterations;
			this[ name ] = scope.update()[ name ];
			this.iterations = temp;
		}
	};

	const Params = function ()
	{
		this.width =
		{
			angle: 0,
			center: 0,
			plane: scope.geometry.parameters.width,
			segments: scope.geometry.parameters.widthSegments
		};
		this.height =
		{
			angle: 0,
			center: 0,
			plane: scope.geometry.parameters.height,
			segments: scope.geometry.parameters.heightSegments
		};
		this.grid = new THREE.Vector2();        // grid coordinates
		this.origin = scope.parent.position.clone();   // object origin
		this.position = new THREE.Vector3();    // centered width / height in 3 dimensions
		this.offset = new THREE.Vector3();      // three dimensional vector added to origin
		this.index = 0;
	};

	const Scale = function( args )
	{
		args = args || {};
		args.x = args.x || {};
		args.y = args.y || {};
		args.z = args.z || {};

		this.axis = {};
		this.axis.x = {};
		this.axis.x.value = args.x.value || 1;
		this.axis.x.step = args.x.step || 0.1;
		this.axis.y = {};
		this.axis.y.value = args.y.value || 1;
		this.axis.y.step = args.y.step || 0.1;
		this.axis.z = {};
		this.axis.z.value = args.z.value || 1;
		this.axis.z.step = args.z.step || 0.1;
	};

	scope.init = function ( args )
	{
        Object.assign( app, this );
		Object.assign( scope, args );

        app.stage.props.children = [];

		scope.group = new THREE.Group();
		scope.group.name = scope.name;
		scope.parent.add( scope.group );

		scope.geometry = new THREE.PlaneBufferGeometry( 1, 1, 100, 100 );
		scope.mesh = new THREE.Mesh( scope.geometry, scope.material );
		scope.mesh.name = scope.name;
		scope.mesh.frustumCulled = false;
		scope.group.add( scope.mesh );

		scope.settings = new Settings();
		scope.settings.tick = scope.settings.iterations;

        var gui = document.getElementById( "gui" );
        if ( gui ) gui.innerHTML = null;

        app.gui = new GUI();
        app.gui.setParentElement( app.ui.container );

        controls();





		// if animate.bend then bend() else scope.update()

		//scope.settings.set( "start", 0 );
		//scope.settings.set( "end", scope.settings.iterations );
	};

	var params =
	{
		cylinder:
		{
			x:
			{
				arc:
				{
					axis:
					{
						value: "width",
						options: axis
					},
					fn:
					{
						value: "sin",
						options: fn
					},
					theta:
					{
						value: 1,
						step: a,
						min: 0
					}
				}
			},
			y:
			{
				arc:
				{
					axis:
					{
						value: "width",
						options: axis
					},
					fn:
					{
						value: "cos",
						options: fn
					},
					theta:
					{
						value: 1,
						step: a
					}
				}
			},
			z:
			{
				position:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					modifier:
					{
						value: "linear",
						options: mod
					},
					value:
					{
						value: 1
					}
				}
			},
			scale: new Scale()
		},
		offset:
		{
			x:
			{
				tube:
				{
					theta:
					{
						value: 1,
						step: a,
						min: 0
					},
					phi:
					{
						value: 0.5,
						step: a,
						min: 0
					}
				},
				offset:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					fn:
					{
						value: "sin",
						options: fn
					},
					scale:
					{
						value: 0.5,
						step: 0.1
					},
					shift:
					{
						value: 0.8,
						step: 0.1
					},
					theta:
					{
						value: 1,
						step: 0.1
					}
				}
			},
			y:
			{
				tube:
				{
					theta:
					{
						value: 1,
						step: a,
						min: 0
					},
					phi:
					{
						value: 0.5,
						step: a,
						min: 0
					}
				},
				offset:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					fn:
					{
						value: "sin",
						options: fn
					},
					scale:
					{
						value: 0.5,
						step: 0.1
					},
					shift:
					{
						value: 0.8,
						step: 0.1
					},
					theta:
					{
						value: 1,
						step: a,
						min: 0
					}
				}
			},
			z:
			{
				angle:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					fn:
					{
						value: "cos",
						options: fn
					},
					theta:
					{
						value: 0.33,
						step: a,
						min: 0
					},
					phi:
					{
						value: 1.5,
						step: a,
						min: 0
					}
				}
			},
			scale: new Scale()
		},
		power:
		{
			x:
			{
				position:
				{
					axis:
					{
						value: "width",
						options: axis
					},
					modifier:
					{
						value: "power",
						options: mod
					},
					value:
					{
						value: 1
					}
				}
			},
			y:
			{
				position:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					modifier:
					{
						value: "power",
						options: mod
					},
					value:
					{
						value: 1
					}
				}
			},
			z:
			{
				position:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					modifier:
					{
						value: "linear",
						options: mod
					},
					value:
					{
						value: 1
					}
				}
			},
			scale: new Scale()
		},
		sphere:
		{
			x:
			{
				tube:
				{
					theta: { value: 1 },
					phi: { value: 0.5 }
				}
			},
			y:
			{
				tube:
				{
					theta: { value: 1 },
					phi: { value: 0.5 }
				}
			},
			z:
			{
				arc:
				{
					axis:
					{
						value: "height",
						options: axis
					},
					fn:
					{
						value: "cos",
						options: fn
					},
					theta: { value: 0.5 }
				}
			},
			scale: new Scale()
		},
		torus:
		{
			x:
			{
				radius:
				{
					tube: { value: 0.5 },
					hole: { value: 2 }
				}
			},
			y:
			{
				radius:
				{
					tube: { value: 0.5 },
					hole: { value: 2 }
				}
			},
			z:
			{
				radius:
				{
					tube: { value: 0.5 }
				}
			},
			ring:
			{
				donut:
				{
					theta:
					{
						value: 1,
						step: a,
						min: a,
						max: 1
					}
				},
				tube:
				{
					theta:
					{
						value: 1,
						step: a,
						min: a,
						max: 1
					}
				}
			},
			scale: new Scale()
		},
		knot:
		{
			knot:
			{
				constants:
				{
					p: { value: 3, min: 1, step: 1 },
					q: { value: 2, min: 0, step: 1 }
				},
				radius:
				{
					tube: { value: 0.3 },
					hole: { value: 0.5, min: 0 }
				}
			},
			scale: new Scale()
		}
	};

	var modifiers =
	{
		angle: function ( p, t )
		{
			t.theta.value = t.theta.value || 1;
			t.phi.value = t.phi.value || 1;

			return Math[ t.fn.value ]( t.theta.value + p[ t.axis.value ].angle * t.phi.value ) / c;
		},
		linear: function ( p, t )
		{
			return p[ t.axis.value ].center * p[ t.axis.value ].plane / ( p[ t.axis.value ].segments ) * t.value.value;
		},
		offset: function ( p, t )
		{
			t.theta.value = t.theta.value || 1;
			t.shift.value = t.shift.value || 0;

			return arc( p, t.axis.value, t.theta.value * c )[ t.fn.value ] * t.scale.value + t.shift.value;
		},
		none: function( p, axis )
		{
			return p[ axis ].center;
		},
		power: function( p, t )
		{
			return Math.pow( p[ t.axis.value ].center + p[ t.axis.value ].segments, t.value.value ) / p[ t.axis.value ].segments;
		},
		tube: function ( p, t )
		{
			t.theta.value = t.theta.value || 1;
			t.phi.value = t.phi.value || 0.5;

			return new THREE.Vector2( arc( p, "width", t.theta.value ).sin * arc( p, "height", t.phi.value ).sin, arc( p, "width", t.theta.value ).cos * arc( p, "height", t.phi.value ).sin ).multiplyScalar( c );
		}
	};

	// general type presets
	var presets =
	{
		cylinder: function ( p )
		{
			var t = params[ scope.settings.type ];
			var x = arc( p, t.x.arc.axis.value, t.x.arc.theta.value )[ t.x.arc.fn.value ];
			var y = arc( p, t.y.arc.axis.value, t.y.arc.theta.value )[ t.y.arc.fn.value ];
			var z = modifiers.linear( p, t.z.position );

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		},
		offset: function ( p )
		{
			var t = params[ scope.settings.type ];
			var x = modifiers.tube( p, t.x.tube ).x * modifiers.offset( p, t.x.offset );
			var y = modifiers.tube( p, t.y.tube ).y * modifiers.offset( p, t.y.offset );
			var z = modifiers.angle( p, t.z.angle );

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		},
		power: function( p )
		{
			var t = params[ scope.settings.type ];
			var x = modifiers[ t.x.position.modifier.value ]( p, t.x.position );
			var y = modifiers[ t.y.position.modifier.value ]( p, t.y.position );
			var z = modifiers[ t.z.position.modifier.value ]( p, t.z.position );

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		},
		sphere: function ( p )
		{
			var t = params[ scope.settings.type ];
			var x = modifiers.tube( p, t.x.tube ).x;
			var y = modifiers.tube( p, t.y.tube ).y;
			var z = arc( p, t.z.arc.axis.value, t.z.arc.theta.value )[ t.z.arc.fn.value ];

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		},
		torus: function ( p )
		{
			var t = params[ scope.settings.type ];
			var x = ( arc( p, "height", t.ring.tube.theta.value ).cos * t.x.radius.tube.value * c + t.x.radius.hole.value ) * arc( p, "width", t.ring.donut.theta.value ).cos;
			var y = ( arc( p, "height", t.ring.tube.theta.value ).cos * t.y.radius.tube.value * c + t.y.radius.hole.value ) * arc( p, "width", t.ring.donut.theta.value ).sin;
			var z = ( arc( p, "height", t.ring.tube.theta.value ).sin * t.z.radius.tube.value );

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		},
		knot: function ( p )
		{
			var t = params[ scope.settings.type ];
			var r = new THREE.Vector3( 1, 1, arc( p, "width", t.knot.constants.q.value ).sin + 2 );
			var x = ( arc( p, "height", t.knot.constants.p.value ).cos * t.knot.radius.tube.value * c + t.knot.radius.hole.value ) * arc( p, "height", t.knot.constants.q.value ).cos;
			var y = ( arc( p, "height", t.knot.constants.p.value ).cos * t.knot.radius.tube.value * c + t.knot.radius.hole.value ) * arc( p, "height", t.knot.constants.q.value ).sin;
			var z = ( arc( p, "height", t.knot.constants.p.value ).sin * t.knot.radius.tube.value );

			return new THREE.Vector3( x, y, z ).multiply( scale( p, 1, 1, 1 ) );
		}
	};

	scope.change = function ()
	{
		//if ( params.animate.rotation.value )
		//    app.arrays.animations.push( { name: scope.name, object: scope.group, path: "rotation.y", value: 0.005 } );

		scope.update( true );
	};

	scope.update = function ( change )
	{
		var s = scope.settings;
		var p = new Params();
		var d = {
			start: [],
			end: []
		};

		for ( let i = 0; i <= p.width.segments; i++ )
		{
			p.width.angle = s.tick * c * i / ( p.width.segments * s.iterations );
			p.width.center = ( i - p.width.segments / 2 );

			for ( let j = 0; j <= p.height.segments; j++ )
			{
				p.grid.set( i, j );
				p.height.angle = s.tick * c * j / ( p.height.segments * s.iterations );
				p.height.center = ( j - p.height.segments / 2 );
				p.position.copy( new THREE.Vector3( p.width.center, p.height.center, 0 ) );
				p.offset.copy( presets[ scope.settings.type ]( p ) ).add( p.origin );

				if ( !change )
				{
					d.start.push( p.position );
					d.end.push( p.offset );
				}

				app.utils.attributes.set( scope.geometry, "position", p.index, p.offset );

				p.index++;
			}
		}

		if ( !change )
		{
			s.tick++;
		}

		return d;
	};

	function bend( callback )
	{
		if ( scope.settings.tick <= scope.settings.iterations * scope.settings.rotations )
		{
			scope.update();
			setTimeout( bend, scope.settings.iterations / 1000 );
		}
		else
		{
			scope.settings.tick = 0;

			if ( callback )
			{
				callback();
			}
		}
	}
};