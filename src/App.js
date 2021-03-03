//React
import React, { Component } from "react";
//THREE
import * as THREE from "three";
//import OrbitControls from "three-orbitcontrols";
import { OrbitControls } from './jsm/controls/OrbitControls.js';
//Gizmo
import OrientationGizmo from "three-orientation-gizmo";
//Rhino 3dm
//import rhino3dm from 'rhino3dm';
//import { rhino3dm } from './jsm/3DMLoader.js';
//import fs from 'fs';
//import path from 'path';
//MQTT
import mqtt from "mqtt";
//Import Gcode
import { GCodeLoader } from './jsm/GCodeLoader.js';

import "./App.css" 
//import { render } from "@testing-library/react";
import {
  Menu,
  MenuItem,
  Popover,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const CameraSwitcher = require('./Camera.js').default;

//let file3dmpath = "C:\\Users\\vnk-rc\\three-js-intro\\src\\Pistons.3dm"
//let fetchPromise = fetch('Pistons.3dm');


const classes = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
}));


//Get new points

let index = 0;
var npoints = 100000;
var x2 = new Array(npoints);
var y2 = new Array(npoints);
var z2 = new Array(npoints);
var positions = new Float32Array( npoints * 3 );
var colors = new Float32Array( npoints * 3 ).fill(NaN);
var colorsx = [];
var color = new THREE.Color();
const max = 5;
const min = 0;
let cor = [];
var r =[];
var g =[];
var b =[];
var INTERSECTED;
var INTERSECTED2;
var INTERSECTED_OBJ;
var flag = false;
var index2 = 0;
var index3 = 0;
var source_color=[];
var popover_content = 10;
var poopover_cont = "";

//_________________________________________________________________________________________

//___________________________________________________________________________________________
//load data from mqtt 
/*
const client = mqtt.connect("ws://localhost",{port:11883, clientId:"nodejs"}); //mqtt://mqtt.dpart.svc.fortknox.local port 1883
client.on("connect",function(){console.log("connected")});
console.log(client.connected);
client.subscribe("machines/mikron");
client.on('message',function(topic, message, packet){
  
  let payload = JSON.parse(message);

  if ((typeof payload[0]) != "object"){
    let value = payload[6];
    x2[index] = payload[0];
    y2[index] = payload[1];
    z2[index] = payload[2];
    source_color[index]=value;
    cor = colorgeneration(min,max,value);
    color.setRGB(cor[0]/255,cor[1]/255,cor[2]/255 );
    colorsx[index] = ( color.r, color.g, color.b );
    r[index]=color.r;
    g[index]=color.g;
    b[index]=color.b;
    //console.log(index);
    if(index<npoints-1){
      index++;
    }
    else{
      index = 0;
    }

  }
  else{
    console.log(payload);
  }

  
});
*/

//load data from json file
/* 
const data = require('./test.json');
const x = data.wcs_X;
const y = data.wcs_Y;
const z = data.wcs_Z;
const color_json = data.Spindleload 
//console.log(data)
*/


