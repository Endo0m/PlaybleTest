import { _decorator, Component, screen, Canvas, Camera, UITransform, Widget, Size } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ScreenAdapter')
export class ScreenAdapter extends Component {
    @property({ type: Canvas })
    public canvas: Canvas | null = null;

    @property({ type: Camera })
    public camera: Camera | null = null;

    @property
    public designWidth: number = 1080;

    @property
    public designHeight: number = 1920;

    @property
    public minScale: number = 0.5;

    @property
    public maxScale: number = 2.0;

    @property
    public useSafeArea: boolean = true;

    private lastOrientation: number = -1;
    private lastScreenSize: Size = new Size(0, 0);

    public onLoad(): void {
        if (!this.canvas) {
            this.canvas = this.node.getComponent(Canvas);
        }

        if (!this.camera) {
            this.camera = this.node.getComponent(Camera);
            if (!this.camera) {
                const cameraNode = this.node.getChildByName('Camera');
                if (cameraNode) {
                    this.camera = cameraNode.getComponent(Camera);
                }
            }
        }

        this.adaptScreen();
        screen.on('window-resize', this.onScreenResize, this);
        screen.on('orientation-changed', this.onOrientationChanged, this);
    }

    public onDestroy(): void {
        screen.off('window-resize', this.onScreenResize, this);
        screen.off('orientation-changed', this.onOrientationChanged, this);
    }

    public start(): void {
        this.adaptScreen();
    }

    private onScreenResize(): void {
        this.adaptScreen();
    }

    private onOrientationChanged(): void {
        this.adaptScreen();
    }

    public adaptScreen(): void {
        const frameSize = screen.windowSize;
        const orientation = screen.orientation;
        
        if (this.lastScreenSize.width === frameSize.width && 
            this.lastScreenSize.height === frameSize.height &&
            this.lastOrientation === orientation) {
            return;
        }

        this.lastScreenSize.width = frameSize.width;
        this.lastScreenSize.height = frameSize.height;
        this.lastOrientation = orientation;

        const isLandscape = frameSize.width > frameSize.height;
        const designWidth = isLandscape ? Math.max(this.designWidth, this.designHeight) : this.designWidth;
        const designHeight = isLandscape ? Math.min(this.designWidth, this.designHeight) : this.designHeight;

        if (this.canvas) {
            const canvasTransform = this.canvas.getComponent(UITransform);
            if (canvasTransform) {
                canvasTransform.setContentSize(designWidth, designHeight);
            }

            const designResolution = new Size(designWidth, designHeight);
            this.canvas.designResolution = designResolution;

            const screenRatio = frameSize.width / frameSize.height;
            const designRatio = designWidth / designHeight;

            let scale = 1.0;
            
            if (screenRatio > designRatio) {
                scale = frameSize.height / designHeight;
            } else {
                scale = frameSize.width / designWidth;
            }

            scale = Math.max(this.minScale, Math.min(this.maxScale, scale));

            if (this.canvas.fitHeight) {
                this.canvas.fitHeight = false;
            }
            if (this.canvas.fitWidth) {
                this.canvas.fitWidth = false;
            }

            if (screenRatio > designRatio) {
                this.canvas.fitHeight = true;
            } else {
                this.canvas.fitWidth = true;
            }
        }

        if (this.camera) {
            const cameraTransform = this.camera.node.getComponent(UITransform);
            if (cameraTransform) {
                const orthoHeight = isLandscape ? designWidth / 2 : designHeight / 2;
                this.camera.orthoHeight = orthoHeight;
            }

            if (this.useSafeArea) {
                this.applySafeArea();
            }
        }

        this.adaptWidgets();
    }

    private applySafeArea(): void {
        if (!this.camera) {
            return;
        }

        const safeArea = screen.getSafeAreaRect();
        const frameSize = screen.windowSize;
        
        if (safeArea.width === 0 || safeArea.height === 0) {
            return;
        }

        const safeAreaLeft = safeArea.x / frameSize.width;
        const safeAreaRight = (frameSize.width - safeArea.x - safeArea.width) / frameSize.width;
        const safeAreaTop = (frameSize.height - safeArea.y - safeArea.height) / frameSize.height;
        const safeAreaBottom = safeArea.y / frameSize.height;

        const canvasTransform = this.canvas?.getComponent(UITransform);
        if (canvasTransform) {
            const designSize = canvasTransform.contentSize;
            const leftOffset = designSize.width * safeAreaLeft;
            const rightOffset = designSize.width * safeAreaRight;
            const topOffset = designSize.height * safeAreaTop;
            const bottomOffset = designSize.height * safeAreaBottom;

            const cameraNode = this.camera.node;
            const cameraPos = cameraNode.position;
            
            const offsetX = (leftOffset - rightOffset) * 0.5;
            const offsetY = (bottomOffset - topOffset) * 0.5;
            
            cameraNode.setPosition(cameraPos.x + offsetX, cameraPos.y + offsetY, cameraPos.z);
        }
    }

    private adaptWidgets(): void {
        const rootNode = this.canvas?.node;
        if (!rootNode) {
            return;
        }

        this.adaptNodeWidgets(rootNode);
    }

    private adaptNodeWidgets(node: any): void {
        const widget = node.getComponent(Widget);
        if (widget) {
            const isLandscape = screen.windowSize.width > screen.windowSize.height;
            
            if (isLandscape) {
                if (widget.isAlignTop || widget.isAlignBottom) {
                    widget.top = 0;
                    widget.bottom = 0;
                }
                if (widget.isAlignLeft || widget.isAlignRight) {
                    widget.left = 0;
                    widget.right = 0;
                }
            }
        }

        const children = node.children;
        for (const child of children) {
            this.adaptNodeWidgets(child);
        }
    }

    public update(): void {
        const frameSize = screen.windowSize;
        const orientation = screen.orientation;
        
        if (this.lastScreenSize.width !== frameSize.width || 
            this.lastScreenSize.height !== frameSize.height ||
            this.lastOrientation !== orientation) {
            this.adaptScreen();
        }
    }
}

