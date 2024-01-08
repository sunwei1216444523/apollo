import { disposeMesh } from '../utils/common';
import { drawPolygon } from '../utils/polygon';
import { colorMapping, zOffset } from '../constant/common';

export default class Checkpoints {
    private scene;

    private meshs;

    constructor(scene) {
        this.scene = scene;
        this.meshs = [];
    }

    dispose() {
        this.meshs.forEach((mesh) => {
            disposeMesh(mesh);
            this.scene.remove(mesh);
        });
        this.meshs = [];
    }

    update(checkpoints) {
        if (checkpoints && Array.isArray(checkpoints)) {
            this.dispose();
            checkpoints.forEach((checkpoint) => {
                const checkpointMesh = this.drawCheckpoint(checkpoint);
                checkpointMesh.name = 'checkpoint';
                this.scene.add(checkpointMesh);
                this.meshs.push(checkpointMesh);
            });
        }
    }

    private drawCheckpoint(checkpoint) {
        const color = checkpoint.isMidway ? colorMapping.MIDWAY : colorMapping.END;
        const points = checkpoint.region;
        const mesh = drawPolygon(points, {
            color,
            linewidth: 3,
            zOffset: zOffset.checkpoint,
            opacity: 1,
            matrixAutoUpdate: true,
        });
        return mesh;
    }
}
