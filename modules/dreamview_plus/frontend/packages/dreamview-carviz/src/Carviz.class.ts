import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import noop from 'lodash/noop';
import { LocalStorage, KEY_MANAGER } from '@dreamview/dreamview-core/src/util/storageManager';
import View from './render/view';
import Map from './render/map';
import Adc from './render/adc';
import Obstacles from './render/obstacles';
import Text from './render/text';
import PointCloud from './render/pointCloud';
import Routing from './render/routing';
import Decision from './render/decision';
import Prediction from './render/prediction';
import Planning from './render/planning';
import Gps from './render/gps';
import Option from './option';
import Coordinates from './render/coordinates';
import { cameraParams } from './constant/common';
import transScreenPositionToWorld from './utils/transScreenPositionToWorld';
import InitiationMarker from './render/functional/InitiationMarker';
import PathwayMarker from './render/functional/PathwayMarker';
import CopyMarker from './render/functional/CopyMarker';
import RulerMarker from './render/functional/RulerMarker';
import Follow from './render/follow';

enum PREVDATA_STATUS {
    EXIT = 'EXIT',
    UNEXIT = 'UNEXIT',
}

export class Carviz {
    private canvasId;

    public canvasDom;

    public width;

    public height;

    public scene;

    public renderer;

    public CSS2DRenderer;

    public camera;

    public controls;

    public option;

    public view;

    public text;

    public map;

    public adc;

    public obstacles;

    public pointCloud;

    public routing;

    public decision;

    public prediction;

    public planning;

    public gps;

    public initiationMarker: InitiationMarker;

    public pathwayMarker: PathwayMarker;

    public copyMarker: CopyMarker;

    public rulerMarker: RulerMarker;

    public initialized;

    public coordinates;

    private coordinateDiv: HTMLDivElement;

    private prevDataStatus: Record<string, PREVDATA_STATUS> = {};

    public raycaster: THREE.Raycaster = new THREE.Raycaster();

    public follow: Follow;

    private viewLocalStorage;

    constructor(id) {
        this.canvasId = id;
        this.initialized = false;
    }

    render() {
        if (this.initialized) {
            this.view?.setView();
            this.renderer.render(this.scene, this.camera);
            this.CSS2DRenderer.render(this.scene, this.camera);
        }
    }

    updateDimention() {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.CSS2DRenderer.setSize(this.width, this.height);
        this.render();
    }

