/* Lecture 21: Gouraud and Phong Shaders
 * CSCI 4611, Spring 2024, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

import { MyGouraudMaterial } from './MyGouraudMaterial';
import { MyPhongMaterial } from './MyPhongMaterial';

export class App extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    public renderStyle: string;
    public model: string;

    private models: gfx.Mesh3[];

    private gouradMaterial: MyGouraudMaterial;
    private phongMaterial: MyPhongMaterial;
    private unlitMaterial: gfx.UnlitMaterial;
    private wireframeMaterial: gfx.WireframeMaterial;

    private pointLight: gfx.PointLight;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        // the argument is a boolean that enables the stencil buffer
        super(true);

        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.renderStyle = 'Wireframe';
        this.model = 'bunny.obj';
        
        this.models = [];

        this.gouradMaterial = new MyGouraudMaterial();
        this.phongMaterial = new MyPhongMaterial();
        this.unlitMaterial = new gfx.UnlitMaterial();
        this.wireframeMaterial = new gfx.WireframeMaterial();

        this.pointLight = new gfx.PointLight(gfx.Color.WHITE);

        this.createGUI();
    }


    createGUI(): void
    {
        // Create the GUI
        const gui = new GUI();
        gui.width = 200;

        const renderControls = gui.addFolder('Shading Model');
        renderControls.open();

        const renderStyleController = renderControls.add(this, 'renderStyle', [
            'Wireframe',
            'Unlit',
            'Gouraud', 
            'Phong', 
        ]);
        renderStyleController.name('');
        renderStyleController.onChange(()=>{this.changeRenderStyle()});

        const modelControls = gui.addFolder('Model');
        modelControls.open();

        const modelController = modelControls.add(this, 'model', [
            'bunny.obj', 
            'cow.obj',
            'cube.obj', 
            'head.obj',
            'hippo.obj',
            'sphere.obj',
            'teapot.obj'
        ]);
        modelController.name('');
        modelController.onChange(()=>{this.changeModel()});     
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup camera
        this.renderer.viewport = gfx.Viewport.CROP;
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.1, 10);
        this.cameraControls.setDistance(2.5);
        this.cameraControls.zoomSpeed = 0.1;
        this.cameraControls.setOrbit(-30 * Math.PI / 180, 15 * Math.PI / 180);

        this.renderer.background.set(0.7, 0.7, 0.7);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Vector3(0.2, 0.2, 0.2));
        this.scene.add(ambientLight);

        this.pointLight.position.set(.75, 1.1, 1);
        this.scene.add(this.pointLight);

        const lightSphere = gfx.Geometry3Factory.createSphere();
        lightSphere.scale.set(0.05, 0.05, 0.05);
        lightSphere.position.set(.75, 1.1, 1);
        this.scene.add(lightSphere);

        const lightSphereMaterial = new gfx.UnlitMaterial();
        lightSphereMaterial.color.set(1, 1, 0);
        lightSphere.material = lightSphereMaterial;

        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/bunny.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/cow.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/cube.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/head.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/hippo.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/sphere.obj'));
        this.models.push(gfx.MeshLoader.loadOBJ('./assets/models/teapot.obj'));

        this.models.forEach((model: gfx.Mesh3) => {
            model.material = this.gouradMaterial;
            model.visible = false;
            this.scene.add(model);
        });

        this.gouradMaterial.ambientColor.set(1, 0.4, 0.4);
        this.gouradMaterial.diffuseColor.set(1, 0.4, 0.4);
        this.gouradMaterial.specularColor.set(1, 1, 1);
        this.gouradMaterial.shininess = 50;

        this.phongMaterial.ambientColor.set(1, 0.4, 0.4);
        this.phongMaterial.diffuseColor.set(1, 0.4, 0.4);
        this.phongMaterial.specularColor.set(1, 1, 1);
        this.phongMaterial.shininess = 50;

        this.unlitMaterial.color.set(1, 0.4, 0.4);

        this.models[0].visible = true;
        this.changeRenderStyle();
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        // Update the camera controller
        this.cameraControls.update(deltaTime);
    }


    private changeRenderStyle(): void
    {
       if(this.renderStyle == 'Gouraud')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.gouradMaterial;
            });
       }
       else if(this.renderStyle == 'Phong')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.phongMaterial;
            });
       }
       else if(this.renderStyle == 'Wireframe')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.wireframeMaterial;
            });
       }
       else if(this.renderStyle == 'Unlit')
       {
            this.models.forEach((model: gfx.Mesh3) => {
                model.material = this.unlitMaterial;
            });
       }
    }


    private changeModel(): void
    {
        if(this.model == 'bunny.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[0].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cow.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[1].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'cube.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[2].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'head.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[3].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'hippo.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[4].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'sphere.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[5].visible = true;
            this.setMaterialSide(gfx.Side.FRONT);
        }
        else if(this.model == 'teapot.obj')
        {
            this.models.forEach((model: gfx.Mesh3) => {
                model.visible = false;
            });
            this.models[6].visible = true;
            this.setMaterialSide(gfx.Side.DOUBLE);
        }
    }

    private setMaterialSide(side: gfx.Side): void
    {
        this.gouradMaterial.side = side;
        this.phongMaterial.side = side;
        this.unlitMaterial.side = side;
    }
}