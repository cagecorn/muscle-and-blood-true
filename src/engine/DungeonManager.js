import * as Phaser from 'phaser';

// 방의 정보를 담는 간단한 클래스
class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.centerX = x + Math.floor(width / 2);
        this.centerY = y + Math.floor(height / 2);
    }

    // 다른 방과 겹치는지 확인하는 함수
    intersects(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

export class DungeonManager {
    constructor(scene, width, height, wallTileKey) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.wallTileKey = wallTileKey;
        this.tiles = []; // 맵의 타일 데이터를 저장할 2D 배열
        this.rooms = [];
    }

    generateDungeon(roomCount = 15, minRoomSize = 6, maxRoomSize = 12) {
        // 1. 모든 타일을 벽으로 초기화
        this.tiles = Array(this.width).fill(null).map(() => Array(this.height).fill(1)); // 1 = 벽
        this.rooms = [];

        // 2. 무작위 방 생성
        for (let i = 0; i < roomCount; i++) {
            const width = Phaser.Math.Between(minRoomSize, maxRoomSize);
            const height = Phaser.Math.Between(minRoomSize, maxRoomSize);
            const x = Phaser.Math.Between(1, this.width - width - 1);
            const y = Phaser.Math.Between(1, this.height - height - 1);
            this.rooms.push(new Room(x, y, width, height));
        }

        // 3. 방 분리 (겹치지 않도록)
        let separating = true;
        while (separating) {
            separating = false;
            for (let i = 0; i < this.rooms.length; i++) {
                for (let j = i + 1; j < this.rooms.length; j++) {
                    if (this.rooms[i].intersects(this.rooms[j])) {
                        separating = true;
                        // 간단한 분리 로직: 두 방의 중심점 거리를 기준으로 서로 밀어냄
                        const dx = this.rooms[j].centerX - this.rooms[i].centerX;
                        const dy = this.rooms[j].centerY - this.rooms[i].centerY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const moveX = dx / distance;
                        const moveY = dy / distance;

                        this.rooms[i].x -= Math.round(moveX);
                        this.rooms[i].y -= Math.round(moveY);
                        this.rooms[j].x += Math.round(moveX);
                        this.rooms[j].y += Math.round(moveY);
                    }
                }
            }
        }
        
        // 4. 방을 타일맵에 그리기 (바닥으로 만들기)
        this.rooms.forEach(room => {
            for (let x = room.x; x < room.x + room.width; x++) {
                for (let y = room.y; y < room.y + room.height; y++) {
                    if (x > 0 && x < this.width -1 && y > 0 && y < this.height - 1) {
                       this.tiles[x][y] = 0; // 0 = 바닥
                    }
                }
            }
        });

        // 5. 방 연결 (간단화된 델로니 + MST + 루프 추가)
        this.connectRooms();

        return this.tiles;
    }

    connectRooms() {
        // 모든 방을 그들의 가장 가까운 2개의 방과 연결 (간단한 델로니 근사)
        const edges = [];
        for (let i = 0; i < this.rooms.length; i++) {
            const roomA = this.rooms[i];
            let closest = [];
            for (let j = 0; j < this.rooms.length; j++) {
                if (i === j) continue;
                const roomB = this.rooms[j];
                const dist = Phaser.Math.Distance.Between(roomA.centerX, roomA.centerY, roomB.centerX, roomB.centerY);
                closest.push({ room: roomB, dist: dist });
            }
            closest.sort((a, b) => a.dist - b.dist);

            // 가장 가까운 두 방과 연결
            for (let k = 0; k < 2 && k < closest.length; k++) {
                edges.push({ start: roomA, end: closest[k].room, weight: closest[k].dist });
            }
        }

        // MST(최소 신장 트리)를 통해 모든 방이 연결되도록 보장 (Prim's 알고리즘의 간단한 버전)
        const connected = new Set([this.rooms[0]]);
        const mstEdges = [];
        while (connected.size < this.rooms.length) {
            let bestEdge = null;
            for (const edge of edges) {
                if (connected.has(edge.start) && !connected.has(edge.end)) {
                    if (bestEdge === null || edge.weight < bestEdge.weight) {
                        bestEdge = edge;
                    }
                }
            }
            if (bestEdge) {
                mstEdges.push(bestEdge);
                connected.add(bestEdge.end);
            } else {
                break; // 더 이상 연결할 수 없는 경우
            }
        }

        // 15% 확률로 원래 엣지를 추가하여 루프 생성
        edges.forEach(edge => {
            if (Phaser.Math.FloatBetween(0, 1) < 0.15) {
                mstEdges.push(edge);
            }
        });
        
        // 선택된 엣지들을 기반으로 터널 파기
        mstEdges.forEach(edge => {
            this.createTunnel(edge.start, edge.end);
        });
    }

    createTunnel(roomA, roomB) {
        const startX = roomA.centerX;
        const startY = roomA.centerY;
        const endX = roomB.centerX;
        const endY = roomB.centerY;

        if (Phaser.Math.Between(0, 1) === 0) {
            // 수평 -> 수직
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                this.tiles[x][startY] = 0;
            }
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                this.tiles[endX][y] = 0;
            }
        } else {
            // 수직 -> 수평
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                this.tiles[startX][y] = 0;
            }
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                this.tiles[x][endY] = 0;
            }
        }
    }
    
    // 생성된 던전을 화면에 그리는 함수
    renderDungeon(tileSize) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.tiles[x][y] === 1) { // 벽일 경우
                    this.scene.add.image(x * tileSize, y * tileSize, this.wallTileKey).setOrigin(0);
                }
            }
        }
    }
}
