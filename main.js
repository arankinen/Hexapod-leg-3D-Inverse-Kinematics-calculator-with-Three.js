// Global scope variables
var renderer,
		scene,
		camera,
		stats,
		control,
		orbitcontrols,
		pathPlanningRunning = false,
		functionLineExists = false,
		
		// Leg lengths
		coxaHeight = 45,
		coxaLength = 32.5,
		femurLength = 54,
		tibiaLength = 53,

    // Servo motor PWM values
		minPWM = 150,
		maxPWM = 620,
		avgPWM = ( maxPWM + minPWM ) / 2,
		stepPWM = ( maxPWM - minPWM ) / 2,
		
		// Global object for transfering path PWM values
		path = {
			'coxaPath': [],
			'femurPath': [],
			'tibiaPath': [],
			'msStepDelay': 0,
			'steps': 0
		};

// Main initial function
function init() {

  // Create a camera, which defines where we're looking at (fov, aspect ratio, near clipping, far clipping)
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  // Position and point the camera to the center of the scene
  camera.position.x = 350;
	camera.position.y = 150;
	camera.position.z = 150;
	
  // Create a render, set the background color and the size
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xDDDDDD, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById( 'container' ).appendChild( renderer.domElement );
	
  // Create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new THREE.Scene();
	camera.lookAt( scene.position ); 
	
	// Lights
  scene.add( new THREE.AmbientLight( 0x736F6E ) );
  var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
  directionalLight.position = camera.position;
  scene.add( directionalLight );
	
	// Joint properties
	var jointGeometry = new THREE.SphereGeometry( 4, 10, 10 );
  var jointMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000, wireframe: true, specular: 0x111111, shininess: 200 } );
  
	// First joint (Coxa) at origin, Z-axis +50 mm
	var coxaJoint = new THREE.Mesh( jointGeometry, jointMaterial );
	coxaJoint.position.set( 0, coxaHeight + 5, 0 );
	coxaJoint.name = 'coxaJoint';
  scene.add( coxaJoint );

	// STL Loader
	var loader = new THREE.STLLoader();
	
	// Coxa STL
	loader.load( 'https://dl.dropboxusercontent.com/u/34383506/3d-prints/quad.stl', function ( geometry ) {
    var stlMaterial = new THREE.MeshPhongMaterial( { color: 0x176697, specular: 0x111111, shininess: 200 } );
	  var coxaMesh = new THREE.Mesh( geometry, stlMaterial );
		
		coxaMesh.position.set( 42.5, 2, 16 );
		coxaMesh.rotation.set( Math.PI, - Math.PI / 2, 0 );

	  coxaMesh.castShadow = true;
		coxaMesh.receiveShadow = true;

		// Add Coxa STL-mesh as children of Coxa joint
		coxaJoint.add( coxaMesh );
  });
	
	// Second joint (Femur) at origin, children of Coxa joint
	var femurJoint = new THREE.Mesh( jointGeometry, jointMaterial );
	femurJoint.position.set( 35, -5.5, 14.75 );
	femurJoint.name = 'femurJoint';
  coxaJoint.add( femurJoint );
	
	// First servo motor STL-mesh, children of Femur joint
	loader.load( 'https://dl.dropboxusercontent.com/u/34383506/3d-prints/servoturnigy.stl', function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xcd7612, specular: 0x111111, shininess: 200 } );
	  var mesh = new THREE.Mesh( geometry, material );
		
		mesh.position.set( -10.5, -5.5, -26.5 );
		mesh.rotation.set( Math.PI / 2, Math.PI / 2, 0 );

	  mesh.castShadow = true;
		mesh.receiveShadow = true;

		femurJoint.add( mesh );
  });
	
	// Femur STL
	loader.load( 'https://dl.dropboxusercontent.com/u/34383506/3d-prints/shin.stl', function ( geometry ) {
    var stlMaterial = new THREE.MeshPhongMaterial( { color: 0x176697, specular: 0x111111, shininess: 200 } );
	  var femurMesh = new THREE.Mesh( geometry, stlMaterial );
		
		femurMesh.position.set( 41.75, 7.5, -3 );
		femurMesh.rotation.set( 0, -Math.PI / 2, Math.PI );

	  femurMesh.castShadow = true;
		femurMesh.receiveShadow = true;

		// Add Femur STL-mesh as children of Femur joint
		femurJoint.add( femurMesh );
  });
	
	// Second servo motor STL-mesh, children of Femur joint
	loader.load( 'https://dl.dropboxusercontent.com/u/34383506/3d-prints/servoturnigy.stl', function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xcd7612, specular: 0x111111, shininess: 200 } );
	  var mesh = new THREE.Mesh( geometry, material );
		
		mesh.position.set( 64, -5.5, -7.5 );
		mesh.rotation.set( -Math.PI / 2, -Math.PI / 2, 0 );

	  mesh.castShadow = true;
		mesh.receiveShadow = true;

		femurJoint.add( mesh );
  });
	
	// Third joint (Femur) at origin, children of Coxa joint
	var tibiaJoint = new THREE.Mesh( jointGeometry, jointMaterial );
	tibiaJoint.position.set( 53.5, 0, -34 );
	tibiaJoint.name = 'tibiaJoint';
  femurJoint.add( tibiaJoint );
	
	// Tibia mesh STL, children of Tibia joint
	loader.load( 'https://dl.dropboxusercontent.com/u/34383506/3d-prints/foot.stl', function ( geometry ) {
    var stlMaterial = new THREE.MeshPhongMaterial( { color: 0x176697, specular: 0x111111, shininess: 200 } );
	  var tibiaMesh = new THREE.Mesh( geometry, stlMaterial );
		
		tibiaMesh.position.set( 53, -4.75, -1.25 );
		tibiaMesh.rotation.set( 0, - Math.PI / 2, 0 );

	  tibiaMesh.castShadow = true;
		tibiaMesh.receiveShadow = false;

		tibiaJoint.add( tibiaMesh );
  });
	
	// Build axes to help debugging (X = Red, Y = Green, Z = Blue)
	var axisHelperPositive = new THREE.AxisHelper( 300 ),
	    axisHelperNegative = new THREE.AxisHelper( -300 );
  scene.add( axisHelperPositive, axisHelperNegative );
	
	// Grid (size, step)
  var gridXZ = new THREE.GridHelper( 200, 10 );
	gridXZ.position.set( 0, 0, 0 );
  scene.add( gridXZ );
	
	// Initial dat.GUI control values
	control = new function() {
    this.handUp = true;	
		this.enablePath = false;
	
    this.xCoord = 200;
    this.yCoord = 45;
    this.zCoord = 0;
		
		this.xFunctionType = 'linear';
		this.xStart = 100;
		this.xEnd = 100;
		this.xInput = 'z';
		this.xFactorA = 0.005;
		this.xFactorB = 0;
		this.xFactorC = 20;
		
		this.yFunctionType = 'parabola';
		this.yStart = 50;
		this.yEnd = 100;
		this.yInput = 'z';
		this.yFactorA = 0.005;
		this.yFactorB = 0;
		this.yFactorC = 20;
		
		this.zFunctionType = 'linear';
		this.zStart = -200;
		this.zEnd = 200;
		this.zInput = 'x';
		this.zFactorA = 0.005;
		this.zFactorB = 0;
		this.zFactorC = 20;
		
		this.steps = 50;
		this.msStepDelay = 50;
		this.runPath = function() {
			if ( this.xFunctionType != 'linear' && this.yFunctionType != 'linear' && this.zFunctionType != 'linear' ) {
				alert( 'At least one of the functions must be LINEAR before running path planning.' );
				console.log( 'At least one of the functions must be LINEAR before running path planning.' );
			}
			
			else {
				if ( !this.enablePath ) {
				  alert( 'Please enable path planning by marking enablePath.' );
					console.log( 'Please enable path planning by marking enablePath.' );
			  }
				
			  else if ( this.enablePath && !pathPlanningRunning ) {
					pathPlanningRunning = true;
			    calculatePath( this.xFunctionType, this.xStart, this.xEnd, this.xInput, this.xFactorA, this.xFactorB, this.xFactorC,
												this.yFunctionType, this.yStart, this.yEnd, this.yInput, this.yFactorA, this.yFactorB, this.yFactorC,
												this.zFunctionType, this.zStart, this.zEnd, this.zInput, this.zFactorA, this.zFactorB, this.zFactorC,
												this.steps, this.msStepDelay );
			  }
			}
		};	
  };
  addControls( control );
	
	// Distance line
  var lineMaterial = new THREE.LineBasicMaterial( { color: 0xff022c, linewidth: 5 } ),
      lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(
	  new THREE.Vector3( coxaLength, coxaHeight, 0 ),
	  new THREE.Vector3( control.xCoord, control.yCoord, control.zCoord )
  );
	var line = new THREE.Line( lineGeometry, lineMaterial );
	line.name = 'line';
  scene.add( line );
	
  // Point sphere
	var sphereGeometry = new THREE.SphereGeometry( 2, 10, 10 );
  var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff022c, specular: 0x111111, shininess: 200 } );
	var pointSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	pointSphere.position.set( control.xCoord, control.yCoord, control.zCoord );
	pointSphere.name = 'pointSphere';
  scene.add( pointSphere );

	// Orbit Controls for mouse movement
  orbitcontrols = new THREE.OrbitControls( camera, renderer.domElement );
	
	// Call windows resize function
	window.addEventListener( 'resize', onWindowResize, false );
	
  // Create the stats
  stats = createStats();
  document.body.appendChild( stats.domElement );
	
  // Call the render function
  render();
}

