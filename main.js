// Global scope variables
var renderer,
		scene,
		camera,
		stats,
		control,
		orbitcontrols,
		
		// Lengths
		coxaLength = 40,
		femurLength = 55,
		tibiaLength = 50;

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
	coxaJoint.position.set( 0, 50, 0 );
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
    this.xCoord = 200;
    this.yCoord = 50;
    this.zCoord = 0;
    this.leftHand = true;
  };
  addControls( control );
	
	// Distance line
  var lineMaterial = new THREE.LineBasicMaterial( { color: 0xff022c, linewidth: 5 } ),
      lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(
	  new THREE.Vector3( 0, 50, 0 ),
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

// Converts radians to degrees
function rad2deg( radians ) {
	var degrees = ( radians * ( 180 / Math.PI ) );
	return degrees;
}

// Window Resize function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

// Coordinate and zoom controls (right top corner)
function addControls( controlObject ) {
  var gui = new dat.GUI();
  gui.add( controlObject, 'xCoord', -200, 200 );
  gui.add( controlObject, 'yCoord', -200, 200 );
  gui.add( controlObject, 'zCoord', -200, 200 );
  gui.add( controlObject, 'leftHand' );
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

// Calculates Inverse Kinematics joint angles
function calculateIK( xCoord, yCoord, zCoord, leftHand ) {
	var coxaJoint = scene.getObjectByName( 'coxaJoint' ),
			femurJoint = scene.getObjectByName( 'femurJoint' ),
			tibiaJoint = scene.getObjectByName( 'tibiaJoint' );
	
	var alpha, alpha1, alpha2, beta, beta1, theta, xzLength, xyLength,
			xFemur, yFemur, xTibia, yTibia,
				
			// The difference between target XY-point and Coxa end
			dx = xCoord,
			dy = yCoord,
			dist = Math.sqrt( dx*dx + dy*dy ),
				
			// XZ-angle
			gamma = Math.atan2( zCoord, xCoord );
		
	// Clamp the distance, calculate angles if distance is below leg length
	if ( dist < ( femurLength + tibiaLength ) ) {
		xzLength = Math.sqrt( xCoord * xCoord + zCoord*zCoord);
		xyLength = Math.sqrt( yCoord * yCoord + Math.pow( ( xzLength - coxaLength ), 2) );
			
		alpha1 = Math.atan2( yCoord, ( xzLength - coxaLength ) );
		alpha2 = Math.acos( ( tibiaLength * tibiaLength - femurLength * femurLength - xyLength * xyLength) / ( -2 * femurLength * xyLength ) );
		beta1 = Math.acos( ( xyLength * xyLength - tibiaLength * tibiaLength - femurLength * femurLength) / ( -2 * tibiaLength * femurLength ) );
		  
		// Left hand orientation trigonometry
		if ( leftHand ) {
		  alpha = alpha1 + alpha2;
				
			xFemur = coxaLength + femurLength * Math.cos( alpha );
		  yFemur = femurLength * Math.sin( alpha );
				
			beta = beta1 - Math.PI / 2 + alpha;
			theta = Math.PI / 2 - beta + alpha;
				
			xTibia = xFemur + tibiaLength * Math.sin( beta );
			yTibia = yFemur - tibiaLength * Math.cos( beta );
		}
		// Right hand orientation trigonometry
		else {
		  alpha = alpha1 - alpha2;
			
		  xFemur = coxaLength + femurLength * Math.cos( alpha );
		  yFemur = femurLength * Math.sin( alpha );
			
			beta = Math.PI / 2 - beta1 + alpha;
			theta = Math.PI / 2 + beta - alpha;
			
      xTibia = xFemur - tibiaLength * Math.sin( beta );
			yTibia = yFemur + tibiaLength * Math.cos( beta );
		}
	}
	// Else calculate angles for straight leg
	else {
		alpha = Math.atan2( dy, dx );
	  beta = theta = alpha;
			
		xFemur = coxaLength + femurLength * Math.cos( alpha );
		yFemur = femurLength * Math.sin( alpha );
    xTibia = xFemur + tibiaLength * Math.cos( beta );
	  yTibia = yFemur + tibiaLength * Math.sin( beta );
	}
		
	// Create object for coordinates and angles and return it for rendering
	var IK = {
		'dist': dist.toFixed( 2 ),
		'xFemur': xFemur.toFixed( 2 ),
		'yFemur': yFemur.toFixed( 2 ),
		'xTibia': xTibia.toFixed( 2 ),
		'yTibia': yTibia.toFixed( 2 ),
		'angleCoxa': gamma,
		'angleFemur': alpha,
	  'angleTibia': theta
	};
	
	coxaJoint.rotation.set(0, -gamma, 0);
	femurJoint.rotation.set(0, 0, alpha);
	tibiaJoint.rotation.set(0, 0, beta);
}

// Render scene and animation
function render() {
	calculateIK( control.xCoord, control.yCoord, control.zCoord, control.leftHand );
	
	var coxaJoint = scene.getObjectByName( 'coxaJoint' ),
			femurJoint = scene.getObjectByName( 'femurJoint' ),
			tibiaJoint = scene.getObjectByName( 'tibiaJoint' ),
			line = scene.getObjectByName( 'line' ),
			pointSphere = scene.getObjectByName( 'pointSphere' );
	
	// Update line between Coxa Joint origo and destination point
	line.geometry.verticesNeedUpdate = true;
	line.geometry.vertices[ 1 ].x = control.xCoord;
	line.geometry.vertices[ 1 ].y = control.yCoord;
	line.geometry.vertices[ 1 ].z = control.zCoord;
	
	// Update sphere implicating the destination point
	pointSphere.position.x = control.xCoord;
	pointSphere.position.y = control.yCoord;
	pointSphere.position.z = control.zCoord;
	
	renderer.render( scene, camera );
	requestAnimationFrame( render );
	
	// Update Orbit Controls and Stats in the loop
	orbitcontrols.update();
	stats.update();
}

// Call Init function when site has loaded
window.onload = init;