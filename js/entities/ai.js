class AITask {
    constructor() {
        this.entity = null;
    }
    initialize(entity) {
        this.entity = entity;
    }
    canRun() {
        return false;
    }
    run() {
        return false;
    }
}

const getTileBbox = function(level, tile) {
    let w = 1, h = 1;
    if (tile.position.length === 4) {
      w = tile.position[2] - tile.position[0] + 1;
      h = tile.position[3] - tile.position[1] + 1;
    }
    return {
      left: tile.position[0] * level.tileSize[0],
      top: tile.position[1] * level.tileSize[1],
      right: (w + tile.position[0]) * level.tileSize[0],
      bottom: (h + tile.position[1]) * level.tileSize[1]
    };
};
export class AICollisionDetector extends AITask {
    constructor() {
        super();
        this.tileCollisions = false;
        this.entityCollisions = false;
    }
    canRun() {
        return true;
    }
    run() {
        const myBbox = this.entity.getBbox();
        this.tileCollisions = this.entity.level.tiles.some(tile => {
            const tileBbox = getTileBbox(this.level, tile);
            return tileBbox.left <= myBbox.right && tileBbox.right >= myBbox.left &&
                    tileBbox.top <= myBbox.bottom && tileBbox.bottom >= myBbox.top;
        });

        this.entityCollisions = this.entity.level.entities.some(entity => {
            const entityBBox = entity.getBbox();
            return entity !== this.entity && entityBBox.left <= myBbox.right &&
                   entityBBox.right >= myBbox.left && entityBBox.top <= myBbox.bottom &&
                   entityBBox.bottom >= myBbox.top;
        });
    }
}

export class AIMotion extends AITask {
    constructor(maxhsp = 8, maxvsp = 16, grav) {
        super();
        this.maxSpeed = [maxhsp, maxvsp];
        this.gravity = grav;
        this.speed = [0,0];
        this.accel = [0,0];
        this.collider = null;
    }
    initialize(entity) {
        super(entity);
        this.collider = entity.addAITask(new AICollisionDetector());
    }
    canRun() {
        return true;
    }
    run() {
        this.accel[1] = Math.min(gravity, this.accel[1]);
        this.speed[0] += this.accel[0];
        this.speed[1] += this.accel[1];

        this.speed[0] = Math.min(abs(this.speed[0]), this.maxSpeed[0]) * Math.sign(this.speed[0]);
        this.speed[1] = Math.min(abs(this.speed[1]), this.maxSpeed[1]) * Math.sign(this.speed[1]);

        for (let xx = 0; xx < Math.abs(this.speed[0]); ++xx) {
            this.entity.pos[0] += Math.sign(this.speed[0]);
            this.collider.run();
            if (this.collider.entityCollisions || this.collider.tileCollisions) {
                this.entity.pos[0] -= Math.sign(this.speed[0]);
                this.speed[0] = 0;
                return;
            }
        }

        for (let yy = 0; yy < Math.abs(this.speed[1]); ++yy) {
            this.entity.pos[1] += Math.sign(this.speed[1]);
            this.collider.run();
            if (this.collider.entityCollisions || this.collider.tileCollisions) {
                this.entity.pos[1] -= Math.sign(this.speed[1]);
                this.speed[1] = 0;
                return;
            }
        }
    }
    setSpeed(hsp = this.speed[0], vsp = this.speed[1]) {
        this.speed = [hsp, vsp];
    }
};

export class AIWalkLedgeBounce extends AITask {
    constructor(walkSpeed = 1) {
        super();
        this.walkSpeed = walkSpeed;
        this.motion = null;
        this.collider = null;
    }
    initialize(entity) {
        super.initialize(entity);
        this.motion = entity.addAITask(new AIMotion(), -1);
        this.collider = entity.addAITask(new AICollisionDetector());
        this.motion.setSpeed(this.walkSpeed);
    }
    canRun() {
        return true;
    }
    run() {
        this.entity.pos[1] += 1;
        this.collider.run();
        const floor = this.collider.tileCollisions;

        this.entity.pos[0] += this.motion.speed[0];
        this.collider.run();
        const floorNext = this.collider.tileCollisions;
        this.entity.pos[1] -= 1;
        this.entity.pos[0] -= this.motion.speed[0];

        if (floor && !floorNext) {
            this.motion.speed[0] *= -1;
        }
    }
}