// Coordinate and zoom controls (right top corner)
function addControls( controlObject ) {
  var gui = new dat.GUI();
	
	gui.add( controlObject, 'handUp' );
	gui.add( controlObject, 'enablePath' );
	
	var folder0 = gui.addFolder( 'manualControl' );
  folder0.add( controlObject, 'xCoord', 0, 200 );
  folder0.add( controlObject, 'yCoord', -200, 200 );
  folder0.add( controlObject, 'zCoord', -200, 200 );
	folder0.open();
	
	var folder1 = gui.addFolder( 'pathPlanning' );
	folder1.add( controlObject, 'xFunctionType', [ 'linear', 'parabola', 'sin' ]);
	var folder2 = folder1.addFolder( 'xLinear' );
	folder2.add( controlObject, 'xStart', -200, 200 );
	folder2.add( controlObject, 'xEnd', -200, 200 );
	folder2.open();
	var folder3 = folder1.addFolder( 'xFunction' );
	folder3.add( controlObject, 'xInput', [ 'y', 'z' ] );
	folder3.add( controlObject, 'xFactorA' );
	folder3.add( controlObject, 'xFactorB' );
	folder3.add( controlObject, 'xFactorC' );
	folder3.open();
	
	folder1.add( controlObject, 'yFunctionType', [ 'linear', 'parabola', 'sin' ]);
	var folder4 = folder1.addFolder( 'yLinear' );
	folder4.add( controlObject, 'yStart', -200, 200 );
	folder4.add( controlObject, 'yEnd', -200, 200 );
	folder4.open();
	var folder5 = folder1.addFolder( 'yFunction' );
	folder5.add( controlObject, 'yInput', [ 'x', 'z' ] );
	folder5.add( controlObject, 'yFactorA' );
	folder5.add( controlObject, 'yFactorB' );
	folder5.add( controlObject, 'yFactorC' );
	folder5.open();
	
	folder1.add( controlObject, 'zFunctionType', [ 'linear', 'parabola', 'sin' ]);
	var folder6 = folder1.addFolder( 'zLinear' );
	folder6.add( controlObject, 'zStart', -200, 200 );
	folder6.add( controlObject, 'zEnd', -200, 200 );
	folder6.open();
	var folder7 = folder1.addFolder( 'zFunction' );
	folder7.add( controlObject, 'zInput', [ 'x', 'y' ] );
	folder7.add( controlObject, 'zFactorA' );
	folder7.add( controlObject, 'zFactorB' );
	folder7.add( controlObject, 'zFactorC' );
	folder7.open();
	
	folder1.add( controlObject, 'msStepDelay', 5, 1000 );
	folder1.add( controlObject, 'steps', 0, 500).step( 1 );
	folder1.add( controlObject, 'runPath' );
	folder1.open();
}

