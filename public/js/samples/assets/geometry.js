var options = {};

var prop = function( name )
{
    options.active =
    {
        width:
        {
            segments: 8,
            axis: "x"
        },
        height:
        {
            segments: 20,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: 8,
            spread: 4,
            diameter: 0.1
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                focus: 0
            }
        }
    };

    options.acorn =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        }
    };

    options.anvil =
    {
        width:
        {
            segments: 16,
            axis: "x"
        },
        height:
        {
            segments: 16,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1.5 },
            center: "axes",
            A: "onePlusSqrt",
            B: "onePlusSqrt"
        }
    };

    options.ashtray =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 4, y: 2, z: 4 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        }
    };

    options.auger =
    {
        width:
        {
            segments: 100,
            axis: "x"
        },
        height:
        {
            segments: 4,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 3, 0.5 ],
            scale: { x: 1, y: 0.1, z: 1 },
            center: "axes"
        }
    };

    options.barrel =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                scale: { x: 4, y: 4, z: 4 }
            }
        }
    };

    options.bell =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                scale: { x: 2, y: 4, z: 2 }
            }
        }
    };

    options.bend =
    {
        width:
        {
            segments: 10,
            axis: "z"
        },
        height:
        {
            segments: 10,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 1, 4 ],
            scale: { x: 5, y: 1, z: 5 },
            center: "axis",
            amount: 0
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                amount: 1
            }
        }
    };

    options.bulge =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: -2,
            spread: 2
        },
        animate:
        {
            frames: { count: Infinity, time: 2 },
            keys:
            {
                focus: 12
            }
        }
    };

    options.bullet =
    {
        width:
        {
            segments: 10,
            axis: "z"
        },
        height:
        {
            segments: 10,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: 0
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                focus: 10
            }
        }
    };

    options.bump =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: -2,
            spread: 2
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                focus: 12
            }
        }
    };

    options.capsule =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        }
    };

    options.carton =
    {
        width:
        {
            segments: 20,
            axis: "x"
        },
        height:
        {
            segments: 20,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 2, 2 ],
            scale: { x: 1, y: 0.5, z: 1 },
            center: "axes",
            amplitude: 0,
            time: 0
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                amplitude: 1,
                time: 10
            }
        }
    };

    options.cigar =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                scale: { x: 4, y: 1, z: 4 }
            }
        }
    };

    options.clam =
    {
        width:
        {
            segments: 36,
            axis: "x"
        },
        height:
        {
            segments: 2,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            A: "taper",
            B: "tooth"
        }
    };

    options.coil =
    {
        width:
        {
            segments: 100,
            axis: "x"
        },
        height:
        {
            segments: 6,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 3, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            diameter: 2,
            pitch: 0.1
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                pitch: 0.2
            }
        }
    };

    options.cone =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 2, y: 1, z: 2 },
            center: "axes"
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                scale: { x: 1, y: 1, z: 1 }
            }
        }
    };

    options.cross =
    {
        width:
        {
            segments: 12,
            axis: "x"
        },
        height:
        {
            segments: 12,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 2, y: 1, z: 2 },
            center: "axes",
            A: "oneMinusSqrt",
            B: "oneMinusSqrt"
        }
    };

    options.cube =
    {
        width:
        {
            segments: 8,
            axis: "x"
        },
        height:
        {
            segments: 8,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 2, y: 1, z: 2 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                scale: { x: 1, y: 2, z: 1 }
            }
        }
    };

    options.cup =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 0,
            base: 5
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                power: 3,
                base: 1
            }
        }
    };

    options.cylinder =
    {
        width:
        {
            segments: 10,
            axis: "z"
        },
        height:
        {
            segments: 10,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        }
    };

    options.dart =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 2 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                power: 0
            }
         }
    };

    options.diamond =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 2, y: 2, z: 2 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        }
    };

    options.diaphragm =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 2,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 3, y: 3, z: 1 },
            center: "axes",
            rotate: Math.PI
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                rotate: Math.PI * 2
            }
        }
    };

    options.dome =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 5, y: 5, z: 5 },
            center: "axes"
        },
        animate:
        {
            frames: { count: 100, time: 5 },
            keys:
            {
                angle: [ 0.5, 0.25 ]
            }
        }
    };

    options.dumbells =
    {
        width:
        {
            segments: 10,
            axis: "y"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 2, z: 2 },
            center: "axes",
            focus: -2,
            spread: 2
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                focus: 22
            }
        }
    };

    options.eardrum =
    {
        width:
        {
            segments: 32,
            axis: "x"
        },
        height:
        {
            segments: 8,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 0.1, z: 1 },
            center: "axes"
        }
    };

    options.fang =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2
        }
        /*animate:
         {
         frames: { count: 200, time: 10 },
         keys:
         {
         power: { from: 1, to: 2 }
         }
         }*/
    };

    options.flow =
    {
        width:
        {
            segments: 9,
            axis: "x"
        },
        height:
        {
            segments: 18,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: 0,
            spread: 3,
            diameter: 0.5
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                focus: 18
            }
        }
    };

    options.gaussian =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            base: 10,
            power: 0
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                power: 5
            }
        }
    };

    options.gear =
    {
        width:
        {
            segments: 32,
            axis: "x"
        },
        height:
        {
            segments: 3,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            A: "cap",
            B: "tooth",
            C: "flatten"
        }
    };

    options.goblet =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 2, y: 1, z: 2 },
            center: "axes",
            A: "oneMinusSqrt",
            B: "oneMinusSqrt"
        }
    };

    options.hammock =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        }
        /*animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                factor: { from: 0, to: 1 }
            }
        }*/
    };

    options.hat =
    {
        width:
        {
            segments: 10,
            axis: "z"
        },
        height:
        {
            segments: 10,
            axis: "x"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        }
        /*animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                height: { from: 0, to: 1 }
            }
        }*/
    };

    options.horn =
    {
        width:
        {
            segments: 6,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        }
    };

    options.hourglass =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 10, z: 1 },
            center: "axes",
            diameter: 2
        }
    };

    options.kink =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: -5,
            spread: 4
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                focus: 15
            }
        }
    };

    options.kiss =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2
        }
    };

    options.lamp =
    {
        width:
        {
            segments: 12,
            axis: "x"
        },
        height:
        {
            segments: 12,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2,
            A:"cbrtPowerOnePlus"
        }
    };

    options.lozenge =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            A: "sqrtOnePlus",
            B: "sqrtOnePlus"
        }
    };

    options.lump =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 2, z: 1 },
            center: "axes",
            base: 10,
            power: 8,
            focus: [ 0, -15 ]
        },
        animate:
        {
            frames: { count: 100, time: 2 },
            keys:
            {
                focus: [ 0, 15 ]
            }
        }
    };

    options.molar =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 0.3, z: 1 },
            center: "axes",
            tick: 0.01,
            loop: 0
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                loop: 1
            }
        }
    };

    options.muffler =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: 5,
            spread: 2
        }
        /*animate:
        {
            frames: { count: 200, time: 5 },
            keys:
            {
                length: { from: 1, to: 4 },
                center: { from: 0, to: 2 }
            }
        }*/
    };

    options.needle =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2
        }
    };

    options.narrow =
    {
        width:
        {
            segments: 10,
            axis: "y"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: -5,
            spread: 2,
            diameter: 2
        },
        animate:
        {
            frames: { count: 100, time: 4 },
            keys:
            {
                focus: 25
            }
        }
    };

    options.pacman =
    {
        width:
        {
            segments: 16,
            axis: "y"
        },
        height:
        {
            segments: 16,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 0.875, 0.5 ],
            scale: { x: 5, y: 5, z: 5 },
            center: "axes"
        },
        animate:
        {
            frames: { count: Infinity, time: 0.1 },
            keys:
            {
                angle: [ 1, 0.5 ]
            },
            cycle: "sin",
            speed: 10
        }
    };

    options.pill =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 4, y: 1, z: 4 },
            center: "axes"
        }
    };

    options.plane =
    {
        width:
        {
            segments: 8,
            axis: "x"
        },
        height:
        {
            segments: 8,
            axis: "z"
        },
        modifiers:
        {
            physics: "oimo",
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        },
        texture:
        {
            name: name,
            map: this.assets.textures[ "uv" ].texture,//new this.textures.Text( { name: name, debug: true, width: 256, height: 128, text: "Tito", background: "#001111", color: "white", size: 40, font: "" } ).texture,
            offset:   { animate: false, value: new THREE.Vector2( 0, 0.01 ) },
            rotation: { animate: false, value: 0.01 },
            center:   { value: new THREE.Vector2( 0.5, 0.5 ) },
            repeat:   { value: new THREE.Vector2( 1, 1 ) }
        }
    };

    options.propeller =
    {
        width:
        {
            segments: 72,
            axis: "x"
        },
        height:
        {
            segments: 2,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 4, y: 0.5, z: 4 },
            center: "axis",
            blades: 3,
            A: "cap"
        }
    };

    options.pulley =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 4,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 2, y: 1, z: 2 },
            center: "axes"
        }
    };

    options.ripple =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            tick: -0.01,
            loop: 0
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                loop: 1
            }
        }
    };

    options.rotate =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            tick: 0.01,
            loop: 0
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                loop: 1
            }
        }
    };

    options.saucer =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 2 ],
            scale: { x: 4, y: 1, z: 4 },
            center: "axes",
            tick: 0.01,
            loop: 0
        },
        animate:
        {
            frames: { count: Infinity, time: 1 },
            keys:
            {
                loop: 1
            }
        }
    };

    options.slope =
    {
        width:
        {
            segments: 10,
            axis: "z"
        },
        height:
        {
            segments: 10,
            axis: "x"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        }
    };

    options.sphere =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 5, y: 5, z: 5 },
            center: "axes"
        }
    };

    options.spindle =
    {
        width:
        {
            segments: 12,
            axis: "x"
        },
        height:
        {
            segments: 12,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 2, y: 2, z: 2 },
            center: "axes",
            A: "onePlusSqrt",
            B: "sqrtOnePlus"
        }
    };

    options.spiral =
    {
        width:
        {
            segments: 100,
            axis: "x"
        },
        height:
        {
            segments: 4,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 3, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            diameter: 5,
            pitch: 0
        },
        animate:
        {
            frames: { count: 1000, time: 10 },
            keys:
            {
                diameter: 10,
                pitch: 0.2
            }
        }
    };

    options.spool =
    {
        width:
        {
            segments: 12,
            axis: "x"
        },
        height:
        {
            segments: 12,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2,
            A:"cbrtPowerOnePlus"
        }
    };

    options.stack =
    {
        width:
        {
            segments: 12,
            axis: "x"
        },
        height:
        {
            segments: 12,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 2 ],
            scale: { x: 5, y: 5, z: 5 },
            center: "axes",
            A: "onePlusSqrt",
            B: "sqrtOnePlus"
        }
    };

    options.tent =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 2
        }
    };

    options.top =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            A: "twoMinusSqrt"
        }
    };

    options.torus =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            diameter: 5
        }
    };

    options.tower =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 1 ],
            scale: { x: 0.05, y: 1, z: 0.05 },
            center: "axes",
            diameter: 2,
            power: 2
        },
        texture:
        {
            name: name,
            map: new this.textures.Text( { name: name, debug: false, width: 256, height: 128, text: "Tito", background: "#001111", color: "white", size: 40, font: "" } ).texture,
            offset:   { animate: true, value: new THREE.Vector2( 0, 0.01 ) },
            rotation: { animate: true, value: 0.01 },
            center:   { value: new THREE.Vector2( 0.5, 0.5 ) },
            repeat:   { value: new THREE.Vector2( 1, 1 ) }
        }
    };

    options.twist =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 4,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            tick: 0.01,
            loop: 0
        },
        animate:
        {
            frames: { count: 100, time: 10 },
            keys:
            {
                loop: 1
            }
        }
    };

    options.ufo =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            A: "twoMinusSqrt",
            B: "twoMinusSqrt"
        }
    };

    options.vortex =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.25 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            power: 1.2
        }
    };

    options.wind =
    {
        width:
        {
            segments: 100,
            axis: "z"
        },
        height:
        {
            segments: 1,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 16, 1 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes"
        },
        animate:
        {
            frames: { count: 1000, time: 10 },
            keys:
            {
                angle: [ 0, 1 ],
                scale: { x: 1, y: 10, z: 10 }
            }
        }
    };

    options.wrapper =
    {
        width:
        {
            segments: 10,
            axis: "x"
        },
        height:
        {
            segments: 10,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 1, y: 1, z: 1 },
            center: "axes",
            focus: 5,
            spread: 2
        }
    };

    options.yoyo =
    {
        width:
        {
            segments: 8,
            axis: "x"
        },
        height:
        {
            segments: 16,
            axis: "z"
        },
        modifiers:
        {
            angle: [ 1, 0.5 ],
            scale: { x: 4, y: 1, z: 4 },
            center: "axes",
            stacks: 1
        },
        animate:
        {
            frames: { count: 1000, time: 10 },
            keys:
            {
                stacks: 4
            }
        }
    };

    options.zigzag =
    {
        width:
        {
            segments: 100,
            axis: "z"
        },
        height:
        {
            segments: 1,
            axis: "y"
        },
        modifiers:
        {
            angle: [ 0, 1 ],
            scale: { x: 10, y: 1, z: 1 },
            center: "order",
            power: 2
        },
        animate:
        {
            frames: { count: 1000, time: 10 },
            keys:
            {
                angle: [ 2, 1 ]
            }
        }
    };

    const group =
    {
        name: name,
        parent: this.stage.props
    };

    this.props[ name ] = new this.presets.Group( group );
    this.props[ name ].submenu = function( option, key )
    {
        option.type = key;

        const args =
        {
            name: name,
            parent: this.stage.props,
            position: new THREE.Vector3(),
            rotation: new THREE.Vector3(),
            debug: false,
            wireframe: false,
            params: option
        };

        var geometry = new Geometry();
            geometry.init.call( this, args );

    }.bind( this );

    return this.props[ name ];
};

export { prop, options };