function colorgeneration(min,max,value){
  var h,s,l;
  s=1;
  l=0.5;

 if (value>max){h=0}
   else if (value<min){h=240/360}
   else {h = (-((240)/(min-max))*max +((240)/(min-max))*value)/360;  }       
 return (hslToRgb(h,s,l))
  
 }        
 
 function hslToRgb(h, s, l){
     var r, g, b;

     if(s === 0){
         r = g = b = l; // achromatic
     }else{
         var hue2rgb = function hue2rgb(p, q, t){
             if(t < 0) t += 1;
             if(t > 1) t -= 1;
             if(t < 1/6) return p + (q - p) * 6 * t;
             if(t < 1/2) return q;
             if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
             return p;
         }

         var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
         var p = 2 * l - q;
         r = hue2rgb(p, q, h + 1/3);
         g = hue2rgb(p, q, h);
         b = hue2rgb(p, q, h - 1/3);
     }
 

     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
 }

 
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mouseX: null,
      mouseY: null,
      contextRow: null,
      openMenu: false,
      openMenu2: false,
      openPopover: false,
      option_toolpath: true
    };
    this.contextRow = null;
  }
  handleClose = () => {
    //console.log("close called");
    this.setState({
      openMenu: false,
      openMenu2: false,
      openPopover: false,
      mouseX: null,
      mouseY: null,
      contextRow: null
    });
    this.contextRow = null;
  };

  componentDidMount() {
    
    //console.log(data);
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();
    //this.scene.frustumCulled = false;
    //this.scene.background = new THREE.Color( 0xffffff )

    //Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    

    //add Camera
    //var factor = 3;
    this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 200, 20000000)//PerspectiveCamera()//(75, width / height, 0.1, 1000);
    this.camera.position.set(100, 400, 400); //(0, 5, 400) (100, 400, 400)
    this.cameraPerspective = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200000);
    this.cameraPerspective.position.set(0, 3, 400);


    //Camera Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.controls.minDistance = 20;

    // Create a new camera switcher
    this.cameraSwitcher = new CameraSwitcher(this.scene, this.renderer, this.cameraPerspective, this.camera, this.controls);

    //LIGHTS
    const colorb = 0xFFFFFF;
    const intensity = 10;
    const light = new THREE.AmbientLight(colorb, intensity);
    this.scene.add(light);

    this.orientationGizmo = new OrientationGizmo(this.camera, { size: 100, padding: 8 });
    
    this.mount.appendChild(this.orientationGizmo);
    this.mount.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Line.threshold = 0.1;
    //this.raycaster.params.PointCloud.threshold = 0.1;//50
    this.raycaster.params.Points.threshold = 0.1; 


    this.mouse = new THREE.Vector2();
     
    //ADD Your 3D Models here

    //Point of intersection with objects
    const geometry_inter = new THREE.SphereGeometry( 2 );
		const material_inter = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    this.sphereInter = new THREE.Mesh( geometry_inter, material_inter );
    this.sphereInter.visible = false;
    this.sphereInter.name = "pointer";
    //console.log(this.sphereInter)
    this.scene.add( this.sphereInter );

    //Start adding points from mqtt______________________________________________________________________________________________________________________
    const geometry = new THREE.BufferGeometry();
    
    // Set color information
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    // Set location information
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    
    // Calculate boundary sphere
    geometry.computeBoundingSphere();
    
    // Create materials
    var material2 = new THREE.PointsMaterial( { size: 3, vertexColors: true } );
    var material3 = new THREE.LineBasicMaterial( { vertexColors: true  } );

    // Creating a point cloud
    this.points = new THREE.Points( geometry, material2 );
    this.points.name="points";
    this.points.colname = "SpindleLoad";
    this.line = new THREE.Line( geometry,  material3 );
    this.line.name="line";
    this.line.colname = "SpindleLoad";

    this.scene.add( this.line );

    //End adding points____________________________________________________________________________________________________________________________________

    //Start adding points from json files__________________________________________________________________________________________________________________
    var toolpath = ['test.json'];
    
    for (let i=0; i < toolpath.length; i++){
      
      const geometry = new THREE.BufferGeometry();
      const file = toolpath[i].toString();
      const data = require(`./${file}`);
      const x = data.wcs_X;
      const y = data.wcs_Y;
      const z = data.wcs_Z;
      let key = Object.keys(data)[11];
      const color_json = data[key]; 
      let cor_j = [];
      let color_three = new THREE.Color(); 
      let colors_j = [];
      let positions_j = [];
      let min_j = 0;
      let max_j = 4;
      let indexp_j = 0;
      let indexc_j = 0;
      

      for(let i=0; i< x.length; i++){
        cor_j = colorgeneration(min_j,max_j,color_json[i]);
        color_three.setRGB(cor_j[0]/255,cor_j[1]/255,cor_j[2]/255 );
        colors_j[indexc_j++] = color_three.r;
        colors_j[indexc_j++] = color_three.g;
        colors_j[indexc_j++] = color_three.b;
        positions_j[indexp_j++] = x[i];
        positions_j[indexp_j++] = y[i];
        positions_j[indexp_j++] = z[i];
      }


      
      // Set color information
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors_j, 3 ) );

      // Set location information
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions_j, 3 ) );

      // Calculate boundary sphere
      geometry.computeBoundingSphere();

      // Create materials
      var material3 = new THREE.PointsMaterial( { size: 3, vertexColors: true } );

      // Creating a point cloud
      this.points2 = new THREE.Points( geometry, material3 );

      this.points2.name = "points_j";

      this.points2.col = color_json;

      this.points2.colname = key;

      // Adding to the scene
      this.scene.add( this.points2 );
    }

    //End adding points____________________________________________________________________________________________________________________________________

    //Start addidng Gcode__________________________________________________________________________________________________________________________________
    
    var campath = ["OP1030.mpf","OP2030.MPF","OP3030.MPF", "OP4030.MPF", "OP5030.MPF", "OP6030.MPF"];
    var loader = new GCodeLoader();
    for (let i=0; i < campath.length; i++){
    loader.load( campath[i], function ( object ) {
    
      //object.position.set( 0, 0, 0 );
      this.scene.add( object );

    }.bind(this) );
    }

    //End adding Gcode_____________________________________________________________________________________________________________________________________
   
    //Start adding cube____________________________________________________________________________________________________________________________________
    const bufferCubegeometry = new THREE.BoxBufferGeometry( 20, 20, 20); 
    const material = new THREE.MeshBasicMaterial({
      color: "#0F0",
      wireframe: true
    });
    this.cubeBufferMesh = new THREE.Mesh( bufferCubegeometry, material );
    this.cubeBufferMesh.name = "cube";
    this.scene.add( this.cubeBufferMesh );
    
   //End adding cube________________________________________________________________________________________________________________________________________

   //Start adding 3dm_______________________________________________________________________________________________________________________________________
  
   /*
    rhino3dm().then((rhino)=>{

    let buffer = fs.readFileSync(file3dmpath);
    let arr = new Uint8Array(buffer)
    let file3dm = rhino.File3dm.fromByteArray(arr)
    let objects = file3dm.objects();

    for(var i=0; i<objects.count; i++) {
        let geometry = objects.get(i).geometry()
        console.log(geometry)
      }

    // do something with geometry

    }).catch((err)=>{console.log(`Erro: ${err}`)})
    */

   //End adding 3dm_________________________________________________________________________________________________________________________________________ 
    
    window.addEventListener( 'mousemove', this.onDocumentMouseMove );
    window.addEventListener( 'resize', this.resize, false );
    //window.addEventListener('mousewheel', this.mousewheel, { capture: false, passive: false } );

    //window.addEventListener('mousedown', this.onMouseDown, false);

    this.renderScene();

    //start animation
    this.start();
    
  }

  start = () => {
    if (!this.frameId) {
    this.frameId = requestAnimationFrame(this.animate);}
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
		//this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.camera.left = -window.innerWidth / 2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = -window.innerHeight / 2;
    this.camera.updateProjectionMatrix();
    this.renderScene();
  }
  
  onDocumentMouseMove = ( event ) => {

    event.preventDefault();

    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }

  setCenter = () => {
    
    this.controls.target.copy(INTERSECTED2);

  }

  switch_visibility = () => {

    INTERSECTED_OBJ.visible = !INTERSECTED_OBJ.visible;
    //this.cubeBufferMesh.visible=false;
    //console.log(this.cubeBufferMesh.visible)

  }

  changeColor = () => {
    
    const color = new THREE.Color( 0xffffff );
    color.setHex( Math.random() * 0xffffff );
    this.scene.background = color;

  }

  mousewheel = (event) => {
    event.preventDefault();  
    console.log("test")
  }

  change_cloudStyle = () => {
    
    
    if(INTERSECTED_OBJ != undefined){
      if(INTERSECTED_OBJ.name=="points"||INTERSECTED_OBJ.name=="line"){
      
        this.state.option_toolpath = !this.state.option_toolpath;
        //Update kind of toolpath plot
        if(flag !== this.state.option_toolpath){

          if(this.state.option_toolpath){
            //console.log("Here");
            //var selectedObject = this.scene.getObjectByName(this.line);
            this.scene.remove( this.line );
            this.scene.add(this.points);
          }else{
            //var selectedObject = this.scene.getObjectByName(this.points);
            this.scene.remove( this.points );
            this.scene.add(this.line);
          }
          flag = this.state.option_toolpath;

        }

      }else if(INTERSECTED_OBJ.name=="points_j"){

        if(INTERSECTED_OBJ.type=="Points"){
          const positions_j = INTERSECTED_OBJ.geometry.attributes.position.array;
          const colors_j = INTERSECTED_OBJ.geometry.attributes.color.array;
          const color_json = INTERSECTED_OBJ.col;
          const key = INTERSECTED_OBJ.colname;
          this.scene.remove( INTERSECTED_OBJ );
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors_j, 3 ) );
          geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions_j, 3 ) );
          geometry.computeBoundingSphere();
          var material3 = new THREE.LineBasicMaterial( { vertexColors: true  } );
          this.line = new THREE.Line( geometry,  material3 );
          this.line.name = "points_j";
          this.line.col = color_json;
          this.line.colname = key;
          this.scene.add( this.line );
        }
        else if(INTERSECTED_OBJ.type=="Line"){
          const positions_j = INTERSECTED_OBJ.geometry.attributes.position.array;
          const colors_j = INTERSECTED_OBJ.geometry.attributes.color.array;
          const color_json = INTERSECTED_OBJ.col;
          const key = INTERSECTED_OBJ.colname;
          this.scene.remove( INTERSECTED_OBJ );
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors_j, 3 ) );
          geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions_j, 3 ) );
          geometry.computeBoundingSphere();
          var material3 = new THREE.PointsMaterial( { vertexColors: true  } );
          this.points3 = new THREE.Points( geometry,  material3 );
          this.points3.name = "points_j";
          this.points3.col = color_json;
          this.points3.colname = key;
          this.scene.add( this.points3 );
        
        }
      }
    }
  }
 
  animate = () => {

    //Animate Models Here

    this.scene.traverse( function( object ) { //check if that helps, otherwise remove it

      object.frustumCulled = false;
  
    } );

    this.orientationGizmo.update();
    
    this.controls.update();
    
    this.orientationGizmo.onAxisSelected = function(axis) {
      const camera = this.cameraSwitcher.scene.activeCamera;
      var distance = camera.position.distanceTo(this.controls.target);
      camera.position.copy(axis.direction.multiplyScalar(distance).add(this.controls.target));
      camera.lookAt(this.controls.target);
      this.cameraSwitcher.toOrtho();
    }.bind(this)

    this.cameraSwitcher.onSwitch = function(camera) {
      this.controls.object = this.camera;
      this.controls.update();
      this.orientationGizmo.camera = this.camera;
    }.bind(this)
     
    this.cameraSwitcher.toPerspective();
    
    const positions = this.points.geometry.attributes.position.array;
    const colors = this.points.geometry.attributes.color.array;
    
    index2 = 0;
    index3 = 0;
    
    for(let i = 0; i < npoints ;i++){ 
      
      if(isNaN(x2[i])){

      }
      else{
        positions[ index2 ++ ] = x2[i];
        positions[ index2 ++ ] = y2[i];
        positions[ index2 ++ ] = z2[i];
        colors[ index3 ++ ] = r[i];
        colors[ index3 ++ ] = g[i];
        colors[ index3 ++ ] = b[i];
      
    }}
    
    this.points.geometry.setDrawRange( 0, index3/3);
    this.points.geometry.attributes.color.needsUpdate = true;
    this.points.geometry.attributes.position.needsUpdate = true; // required after the first render
    this.points.geometry.computeBoundingSphere();
    
    //ReDraw Scene with Camera and Scene Object
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    
    // find intersections
    this.camera.updateMatrixWorld();
    this.cameraPerspective.updateMatrixWorld();
    this.raycaster.setFromCamera( this.mouse, this.camera );
    const intersects = this.raycaster.intersectObjects( this.scene.children, true );
    let flag = false;
    
    if(intersects.length>0){
      //console.log( this.controls.target)
      for(let i=0; i<intersects.length; i++){
        if(intersects[i].object.name!="pointer"){
          flag = true;
        }
      }
      if (flag) {

        //console.log(this.cameraPerspective.far)
        let scale = this.camera.zoom;
        this.sphereInter.scale.set(1/scale,1/scale,1/scale);
        this.sphereInter.visible = true;
        this.sphereInter.position.copy( intersects[ 0 ].point );
        if(this.camera.zoom < 2){
          this.raycaster.params.Points.threshold = 0.5 ;
        }
        else if(this.camera.zoom < 500){
          this.raycaster.params.Points.threshold =  0.1;
        }else{
          this.raycaster.params.Points.threshold =  0.008;
        }
         

      } else {

        this.sphereInter.visible = false;

      }
    } 
    else{
      this.sphereInter.visible = false;
    } 

    if (this.renderer) 
      this.renderer.render(this.scene, this.camera);
  };

  render() {   
    return (

      
      <div 
        className = "App"
        style={{ width: window.innerWidth, height:  window.innerHeight }}
        ref={mount => { this.mount = mount}}
        
        onClick={(e)=> {
          e.preventDefault();

          this.raycaster.setFromCamera( this.mouse, this.camera );

          const intersects = this.raycaster.intersectObjects( this.scene.children, true );
          //console.log(intersects)
          if ( intersects.length > 0 ) {
          //console.log(INTERSECTED_OBJ, intersects[ 1 ].object )  
          //if ( INTERSECTED_OBJ != intersects[ 1 ].object ) {
          
               //console.log(intersects[ 0 ] === undefined);
            
            if(intersects[ 1 ] !== undefined){
              //console.log(intersects[ 1 ].object.id)
              

              if((intersects[ 1 ].object.type === "Points")||(intersects[ 1 ].object.type === "Line")){
                
                this.setState({
                  openPopover: true,
                  mouseX: e.clientX - 14,
                  mouseY: e.clientY - 16
                });

                INTERSECTED = intersects[ 1 ].point;//intersects[ 0 ].object
                //INTERSECTED_OBJ = intersects[ 0 ].object;
                let pos = [];
                let lim = 0;
                let col = [];

                //console.log(intersects[ 1 ].object.name)
                if(intersects[ 1 ].object.name=="points_j"){
                   pos = intersects[ 1 ].object.geometry.attributes.position.array;
                   lim = this.points.geometry.attributes.position.count*3;
                   col = intersects[ 1 ].object.col;

                   //console.log(lim, col)
                } else{
                   pos = this.points.geometry.attributes.position.array;
                   lim = index3;
                   col = source_color;

                }

                //console.log(intersects[ 1 ].object.name, source_color)
                let min = 100;
                for(let i = 0; i < lim; i=i+3 ){
                  let dist = Math.sqrt((pos[i]-INTERSECTED.x)**2+(pos[i+1]-INTERSECTED.y)**2+(pos[i+2]-INTERSECTED.z)**2);
                  if(dist <= min){
                    min = dist;

                    popover_content = col[i/3];
                    poopover_cont = intersects[ 1 ].object.colname + " = " + popover_content.toString();
                    //console.log(poopover_cont)
                  }
                }
              }
            }
          //}
  
        } else {
  
          INTERSECTED = null;
  
        }

        }}

        
        onContextMenu={(e) => {
          e.preventDefault();

          this.raycaster.setFromCamera( this.mouse, this.camera );

          const intersects = this.raycaster.intersectObjects( this.scene.children, true );
          
          if ( intersects.length > 0 ) {
            
            this.setState({
              openMenu: true,
              mouseX: e.clientX - 2,
              mouseY: e.clientY - 4
            });

            //if ( INTERSECTED != intersects[ 0 ].object ) {
              
              if(intersects[ 1 ] !== undefined){
                INTERSECTED_OBJ = intersects[ 1 ].object;
              }
              
              INTERSECTED2 = intersects[ 0 ].point;//intersects[ 0 ].object
              
            //}
    
          } else {
    
            INTERSECTED2 = null;
            
            this.setState({
              openMenu2: true,
              mouseX: e.clientX - 2,
              mouseY: e.clientY - 4
            });
    
          }
        }}
      >
        <Menu
          keepMounted
          open={this.state.openMenu}
          onClose={this.handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.mouseY !== null && this.state.mouseX !== null
              ? { top: this.state.mouseY, left: this.state.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() =>{ this.setCenter(); this.handleClose()}}>Define as center</MenuItem>
          <MenuItem onClick={() => { this.change_cloudStyle(); this.handleClose()}}>Switch point/line new</MenuItem>
          <MenuItem onClick={() => { this.switch_visibility(); this.handleClose()}}>Switch visible/invisible</MenuItem>
        </Menu>

        <Menu
          keepMounted
          open={this.state.openMenu2}
          onClose={this.handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.mouseY !== null && this.state.mouseX !== null
              ? { top: this.state.mouseY, left: this.state.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => { this.changeColor(); this.handleClose() }}>Change background color</MenuItem>
        </Menu>

        <Popover
            
            keepMounted
            open={this.state.openPopover}
            onClose={this.handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              this.state.mouseY !== null && this.state.mouseX !== null
                ? { top: this.state.mouseY, left: this.state.mouseX }
                : undefined
            } 

        >

          <Typography className={classes.typography}
          children = {poopover_cont}
          
          ></Typography>
        
        </Popover>

      </div>

   
    )

    
  }

}
export default App;