// FPS and delay stats (left top corner)
function createStats() {
  var stats = new Stats();
  stats.setMode( 0 );
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';
  return stats;
}

// Window Resize function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

// Converts radians to degrees
function rad2deg( radians ) {
	var degrees = ( radians * ( 180 / Math.PI ) );
	return degrees;
}

// Angle range max and min values (-90 to 90) degrees
function isInRange( angle ) {
	if ( angle > Math.PI / 2 ) {
		angle = Math.PI / 2;
	}
	else if ( angle < -Math.PI / 2 ) {
		angle = -Math.PI / 2;
	}
	return angle;
}

// Calculates PWM values from joint angles for servo motors
function rad2pwm( radians ) {
	var pwm = avgPWM + ( stepPWM / Math.PI ) * radians;
	return pwm;
}

// Calculates Inverse Kinematics joint angles
function calculateIK( xCoord, yCoord, zCoord, handUp ) {
	var coxaJoint = scene.getObjectByName( 'coxaJoint' ),
			femurJoint = scene.getObjectByName( 'femurJoint' ),
			tibiaJoint = scene.getObjectByName( 'tibiaJoint' );
	
	var alpha, alpha1, alpha2, beta, theta, xCoxa, zCoxa, dx, dy, dz, distXZ, distXYZ,
				
			// XZ-angle
			gamma = Math.atan2( zCoord, xCoord );
	
	xCoxa = coxaLength * Math.cos( gamma );
	zCoxa = coxaLength * Math.sin( gamma );
	
	dx = xCoord - xCoxa;
	dy = yCoord - coxaHeight;
  dz = zCoord - zCoxa;
	
	// Distances
	distXZ = Math.sqrt( dx * dx + dz * dz );
	distXYZ = Math.sqrt( dx * dx + dy * dy + dz * dz );
	
	// Clamp the distance, calculate angles if distance is below leg length
	if ( distXYZ < ( femurLength + tibiaLength ) ) {
		alpha1 = Math.atan2( dy, distXZ );
		alpha2 = Math.acos( ( tibiaLength * tibiaLength - femurLength * femurLength - distXYZ * distXYZ) / ( -2 * femurLength * distXYZ ) );
		
		beta = Math.acos( ( distXYZ * distXYZ - tibiaLength * tibiaLength - femurLength * femurLength) / ( -2 * tibiaLength * femurLength ) );
		  
		// Up hand orientation trigonometry
		if ( handUp ) {
		  alpha = alpha1 + alpha2;
		  theta = beta - Math.PI;
		}
		// Down hand orientation trigonometry
		else {
		  alpha = alpha1 - alpha2;
		  theta = Math.PI - beta;
		}
	}
	// Else calculate angles for straight leg
	else {
	  alpha = Math.atan2( dy, distXZ );
		beta = theta = 0;
	}
	
	// Check angle range max and min values (-90 to 90) degrees
	gamma = isInRange( gamma );
	alpha = isInRange( alpha );
	theta = isInRange( theta );

	// Add small offset angle correction for gamma (Coxa Y-axis rotation)
	gamma = -( gamma + Math.PI / 85 );
	
	// Create object for coordinates and angles and return it for rendering
	var invKin = {
		'dist': distXYZ.toFixed( 2 ),
		'angleCoxa': gamma,
		'angleFemur': alpha,
	  'angleTibia': theta,
		'xCoxa': xCoxa,
		'zCoxa': zCoxa
	};

  return invKin;
}