    initDom() {
        this.canvasDom = document.getElementById(this.canvasId);
        if (!this.canvasDom || !this.canvasId) {
            throw new Error('no canvas container');
        }
        this.width = this.canvasDom.clientWidth;
        this.height = this.canvasDom.clientHeight;
        // 禁用右键
        this.canvasDom.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    resetScence() {
        if (this.scene) {
            this.scene = null;
        }
        this.scene = new THREE.Scene();
        const light = new THREE.DirectionalLight(0xffeedd, 2.0);
        light.position.set(0, 0, 10);
        this.scene.add(light);
        this.initModule();
    }

    initThree() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x0f1014);
        this.canvasDom.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            cameraParams.Default.fov,
            this.width / this.height,
            cameraParams.Default.near,
            cameraParams.Default.far,
        );
        this.camera.up.set(0, 0, 1);

        const light = new THREE.DirectionalLight(0xffeedd, 2.0);
        light.position.set(0, 0, 10);
        this.scene.add(light);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        this.controls.keys = {
            LEFT: 'ArrowLeft',
            UP: 'ArrowUp',
            RIGHT: 'ArrowRight',
            BOTTOM: 'ArrowDown',
        };
        this.controls.listenToKeyEvents(window);
        this.controls.addEventListener('change', () => {
            this.view?.setView();
            this.render();
        });
        this.controls.keys = {
            LEFT: 'ArrowLeft',
            UP: 'ArrowUp',
            RIGHT: 'ArrowRight',
            BOTTOM: 'ArrowDown',
        };
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
        };
        const resizeObserver = new ResizeObserver(() => {
            this.width = this.canvasDom?.clientWidth;
            this.height = this.canvasDom?.clientHeight;
            this.updateDimention();
        });
        resizeObserver.observe(this.canvasDom);
        this.initCSS2DRenderer();
        this.updateDimention();
        this.render();
    }

    initCSS2DRenderer() {
        this.CSS2DRenderer = new CSS2DRenderer();
        this.CSS2DRenderer.setSize(this.width, this.height);
        this.CSS2DRenderer.domElement.style.position = 'absolute';
        this.CSS2DRenderer.domElement.style.top = '0';
        this.CSS2DRenderer.domElement.style.pointerEvents = 'none';
        this.canvasDom.appendChild(this.CSS2DRenderer.domElement);
    }

    initModule() {
        this.coordinates = new Coordinates();
        this.option = new Option();
        this.adc = new Adc(this.scene, this.option, this.coordinates);
        this.view = new View(this.camera, this.controls, this.adc);
        this.text = new Text(this.camera);
        this.map = new Map(this.scene, this.text, this.option, this.coordinates);
        this.obstacles = new Obstacles(this.scene, this.view, this.text, this.option, this.coordinates);
        this.pointCloud = new PointCloud(this.scene, this.adc, this.option);
        this.routing = new Routing(this.scene, this.option, this.coordinates);
        this.decision = new Decision(this.scene, this.option, this.coordinates);
        this.prediction = new Prediction(this.scene, this.option, this.coordinates);
        this.planning = new Planning(this.scene, this.option, this.coordinates);
        this.gps = new Gps(this.scene, this.adc, this.option, this.coordinates);
        this.follow = new Follow(this.scene, this.coordinates);

        const context = {
            scene: this.scene,
            renderer: this.renderer,
            camera: this.camera,
            coordinates: this.coordinates,
            CSS2DRenderer: this.CSS2DRenderer,
        };

        this.initiationMarker = new InitiationMarker(context);
        this.pathwayMarker = new PathwayMarker(context);
        this.copyMarker = new CopyMarker(context);
        this.rulerMarker = new RulerMarker(context);
    }

    init() {
        this.initDom();
        this.initThree();
        this.initModule();
        this.initCoordinateDisplay();
        this.initMouseHoverEvent();
        this.initialized = true;
    }

    private initCoordinateDisplay() {
        this.coordinateDiv = document.createElement('div');
        this.coordinateDiv.style.position = 'absolute';
        this.coordinateDiv.style.right = '10px';
        this.coordinateDiv.style.bottom = '10px';
        this.coordinateDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.coordinateDiv.style.color = 'white';
        this.coordinateDiv.style.padding = '5px';
        this.coordinateDiv.style.borderRadius = '5px';
        this.coordinateDiv.style.userSelect = 'none';
        // To prevent interference with mouse events on the canvas
        this.coordinateDiv.style.pointerEvents = 'none';
        this.canvasDom.appendChild(this.coordinateDiv);
    }

    private handleMouseMove = (event: MouseEvent) => {
        try {
            if (!event || !this.canvasDom || !this.camera || !this.coordinates || !this.coordinateDiv) {
                throw new Error('Invalid or missing dependencies');
            }

            if (typeof this.coordinates.applyOffset !== 'function') {
                throw new Error('applyOffset is not a function');
            }

            const worldPos = transScreenPositionToWorld(event, {
                camera: this.camera,
                scene: this.scene,
                renderer: this.renderer,
                raycaster: this.raycaster,
            });

            if (!worldPos || typeof worldPos.x !== 'number' || typeof worldPos.y !== 'number') {
                throw new Error('Invalid world position');
            }

            const worldPosWithOffset = this.coordinates.applyOffset(worldPos, true);

            if (
                !worldPosWithOffset ||
                typeof worldPosWithOffset.x !== 'number' ||
                typeof worldPosWithOffset.y !== 'number'
            ) {
                throw new Error('Invalid coordinates after applying offset');
            }

            this.coordinateDiv.innerText = `X: ${worldPosWithOffset.x.toFixed(2)}, Y: ${worldPosWithOffset.y.toFixed(
                2,
            )}`;
        } catch (error) {
            // console.error('Error handling mouse move event:', error);
        }
    };

    private initMouseHoverEvent() {
        this.canvasDom.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    }

    ifDispose = (datas, key, update, dispose) => {
        const data = datas[key];
        if (data) {
            update();
            this.prevDataStatus[key] = PREVDATA_STATUS.EXIT;
        } else if (this.prevDataStatus[key] === PREVDATA_STATUS.EXIT) {
            dispose();
            this.prevDataStatus[key] = PREVDATA_STATUS.UNEXIT;
        } else {
            // this.prevDataStatus[key] === PREVDATA_STATUS.UNEXIT
            // donothing
        }
    };

    updateMap = (data) => {
        this.map.update(data, false);
    };

    updatePointCloud = (data) => {
        this.pointCloud.update(data);
    };

    updateData(datas) {
        this.ifDispose(
            datas,
            'autoDrivingCar',
            () => {
                this.adc.update(datas.autoDrivingCar, 'adc');
            },
            noop,
        );

        this.ifDispose(
            datas,
            'shadowLocalization',
            () => {
                this.adc.update(datas.shadowLocalization, 'shadowAdc');
            },
            noop,
        );

        this.ifDispose(
            datas,
            'vehicleParam',
            () => {
                this.adc.updateVehicleParam(datas.vehicleParam);
            },
            noop,
        );

        this.ifDispose(
            datas,
            'planningData',
            () => {
                this.adc.update(datas.planningData.initPoint?.pathPoint, 'planningAdc');
            },
            noop,
        );

        this.ifDispose(
            datas,
            'mainDecision',
            () => {
                this.decision.updateMainDecision(datas.mainDecision);
            },
            () => {
                this.decision.disposeMainDecisionMeshs();
            },
        );

        this.ifDispose(
            datas,
            'mainStop',
            () => {
                this.decision.updateMainDecision(datas.mainStop);
            },
            () => {
                this.decision.disposeMainDecisionMeshs();
            },
        );

        this.ifDispose(
            datas,
            'object',
            () => {
                this.decision.updateObstacleDecision(datas.object);
                this.obstacles.update(
                    datas.object,
                    datas.sensorMeasurements,
                    datas.autoDrivingCar || datas.CopyAutoDrivingCar || {},
                );
                this.prediction.update(datas.object);
            },
            () => {
                this.decision.disposeObstacleDecisionMeshs();
                this.obstacles.dispose();
                this.prediction.dispose();
            },
        );

        this.ifDispose(
            datas,
            'gps',
            () => {
                this.gps.update(datas.gps);
            },
            noop,
        );

        this.ifDispose(
            datas,
            'planningTrajectory',
            () => {
                this.planning.update(datas.planningTrajectory, datas.planningData, datas.autoDrivingCar);
            },
            noop,
        );

        this.ifDispose(
            datas,
            'routePath',
            () => {
                this.routing.update(datas.routingTime, datas.routePath);
            },
            noop,
        );

        this.ifDispose(
            datas,
            'followPlanningData',
            () => {
                this.follow.update(datas.followPlanningData, datas.autoDrivingCar);
            },
            noop,
        );
    }

    updataCoordinates = (data) => {
        this.adc.updateOffset(data, 'adc');
    };

    removeAll() {
        this.map.dispose();
        this.obstacles.dispose();
        this.pointCloud.dispose();
        this.routing.dispose();
        this.decision.dispose();
        this.prediction.dispose();
        this.planning.dispose();
        this.gps.dispose();
        this.follow.dispose();
    }

    // 取消激活所有功能
    deactiveAll() {
        this.initiationMarker.deactive();
        this.pathwayMarker.deactive();
        this.copyMarker.deactive();
        this.rulerMarker.deactive();
    }
}
