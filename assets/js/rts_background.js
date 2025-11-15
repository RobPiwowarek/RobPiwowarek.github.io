// --- Canvas Setup ---
const canvas = document.getElementById('rtsCanvas');
// Failsafe in case the script loads on a page without the canvas
if (!canvas) {
    console.error("RTS_BACKGROUND: Could not find element with id 'rtsCanvas'.");
} else {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Game State ---
    let gameObjects = [];
    let projectiles = [];
    let effects = [];
    let teamData = {
        'blue': {
            gold: 100,
            wood: 50,
            color: '#3498db',
            darkColor: '#2980b9',
            townhall: null,
            rallyPoint: { x: 0, y: 0 }
        },
        'red': {
            gold: 100,
            wood: 50,
            color: '#e74c3c',
            darkColor: '#c0392b',
            townhall: null,
            rallyPoint: { x: 0, y: 0 }
        },
        'purple': { // New AI
            gold: 100,
            wood: 50,
            color: '#9b59b6',
            darkColor: '#8e44ad',
            townhall: null,
            rallyPoint: { x: 0, y: 0 }
        }
    };
    let globalAttackTimer = 40; // Rule 4: 40-second global attack timer
    let specialUnitTimer = 60; // New timer for special units

    // --- Utility ---
    function dist(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getNearest(pos, type, team = null) {
        let closest = null;
        let minDis = Infinity;
        for (const obj of gameObjects) {
            // Bug Fix: Check if obj.team exists before comparing
            if (obj.type === type && (team === null || (obj.team && obj.team === team)) && !obj.toRemove) {
                const d = dist(pos, obj);
                if (d < minDis) {
                    minDis = d;
                    closest = obj;
                }
            }
        }
        return closest;
    }
    
    function getNearestEnemy(unit) {
        let closest = null;
        let minDis = Infinity;
        // const enemyTeam = unit.team === 'blue' ? 'red' : 'blue'; // Old 2-team logic
        
        // Priority 1: Find nearest enemy unit (any team but our own)
        for (const obj of gameObjects) {
            if (obj.team && obj.team !== unit.team && obj.type === 'unit' && obj.hp > 0) {
                const d = dist(unit, obj);
                if (d < minDis) {
                    minDis = d;
                    closest = obj;
                }
            }
        }
        
        // Priority 2: If no units, find nearest enemy building
        if (!closest) {
             for (const obj of gameObjects) {
                if (obj.team && obj.team !== unit.team && obj.type === 'building' && obj.hp > 0) {
                    const d = dist(unit, obj);
                    if (d < minDis) {
                        minDis = d;
                        closest = obj;
                    }
                }
            }
        }

        return closest;
    }


    function isPositionClear(x, y, radius) {
        // Check against all game objects
        for (const obj of gameObjects) {
            // Don't check against projectiles or effects
            if (obj.type === 'projectile' || obj.type === 'effect') continue;
            
            const d = dist({x, y}, obj);
            
            // Rule 3: Add spacing between buildings
            let requiredDist = radius + obj.radius;
            if (obj.type === 'building') {
                requiredDist += 10; // 10px extra spacing
            }
            
            // If distance is less than sum of radii, it's a collision
            if (d < requiredDist) {
                return false; // Not clear
            }
        }
        return true; // Clear
    }

    // --- Classes ---

    class GameObject {
        constructor(x, y, radius, team, type) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.team = team;
            this.type = type;
            this.hp = 100;
            this.maxHp = 100;
            this.toRemove = false;
        }

        takeDamage(damage) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.hp = 0;
                this.toRemove = true;
                // Add a small death effect
                effects.push(new Effect(this.x, this.y, this.radius, 'rgba(255, 150, 0, 0.7)', 0.3));
                
                // Rule 4: If this is a townhall, clear the team's reference to it
                if (this.type === 'building' && this.subType === 'townhall') {
                    if (teamData[this.team]) { // Check if team data still exists
                        teamData[this.team].townhall = null;
                    }
                }
            } else {
                // Add a hit effect
                effects.push(new Effect(this.x, this.y, this.radius * 0.5, 'rgba(255, 255, 255, 0.8)', 0.1));
            }
        }

        draw() {
            // Default draw (circle) - this will be overridden
            ctx.fillStyle = this.color || '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        drawHpBar() {
             if (this.hp < this.maxHp && this.hp > 0) {
                const barWidth = this.radius * 2;
                const barHeight = 4;
                ctx.fillStyle = '#333';
                ctx.fillRect(this.x - this.radius, this.y - this.radius - barHeight - 2, barWidth, barHeight);
                ctx.fillStyle = 'green';
                ctx.fillRect(this.x - this.radius, this.y - this.radius - barHeight - 2, barWidth * (this.hp / this.maxHp), barHeight);
            }
        }

        update(dt) { 
            // Default update (empty) - this will be overridden
        }
    }

    class ResourceNode extends GameObject {
        constructor(x, y, type) {
            const isGold = type === 'gold';
            super(x, y, isGold ? 10 : 12, null, 'resource');
            this.resourceType = type;
            this.color = isGold ? '#f1c40f' : '#27ae60';
            this.amount = 1500; // More resources (was 500)

            if (isGold) {
                this.shapePoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                    const r = this.radius * (0.7 + Math.random() * 0.3);
                    this.shapePoints.push({
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r
                    });
                }
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.resourceType === 'gold') {
                // Rocky shape for gold (using pre-calculated points)
                ctx.moveTo(this.x + this.shapePoints[0].x, this.y + this.shapePoints[0].y);
                for (let i = 1; i < this.shapePoints.length; i++) {
                    ctx.lineTo(this.x + this.shapePoints[i].x, this.y + this.shapePoints[i].y);
                }
                ctx.closePath();
            } else {
                // Draw trunk first
                ctx.fillStyle = '#8c5a2e'; // Brown trunk color
                ctx.fillRect(this.x - 3, this.y, 6, this.radius);
                
                // Draw leaves
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }

    class Building extends GameObject {
        constructor(x, y, radius, team, subType) {
            super(x, y, radius, team, 'building');
            this.subType = subType;
            this.color = teamData[team].darkColor;
            
            // Building-specific stats
            const stats = {
                'townhall': { hp: 1500, time: 10, radius: 25 },
                'barracks': { hp: 350, time: 7, radius: 18 },
                'farm': { hp: 100, time: 3, radius: 15 },
                'tower': { hp: 500, time: 6, radius: 12 } // Rule 3: Add Tower stats
            };
            
            this.maxHp = stats[subType].hp;
            this.radius = stats[subType].radius; // Set radius from stats
            this.hp = this.maxHp;
            
            this.spawnTimer = Math.random() * 5;
            this.pulseTimer = 0; // For townhall visual
            
            // Rule 3: Add combat stats for Tower
            if (this.subType === 'tower') {
                this.attackRange = 120;
                this.attackDamage = 20;
                this.attackCooldown = 2.0;
                this.attackTimer = 0;
            }
            
            // Construction state
            this.isUnderConstruction = false;
            this.buildProgress = 0;
            this.maxBuildTime = stats[subType].time;
        }
        
        draw() {
            ctx.strokeStyle = teamData[this.team].color;
            ctx.lineWidth = 3;

            // Calculate draw radius based on construction progress
            let drawRadius = this.radius;
            if (this.isUnderConstruction) {
                const progress = Math.max(0.1, this.buildProgress / this.maxBuildTime); // Start at 10% size
                drawRadius = this.radius * progress;
            }
            
            ctx.fillStyle = this.color;

            if (this.subType === 'townhall') {
                // Draw base as a larger square with a 'core'
                ctx.fillRect(this.x - drawRadius, this.y - drawRadius, drawRadius * 2, drawRadius * 2);
                ctx.strokeRect(this.x - drawRadius, this.y - drawRadius, drawRadius * 2, drawRadius * 2);
                if (!this.isUnderConstruction) {
                    ctx.fillStyle = teamData[this.team].color; // Brighter color
                    // Rule 9: Pulsing core
                    const coreSize = drawRadius * (0.5 + Math.sin(this.pulseTimer * 3) * 0.1);
                    ctx.fillRect(this.x - coreSize / 2, this.y - coreSize / 2, coreSize, coreSize);
                }
            } else if (this.subType === 'barracks') {
                // Rule 9: Draw barracks as a wide rectangle
                const w = drawRadius * 1.2;
                const h = drawRadius * 0.8;
                ctx.fillRect(this.x - w, this.y - h, w * 2, h * 2);
                ctx.strokeRect(this.x - w, this.y - h, w * 2, h * 2);
                if (!this.isUnderConstruction) {
                    ctx.fillStyle = teamData[this.team].color;
                    ctx.fillRect(this.x - 5, this.y + h - 8, 10, 8); // Small rect at the bottom
                }
            } else if (this.subType === 'farm') {
                // Rule 9: Draw farm as a brown circle with lines
                ctx.fillStyle = '#8c5a2e'; // Brown tilled earth
                ctx.beginPath();
                ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = teamData[this.team].color;
                ctx.stroke(); // Outline
                
                if (!this.isUnderConstruction) {
                    // Draw tilled lines
                    ctx.strokeStyle = '#5e3c1e'; // Darker brown
                    ctx.lineWidth = 1;
                    for(let i = -1; i <= 1; i += 0.5) {
                        const offset = i * drawRadius * 0.8;
                        ctx.beginPath();
                        ctx.moveTo(this.x - drawRadius * 0.9, this.y + offset);
                        ctx.lineTo(this.x + drawRadius * 0.9, this.y + offset);
                        ctx.stroke();
                    }
                }
            } else if (this.subType === 'tower') {
                // Rule 3: Draw Tower as a hexagon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.lineTo(
                        this.x + Math.cos(angle) * drawRadius,
                        this.y + Math.sin(angle) * drawRadius
                    );
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                if (!this.isUnderConstruction) {
                    ctx.fillStyle = teamData[this.team].color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, drawRadius * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
    
            this.drawHpBar();
        }

        update(dt) {
            // For townhall pulse visual
            this.pulseTimer += dt;
            
            // Don't do anything while being built
            if (this.isUnderConstruction) return;

            // Rule 3: Tower attack logic
            if (this.subType === 'tower') {
                this.attackTimer -= dt;
                if (this.attackTimer <= 0) {
                    // Find nearest enemy *unit*
                    // 3-Way Fix: Find *any* enemy unit
                    let closestEnemyUnit = null;
                    let minDis = Infinity;
                    for (const obj of gameObjects) {
                        if (obj.team && obj.team !== this.team && obj.type === 'unit' && obj.hp > 0) {
                            const d = dist(this, obj);
                            if (d < this.attackRange && d < minDis) {
                                minDis = d;
                                closestEnemyUnit = obj;
                            }
                        }
                    }

                    if (closestEnemyUnit) {
                        projectiles.push(new Projectile(this, closestEnemyUnit));
                        this.attackTimer = this.attackCooldown;
                    }
                }
            }

            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                const team = teamData[this.team];
                if (this.subType === 'townhall') {
                    // Spawn worker if not too many (no cost)
                    const workers = gameObjects.filter(o => o.team === this.team && o.subType === 'worker').length;
                    if (workers < 5) { // Rule 1: Cap at 5 workers (cost removed)
                        spawnUnit('worker', this.team, this.x, this.y + this.radius + 10);
                        this.spawnTimer = 5; // Worker spawn time
                    }
                } else if (this.subType === 'barracks') {
                    // Spawn combat unit (no cost)
                    const unitType = Math.random() > 0.5 ? 'melee' : 'ranged';
                    spawnUnit(unitType, this.team, this.x, this.y + this.radius + 10);
                    this.spawnTimer = 6; // Combat unit spawn time
                }
            }
        }
    }

    class Unit extends GameObject {
        constructor(x, y, radius, team, subType) {
            super(x, y, radius, team, 'unit');
            this.subType = subType;
            this.color = teamData[team].color;
            this.speed = 60; // pixels per second
            this.state = 'idle'; // idle, moving, gathering, attacking, returning
            this.target = null;
            this.heldResource = null;
            
            // Combat stats
            this.attackRange = 15;
            this.attackDamage = 10;
            this.attackCooldown = 1.5;
            this.attackTimer = 0;
            
            if (this.subType === 'worker') {
                this.buildCheckTimer = 15 + Math.random() * 5; // Rule 2: Worker build timer
            } else {
                // Rule 4: New units move to rally point
                this.state = 'movingToRally';
                // Rally point is now 75% to center
                const center = { x: canvas.width / 2, y: canvas.height / 2 };
                this.target = {
                    x: this.x + (center.x - this.x) * 0.75,
                    y: this.y + (center.y - this.y) * 0.75
                };
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.subType === 'worker') {
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            } else if (this.subType === 'melee') {
                ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            } else if (this.subType === 'ranged') {
                ctx.moveTo(this.x, this.y - this.radius);
                ctx.lineTo(this.x + this.radius, this.y + this.radius);
                ctx.lineTo(this.x - this.radius, this.y + this.radius);
                ctx.closePath();
            } else if (this.subType === 'special') {
                // Draw special unit as a big hexagon
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.lineTo(
                        this.x + Math.cos(angle) * this.radius,
                        this.y + Math.sin(angle) * this.radius
                    );
                }
                ctx.closePath();
            }
            ctx.fill();

            // Draw held resource
            if (this.heldResource === 'gold') {
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(this.x - 2, this.y - 10, 4, 4);
            } else if (this.heldResource === 'wood') {
                ctx.fillStyle = '#8c5a2e';
                ctx.fillRect(this.x - 2, this.y - 10, 4, 4);
            }
            
            this.drawHpBar();
        }

        moveTo(target, dt) {
            if (!target) return;
            const d = dist(this, target);
            if (d < 5) return; // Arrived
            
            const moveAmount = this.speed * dt;
            
            // 1. Desired movement vector (normalized)
            let moveX = (target.x - this.x) / d;
            let moveY = (target.y - this.y) / d;
            
            // 2. Avoidance vector (for buildings)
            let avoidX = 0;
            let avoidY = 0;
            const avoidanceRadius = this.radius + 30; // How far to "look" for obstacles

            // Rule 6: Separation vector (for allied units)
            let separationX = 0;
            let separationY = 0;
            const separationRadius = this.radius + 10;

            for (const obj of gameObjects) {
                // Building avoidance
                if (obj.type === 'building' && obj !== this.target) {
                    const dToObstacle = dist(this, obj);
                    
                    // If we are in the "bubble" of an obstacle
                    if (dToObstacle > 0 && dToObstacle < avoidanceRadius + obj.radius) {
                        // Calculate repulsion vector
                        let repelX = this.x - obj.x;
                        let repelY = this.y - obj.y;
                        
                        // Normalize
                        const repelMag = Math.sqrt(repelX*repelX + repelY*repelY);
                        if (repelMag > 0) {
                            // Weight by distance (stronger repulsion when closer)
                            const repelStrength = 1 - (dToObstacle / (avoidanceRadius + obj.radius));
                            avoidX += (repelX / repelMag) * repelStrength;
                            avoidY += (repelY / repelMag) * repelStrength;
                        }
                    }
                }
                
                // Rule 6: Unit separation
                if (obj.type === 'unit' && obj.team === this.team && obj !== this) {
                    const dToAlly = dist(this, obj);
                    if (dToAlly > 0 && dToAlly < separationRadius) {
                        let repelX = this.x - obj.x;
                        let repelY = this.y - obj.y;
                        const repelMag = Math.sqrt(repelX*repelX + repelY*repelY);
                        const repelStrength = 1 - (dToAlly / separationRadius);
                        separationX += (repelX / repelMag) * repelStrength;
                        separationY += (repelY / repelMag) * repelStrength;
                    }
                }
            }

            // 3. Combine vectors (give avoidance a higher weight)
            let finalX = moveX + avoidX * 2 + separationX * 1.5;
            let finalY = moveY + avoidY * 2 + separationY * 1.5;
            
            // 4. Normalize the final vector
            const finalMag = Math.sqrt(finalX*finalX + finalY*finalY);
            if (finalMag > 0) {
                finalX /= finalMag;
                finalY /= finalMag;
            } else if (d > 0) {
                // Failsafe: if vectors cancelled out, just use original
                finalX = moveX;
                finalY = moveY;
            } else {
                finalX = 0;
                finalY = 0;
            }

            // 5. Apply movement
            this.x += finalX * moveAmount;
            this.y += finalY * moveAmount;
        }

        // Rule 2: New method for workers to attempt building
        attemptToBuild() {
            if (this.state === 'building') return false; // Already building
            
            const team = teamData[this.team];
            const townhall = team.townhall;
            
            // Rule 4 Fix: If townhall is destroyed, worker can't build
            if (!townhall) return false;
            
            // Rule 2: Update building counts and maximums
            const barracksCount = gameObjects.filter(o => o.team === this.team && o.subType === 'barracks').length;
            const farmCount = gameObjects.filter(o => o.team === this.team && o.subType === 'farm').length;
            const towerCount = gameObjects.filter(o => o.team === this.team && o.subType === 'tower').length;
            
            const wantBarracks = barracksCount < 6; // Max 6
            const wantFarm = farmCount < 10;       // Max 10
            const wantTower = towerCount < 4;        // Max 4

            let buildTarget = null;
            let buildRadius = 0;
            
            // Rule 2: Updated build priority
            if (wantBarracks) {
                buildTarget = 'barracks';
                buildRadius = 18;
            } else if (wantTower) {
                buildTarget = 'tower';
                buildRadius = 12;
            } else if (wantFarm) {
                buildTarget = 'farm';
                buildRadius = 15;
            }

            if (buildTarget) {
                // Rule 2 Fix: Try to find a clear spot 20 times (was 10)
                // Bug Fix: Expand build radius from 200 to 400
                for (let i = 0; i < 20; i++) {
                    const buildX = townhall.x + (Math.random() - 0.5) * 400; // Expanded build radius
                    const buildY = townhall.y + (Math.random() - 0.5) * 400; // Expanded build radius
                    
                    if (isPositionClear(buildX, buildY, buildRadius)) {
                        // team.wood -= cost; // No cost
                        const newBuilding = new Building(buildX, buildY, buildRadius, this.team, buildTarget);
                        newBuilding.isUnderConstruction = true;
                        gameObjects.push(newBuilding);
                        
                        this.state = 'building';
                        this.target = newBuilding;
                        return true; // Found a spot and started building
                    }
                }
            }
            return false; // Failed to build
        }

        findJob() {
            // This job is now only for finding resources
            this.target = getNearest(this, 'resource');
            if (this.target) {
                this.state = 'movingToResource';
            }
        }

        updateWorker(dt) {
            // Rule 2: Check build timer
            this.buildCheckTimer -= dt;
            if (this.buildCheckTimer <= 0) {
                this.buildCheckTimer = 15 + Math.random() * 5; // Reset timer
                if (this.state !== 'building') {
                    this.attemptToBuild();
                }
            }

            switch (this.state) {
                case 'idle':
                    this.findJob();
                    break;
                case 'movingToResource':
                    if (!this.target || this.target.toRemove) {
                        this.state = 'idle';
                        break;
                    }
                    this.moveTo(this.target, dt);
                    if (dist(this, this.target) < this.target.radius + this.radius) {
                        this.state = 'gathering';
                        this.target.gatherTimer = 1.5; // 1.5 seconds to gather
                    }
                    break;
                case 'gathering':
                    if (!this.target) { this.state = 'idle'; break; }
                    this.target.gatherTimer -= dt;
                    if (this.target.gatherTimer <= 0) {
                        this.heldResource = this.target.resourceType;
                        this.target.amount -= 10;
                        if (this.target.amount <= 0) this.target.toRemove = true;
                        this.target = teamData[this.team].townhall; // Return to townhall
                        this.state = 'returning';
                    }
                    break;
                case 'returning':
                    // Rule 4 Fix: Check if townhall (target) still exists
                    if (!this.target || this.target.toRemove) {
                         // Townhall destroyed, just drop resources and go idle
                        this.heldResource = null;
                        this.state = 'idle';
                        break;
                    }
                    this.moveTo(this.target, dt);
                     if (dist(this, this.target) < this.target.radius + this.radius) {
                        if (this.heldResource === 'gold') teamData[this.team].gold += 10;
                        if (this.heldResource === 'wood') teamData[this.team].wood += 10;
                        this.heldResource = null;
                        this.state = 'idle';
                    }
                    break;
                case 'building':
                    if (!this.target || this.target.toRemove) {
                        this.state = 'idle';
                        break;
                    }
                    
                    // Move to building site
                    this.moveTo(this.target, dt);
                    
                    // If in range, build
                    if (dist(this, this.target) < this.target.radius + this.radius + 5) { // Stand next to it
                        this.target.buildProgress += dt;
                        
                        // Check if building is finished
                        if (this.target.buildProgress >= this.target.maxBuildTime) {
                            this.target.isUnderConstruction = false;
                            this.target.hp = this.target.maxHp; // Top off HP
                            this.state = 'idle';
                        }
                    }
                    break;
            }
        }
        
        updateCombat(dt) {
            this.attackTimer -= dt;

            // Rule 4: "Attack-move" is handled by this existing aggro check
            const nearbyEnemy = getNearestEnemy(this);
            if (nearbyEnemy) {
                const d = dist(this, nearbyEnemy);
                if (d < 100) { // 100px aggro range
                    // If not already attacking this enemy, or not attacking at all...
                    if (this.target !== nearbyEnemy || this.state !== 'attacking') {
                        // ...or if current target is much further away
                        if (!this.target || dist(this, this.target) > d + 20) {
                             this.state = 'attacking';
                             this.target = nearbyEnemy;
                        }
                    }
                }
            }
            
            // 1. Find target if idle or target is dead
            if (this.state === 'movingToRally') {
                if (this.target) {
                    this.moveTo(this.target, dt);
                    if (dist(this, this.target) < 10) {
                        this.state = 'idle';
                        this.target = null;
                    }
                } else {
                    this.state = 'idle'; // Target was null, just go idle
                }
                
            } else if (this.state !== 'attacking' || !this.target || this.target.toRemove) {
                 this.state = 'idle';
                 this.target = null;
                    
                // Rule 1: Resume attack-move
                // If we were attacking, find a new target
                const newTarget = getNearestEnemy(this);
                if (newTarget) {
                    this.state = 'attacking';
                    this.target = newTarget;
                }
                // 3-Way Fix: Removed old logic that checked for a single enemyBase
                // getNearestEnemy() now finds *any* enemy, so if it returns null,
                // the unit correctly goes idle.
            }
            
            // 2. Execute 'attacking' state
            if (this.state === 'attacking' && this.target) {
                const d = dist(this, this.target);
                
                if (d > this.attackRange) {
                    // Move into range
                    this.moveTo(this.target, dt);
                } else {
                    // In range, attack
                    if (this.attackTimer <= 0) {
                        this.attackTimer = this.attackCooldown;
                        
                        if (this.subType === 'melee') {
                            // Melee attack
                            this.target.takeDamage(this.attackDamage);
                            effects.push(new Effect(this.target.x, this.target.y, 5, 'rgba(255, 255, 255, 0.8)', 0.1));
                        } else if (this.subType === 'ranged') {
                            // Ranged attack
                            projectiles.push(new Projectile(this, this.target));
                        } else if (this.subType === 'special') {
                            // New AOE Attack
                            const aoeRadius = 40;
                            // Show AOE effect
                            effects.push(new Effect(this.target.x, this.target.y, aoeRadius, 'rgba(255, 100, 0, 0.5)', 0.4));
                            
                            // Damage all enemies in radius
                            for (const obj of gameObjects) {
                                if (obj.team && obj.team !== this.team && (obj.type === 'unit' || obj.type === 'building')) {
                                    if (dist(this.target, obj) < aoeRadius) {
                                        obj.takeDamage(this.attackDamage);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        update(dt) {
            if (this.subType === 'worker') {
                this.updateWorker(dt);
            } else {
                this.updateCombat(dt);
            }
        }
    }
    
    class Projectile extends GameObject {
        constructor(attacker, target) {
            super(attacker.x, attacker.y, 3, attacker.team, 'projectile');
            this.color = attacker.color;
            this.target = target;
            this.speed = 150;
            this.damage = attacker.attackDamage; // Gets damage from the attacker (unit or tower)
        }
        
        update(dt) {
            if (!this.target || this.target.toRemove) {
                this.toRemove = true;
                return;
            }
            
            const d = dist(this, this.target);
            if (d < 5) {
                // Hit target
                this.target.takeDamage(this.damage);
                this.toRemove = true;
                return;
            }
            
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const moveAmount = this.speed * dt;
            
            this.x += (dx / d) * moveAmount;
            this.y += (dy / d) * moveAmount;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    class Effect extends GameObject {
        constructor(x, y, radius, color, duration = 0.5) {
            super(x, y, radius, null, 'effect');
            this.color = color;
            this.duration = duration;
            this.life = duration;
            this.maxRadius = radius * 1.5;
        }
        
        update(dt) {
            this.life -= dt;
            if (this.life <= 0) {
                this.toRemove = true;
            }
        }
        
        draw() {
            const progress = 1 - (this.life / this.duration);
            const currentRadius = this.radius + (this.maxRadius - this.radius) * progress;
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // --- Game Logic ---
    function spawnUnit(subType, team, x, y) {
        let unit;
        if (subType === 'worker') {
            unit = new Unit(x, y, 5, team, 'worker');
            unit.speed = 70;
        } else if (subType === 'melee') {
            unit = new Unit(x, y, 6, team, 'melee');
            unit.speed = 50;
            unit.attackRange = 20;
            unit.attackDamage = 15;
            unit.attackCooldown = 1;
            unit.hp = 120;
            unit.maxHp = 120;
        } else if (subType === 'ranged') {
            unit = new Unit(x, y, 5, team, 'ranged');
            unit.speed = 55;
            unit.attackRange = 80;
            unit.attackDamage = 8;
            unit.attackCooldown = 1.2;
        } else if (subType === 'special') {
            unit = new Unit(x, y, 10, team, 'special'); // Bigger radius
            unit.speed = 40; // Slower
            unit.attackRange = 25; // Melee range
            unit.attackDamage = 25; // High damage
            unit.attackCooldown = 2.0; // Slower attack
            unit.hp = 500;
            unit.maxHp = 500;
        }
        gameObjects.push(unit);
    }

    // Rule 4: New function to trigger global attack
    function triggerGlobalAttack(team) {
        // 3-Way Combat: Find all enemy teams
        const enemyTeams = Object.keys(teamData).filter(t => t !== team && teamData[t].townhall); // Only target teams still in game
        if (enemyTeams.length === 0) return;

        const enemyTargets = enemyTeams.map(enemyTeam => {
            let target = teamData[enemyTeam].townhall;
            if (!target || target.toRemove) {
                // Find any building of that specific enemy team
                target = getNearest({ x: 0, y: 0 }, 'building', enemyTeam);
            }
            return target;
        }).filter(t => t); // Filter out null targets (if a team is wiped)

        if (enemyTargets.length === 0) return; // No enemy buildings left on the map

        const combatUnits = gameObjects.filter(obj => obj.team === team && (obj.subType === 'melee' || obj.subType === 'ranged' || obj.subType === 'special'));
        
        // 3-Way Combat: Divide units among all available targets
        combatUnits.forEach((unit, index) => {
            unit.state = 'attacking';
            const targetIndex = index % enemyTargets.length;
            unit.target = enemyTargets[targetIndex];
        });
    }

    function init() {
        gameObjects = [];
        projectiles = [];
        effects = [];

        // Reset team data (in case townhall was nulled)
        teamData.blue.townhall = null;
        teamData.red.townhall = null;
        teamData.purple.townhall = null; // Reset purple

        // Spawn resources
        for (let i = 0; i < 16; i++) { // More resources (was 8)
            gameObjects.push(new ResourceNode(Math.random() * canvas.width, Math.random() * canvas.height, 'gold'));
            gameObjects.push(new ResourceNode(Math.random() * canvas.height, Math.random() * canvas.height, 'tree'));
        }

        // Spawn bases in a triangle
        const padding = 100;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Blue: Top-Left
        const baseX1 = padding + Math.random() * padding;
        const baseY1 = padding + Math.random() * padding;
        teamData.blue.townhall = new Building(baseX1, baseY1, 25, 'blue', 'townhall');
        
        // Red: Top-Right
        const baseX2 = canvas.width - padding - Math.random() * padding;
        const baseY2 = padding + Math.random() * padding;
        teamData.red.townhall = new Building(baseX2, baseY2, 25, 'red', 'townhall');
        
        // Purple: Bottom-Center
        const baseX3 = center.x + (Math.random() - 0.5) * padding;
        const baseY3 = canvas.height - padding - Math.random() * padding;
        teamData.purple.townhall = new Building(baseX3, baseY3, 25, 'purple', 'townhall');

        gameObjects.push(teamData.blue.townhall);
        gameObjects.push(teamData.red.townhall);
        gameObjects.push(teamData.purple.townhall);
        
        // Rule 4: Calculate rally points (75% to center)
        [teamData.blue, teamData.red, teamData.purple].forEach(team => {
            if (!team.townhall) return; // Failsafe
            team.rallyPoint = {
                x: team.townhall.x + (center.x - team.townhall.x) * 0.75,
                y: team.townhall.y + (center.y - team.townhall.y) * 0.75
            };
        });

        // Spawn initial workers
        for (let i = 0; i < 5; i++) {
            spawnUnit('worker', 'blue', teamData.blue.townhall.x + 30 + (Math.random() - 0.5) * 20, teamData.blue.townhall.y + (Math.random() - 0.5) * 20);
            spawnUnit('worker', 'red', teamData.red.townhall.x - 30 + (Math.random() - 0.5) * 20, teamData.red.townhall.y + (Math.random() - 0.5) * 20);
            spawnUnit('worker', 'purple', teamData.purple.townhall.x + (Math.random() - 0.5) * 20, teamData.purple.townhall.y + 30 + (Math.random() - 0.5) * 20);
        }
    }

    let lastTime = 0;
    function gameLoop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (dt > 0.1) { // Cap delta time to prevent physics explosions
             requestAnimationFrame(gameLoop);
             return;
        }

        // --- Update ---
        // Rule 4: Update global attack timer
        globalAttackTimer -= dt;
        if (globalAttackTimer <= 0) {
            globalAttackTimer = 40;
            triggerGlobalAttack('blue');
            triggerGlobalAttack('red');
            triggerGlobalAttack('purple'); // Trigger for purple
        }
        
        // New Special Unit Timer
        specialUnitTimer -= dt;
        if (specialUnitTimer <= 0) {
            specialUnitTimer = 60;
            // Check for each team
            Object.keys(teamData).forEach(team => {
                if (teamData[team].townhall) { // Check if team is alive
                    const specialUnits = gameObjects.filter(o => o.team === team && o.subType === 'special').length;
                    if (specialUnits < 2) {
                        spawnUnit('special', team, teamData[team].townhall.x, teamData[team].townhall.y + 30);
                    }
                }
            });
        }

        for (const obj of gameObjects) obj.update(dt);
        for (const p of projectiles) p.update(dt);
        for (const e of effects) e.update(dt); // <-- Bug Fix: This line was missing!
        
        // Rule 1: Simulation Reset Logic (Updated for 3+ teams)
        if (!window.restarting) {
            const buildingCounts = Object.keys(teamData).map(team => ({
                team,
                count: gameObjects.filter(o => o.team === team && o.type === 'building').length
            }));
            
            const teamsWithBuildings = buildingCounts.filter(data => data.count > 0);
            
            if (teamsWithBuildings.length === 1) {
                const winner = teamsWithBuildings[0].team;
                window.restarting = true;
                console.log(`${winner} Wins! Restarting...`);
                setTimeout(() => {
                    init();
                    window.restarting = false;
                }, 3000); // Restart after 3 seconds
            } else if (teamsWithBuildings.length === 0) {
                // Draw or all destroyed simultaneously
                window.restarting = true;
                console.log(`Draw! Restarting...`);
                setTimeout(() => {
                    init();
                    window.restarting = false;
                }, 3000);
            }
        }

        // --- Remove dead objects ---
        gameObjects = gameObjects.filter(o => !o.toRemove);
        projectiles = projectiles.filter(p => !p.toRemove);
        effects = effects.filter(e => !e.toRemove);

        // --- Draw ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all game objects
        for (const obj of gameObjects) obj.draw(ctx);
        for (const p of projectiles) p.draw(ctx);
        for (const e of effects) e.draw(ctx);

        requestAnimationFrame(gameLoop);
    }

    // --- Start ---
    init();
    requestAnimationFrame(gameLoop);
}