function calculatePath( xFunctionType, xStart, xEnd, xInput, xFactorA, xFactorB, xFactorC,
												yFunctionType, yStart, yEnd, yInput, yFactorA, yFactorB, yFactorC,
												zFunctionType, zStart, zEnd, zInput, zFactorA, zFactorB, zFactorC,
												steps, msStepDelay ) {
  var xStep = ( xEnd - xStart ) / steps,
			yStep = ( yEnd - yStart ) / steps,
			zStep = ( zEnd - zStart ) / steps,
			xFunction, yFunction, zFunction,
			coxaJoint = scene.getObjectByName( 'coxaJoint' ),
			femurJoint = scene.getObjectByName( 'femurJoint' ),
			tibiaJoint = scene.getObjectByName( 'tibiaJoint' ),
			line = scene.getObjectByName( 'line' ),
			pointSphere = scene.getObjectByName( 'pointSphere' ),
			invKin;
	
	// Update global path object with step size and step delay
	path.steps = steps;
	path.msStepDelay = msStepDelay;
	
	if ( functionLineExists ) {
		functionLine = scene.getObjectByName( 'functionLine' );
	  scene.remove( functionLine );
		functionLineExists = false;
	}
	
	// Function line
  var functionMaterial = new THREE.LineBasicMaterial( { color: 0x059C11, linewidth: 5 } ),
      functionGeometry = new THREE.Geometry();
	
	// Use timeout msStepDelay for pausing between loops
	for ( var i = 0; i <= steps; i++ ) {
    ( function( index ) {			
      setTimeout( function() {
				
				console.log( 'Step: ' + index );
				
				if ( index === Math.round( steps ) ) {
					var functionLine = new THREE.Line( functionGeometry, functionMaterial );
	        functionLine.name = 'functionLine';
					scene.add( functionLine );
					functionLineExists = true;
					pathPlanningRunning = false;
		    }
				
				if ( xFunctionType === 'linear' ) {
			    xFunction = xStart + xStep * index;
	      }
				else if ( xFunctionType === 'parabola' ) {
					if ( xInput === 'y' ) {
						xFunction = xFactorA * Math.pow(yFunction, 2) + xFactorB * yFunction + xFactorC;
					}
					else if ( xInput === 'z' ) {
					  xFunction = xFactorA * Math.pow(zFunction, 2) + xFactorB * zFunction + xFactorC;
					}
				}
				else if ( xFunctionType === 'sin' ) {
					if ( xInput === 'y' ) {
						xFunction = xFactorA * Math.sin(xFactorB * yFunction) + xFactorC;
					}
					else if ( xInput === 'z' ) {
					  xFunction = xFactorA * Math.sin(xFactorB * zFunction) + xFactorC;
					}
				}
		
		    if ( yFunctionType === 'linear' ) {
			    yFunction = yStart + yStep * index;
		    }
				else if ( yFunctionType === 'parabola' ) {
					if ( yInput === 'x' ) {
						yFunction = yFactorA * Math.pow(xFunction, 2) + yFactorB * xFunction + yFactorC;
					}
					else if ( yInput === 'z' ) {
					  yFunction = yFactorA * Math.pow(zFunction, 2) + yFactorB * zFunction + yFactorC;
					}
				}
				else if ( yFunctionType === 'sin' ) {
					if ( yInput === 'x' ) {
						yFunction = xFactorA * Math.sin(yFactorB * xFunction) + yFactorC;
					}
					else if ( yInput === 'z' ) {
					  yFunction = yFactorA * Math.sin(yFactorB * zFunction) + yFactorC;
					}
				}
				
				if ( zFunctionType === 'linear' ) {
			    zFunction = zStart + zStep * index;
		    }
				else if ( zFunctionType === 'parabola' ) {
					if ( zInput === 'x' ) {
						zFunction = zFactorA * Math.pow(xFunction, 2) + zFactorB * xFunction + zFactorC;
					}
					else if ( zInput === 'y' ) {
					  zFunction = zFactorA * Math.pow(yFunction, 2) + zFactorB * yFunction + zFactorC;
					}
				}
				else if ( zFunctionType === 'sin' ) {
					if ( zInput === 'x' ) {
						zFunction = zFactorA * Math.sin(zFactorB * xFunction) + zFactorC;
					}
					else if ( yInput === 'y' ) {
					  zFunction = zFactorA * Math.sin(zFactorB * yFunction) + zFactorC;
					}
				}
				
				invKin = calculateIK( xFunction, yFunction, zFunction, control.handUp );
					
				// Append Path object with PWM values
				path.coxaPath[ index ] = rad2pwm( invKin.angleCoxa ).toFixed( 0 );
				path.femurPath[ index ] = rad2pwm( invKin.angleFemur ).toFixed( 0 );
				path.tibiaPath[ index ] = rad2pwm( invKin.angleTibia ).toFixed( 0 );
					
				// Print angles and distance to DOM
	      document.getElementById( 'distance' ).innerHTML = 'XYZ: ' + invKin.dist + ' mm';
	      document.getElementById( 'coxa' ).innerHTML = 'Coxa: ' + rad2deg( invKin.angleCoxa ).toFixed( 2 ) + ' degrees';
	      document.getElementById( 'femur' ).innerHTML = 'Femur: ' + rad2deg( invKin.angleFemur ).toFixed( 2 ) + ' degrees';
	      document.getElementById( 'tibia' ).innerHTML = 'Tibia: ' + rad2deg( invKin.angleTibia ).toFixed( 2 ) + ' degrees';
			  document.getElementById( 'pwm' ).innerHTML = 'Coxa: ' + rad2pwm( invKin.angleCoxa ).toFixed( 0 ) + ' - Femur: ' +
					 rad2pwm( invKin.angleFemur ).toFixed( 0 ) + ' - Tibia: ' + rad2pwm( invKin.angleTibia ).toFixed( 0);
					
				coxaJoint.rotation.set( 0, invKin.angleCoxa, 0 );
				femurJoint.rotation.set( 0, 0, invKin.angleFemur );
		    tibiaJoint.rotation.set( 0, 0, invKin.angleTibia );
					
				// Update line between Coxa Joint origo and destination point
	      line.geometry.verticesNeedUpdate = true;
	      line.geometry.vertices[ 0 ].x = invKin.xCoxa;
	      line.geometry.vertices[ 0 ].z = invKin.zCoxa;
	      line.geometry.vertices[ 1 ].x = xFunction;
	      line.geometry.vertices[ 1 ].y = yFunction;
	      line.geometry.vertices[ 1 ].z = zFunction;
		
		    // Update sphere implicating the destination point
	      pointSphere.position.x = xFunction;
	      pointSphere.position.y = yFunction;
	      pointSphere.position.z = zFunction;
				
			  functionGeometry.vertices.push(
	        new THREE.Vector3( xFunction, yFunction, zFunction )
        );
				
			}, i * msStepDelay);
    })( i );
	}
}

// Render scene and animation
function render() {
	var coxaJoint = scene.getObjectByName( 'coxaJoint' ),
			femurJoint = scene.getObjectByName( 'femurJoint' ),
			tibiaJoint = scene.getObjectByName( 'tibiaJoint' ),
			line = scene.getObjectByName( 'line' ),
			pointSphere = scene.getObjectByName( 'pointSphere' ),
			folders = document.getElementsByClassName( 'folder' );
	
	if ( control.enablePath === true ) {
		folders[ 0 ].style.display = 'none';
		folders[ 1 ].style.display = 'block';
	}
	else {
		folders[ 0 ].style.display = 'block';
		folders[ 1 ].style.display = 'none';
	}
	
	if ( control.xFunctionType === 'linear' ) {
		folders[ 2 ].style.display = 'block';
	  folders[ 3 ].style.display = 'none';
	}
	else {
		folders[ 2 ].style.display = 'none';
		folders[ 3 ].style.display = 'block';
	}
	
	if ( control.yFunctionType === 'linear' ) {
	  folders[ 4 ].style.display = 'block';
		folders[ 5 ].style.display = 'none';
	}
	else {
		folders[ 4 ].style.display = 'none';
		folders[ 5 ].style.display = 'block';
	}
	
	if ( control.zFunctionType === 'linear' ) {
	  folders[ 6 ].style.display = 'block';
		folders[ 7 ].style.display = 'none';
	}
	else {
		folders[ 6 ].style.display = 'none';
		folders[ 7 ].style.display = 'block';
	}
	
	// If path planning is disabled
	if ( !control.enablePath ) {
		var invKin = calculateIK( control.xCoord, control.yCoord, control.zCoord, control.handUp );
		
		// Print angles and distance to DOM
	  document.getElementById( 'distance' ).innerHTML = 'XYZ: ' + invKin.dist + ' mm';
	  document.getElementById( 'coxa' ).innerHTML = 'Coxa: ' + rad2deg( invKin.angleCoxa ).toFixed( 2 ) + ' degrees';
	  document.getElementById( 'femur' ).innerHTML = 'Femur: ' + rad2deg( invKin.angleFemur ).toFixed( 2 ) + ' degrees';
	  document.getElementById( 'tibia' ).innerHTML = 'Tibia: ' + rad2deg( invKin.angleTibia ).toFixed( 2 ) + ' degrees';
		document.getElementById( 'pwm' ).innerHTML = 'Coxa: ' + rad2pwm( invKin.angleCoxa ).toFixed( 0) + ' - Femur: ' +
			rad2pwm( invKin.angleFemur ).toFixed( 0 ) + ' - Tibia: ' + rad2pwm( invKin.angleTibia ).toFixed( 0 );
		
		// Update servo motor positions
		coxaJoint.rotation.set( 0, invKin.angleCoxa, 0 );
		femurJoint.rotation.set( 0, 0, invKin.angleFemur );
		tibiaJoint.rotation.set( 0, 0, invKin.angleTibia );
		
		// Update line between Coxa Joint origo and destination point
	  line.geometry.verticesNeedUpdate = true;
	  line.geometry.vertices[ 0 ].x = invKin.xCoxa;
	  line.geometry.vertices[ 0 ].z = invKin.zCoxa;
	  line.geometry.vertices[ 1 ].x = control.xCoord;
	  line.geometry.vertices[ 1 ].y = control.yCoord;
	  line.geometry.vertices[ 1 ].z = control.zCoord;
		
		// Update sphere implicating the destination point
	  pointSphere.position.x = control.xCoord;
	  pointSphere.position.y = control.yCoord;
	  pointSphere.position.z = control.zCoord;
	}
	
	renderer.render( scene, camera );
	requestAnimationFrame( render );
	
	// Update Orbit Controls and Stats in the loop
	orbitcontrols.update();
	stats.update();
}

// Call Init function when site has loaded
window.onload = init;
