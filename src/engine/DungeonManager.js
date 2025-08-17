import * as Phaser from 'phaser';

// 방의 정보를 담는 간단한 클래스
class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get centerX() {
        return this.x + Math.floor(this.width / 2);
    }

    get centerY() {
        return this.y + Math.floor(this.height / 2);
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
    constructor(scene, width, height, wallTileKey, floorTileKey) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.wallTileKey = wallTileKey;
        this.floorTileKey = floorTileKey;
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

                        // 맵 경계를 벗어나지 않도록 클램프
                        this.rooms[i].x = Phaser.Math.Clamp(this.rooms[i].x, 1, this.width - this.rooms[i].width - 1);
                        this.rooms[i].y = Phaser.Math.Clamp(this.rooms[i].y, 1, this.height - this.rooms[i].height - 1);
                        this.rooms[j].x = Phaser.Math.Clamp(this.rooms[j].x, 1, this.width - this.rooms[j].width - 1);
                        this.rooms[j].y = Phaser.Math.Clamp(this.rooms[j].y, 1, this.height - this.rooms[j].height - 1);
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
        // 모든 방 쌍 사이의 거리 계산 (간단한 델로니 근사 대신 전체 그래프)
        const edges = [];
        for (let i = 0; i < this.rooms.length; i++) {
            for (let j = i + 1; j < this.rooms.length; j++) {
                const roomA = this.rooms[i];
                const roomB = this.rooms[j];
                const dist = Phaser.Math.Distance.Between(roomA.centerX, roomA.centerY, roomB.centerX, roomB.centerY);
                edges.push({ roomA, roomB, weight: dist });
            }
        }

        // Prim's 알고리즘을 사용한 최소 신장 트리로 기본 연결 확보
        const connected = new Set([this.rooms[0]]);
        const mstEdges = [];
        while (connected.size < this.rooms.length) {
            let bestEdge = null;
            for (const edge of edges) {
                const aConnected = connected.has(edge.roomA);
                const bConnected = connected.has(edge.roomB);
                if (aConnected && !bConnected || bConnected && !aConnected) {
                    if (!bestEdge || edge.weight < bestEdge.weight) {
                        bestEdge = edge;
                    }
                }
            }
            if (bestEdge) {
                mstEdges.push(bestEdge);
                connected.add(bestEdge.roomA);
                connected.add(bestEdge.roomB);
            } else {
                break; // 더 이상 연결할 수 없는 경우
            }
        }

        // 추가 간선을 일부 선택하여 루프 생성
        edges.forEach(edge => {
            if (!mstEdges.includes(edge) && Phaser.Math.FloatBetween(0, 1) < 0.3) {
                mstEdges.push(edge);
            }
        });

        // 선택된 엣지들을 기반으로 터널 파기
        mstEdges.forEach(edge => {
            this.createTunnel(edge.roomA, edge.roomB);
        });

        // 최종적으로 모든 방이 연결되었는지 확인하고 누락된 방을 보완
        this.ensureConnectivity();
    }

    ensureConnectivity() {
        const visited = Array(this.width).fill(null).map(() => Array(this.height).fill(false));
        const queue = [];
        const start = { x: this.rooms[0].centerX, y: this.rooms[0].centerY };
        queue.push(start);
        visited[start.x][start.y] = true;
        const dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            for (const dir of dirs) {
                const nx = x + dir.x;
                const ny = y + dir.y;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    if (this.tiles[nx][ny] === 0 && !visited[nx][ny]) {
                        visited[nx][ny] = true;
                        queue.push({ x: nx, y: ny });
                    }
                }
            }
        }

        // 방문하지 못한 방이 있다면 가장 가까운 방문 지점과 연결
        let allConnected = true;
        for (const room of this.rooms) {
            if (!visited[room.centerX][room.centerY]) {
                allConnected = false;
                let target = null;
                let bestDist = Infinity;
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        if (visited[x][y] && this.tiles[x][y] === 0) {
                            const dist = Phaser.Math.Distance.Between(room.centerX, room.centerY, x, y);
                            if (dist < bestDist) {
                                bestDist = dist;
                                target = { centerX: x, centerY: y };
                            }
                        }
                    }
                }
                if (target) {
                    this.createTunnel(room, target);
                }
            }
        }

        // 새로 연결한 방이 있다면 다시 확인
        if (!allConnected) {
            this.ensureConnectivity();
        }
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
                const tile = this.tiles[x][y];
                if (tile === 1) {
                    this.scene.add.image(x * tileSize, y * tileSize, this.wallTileKey).setOrigin(0);
                } else if (tile === 0) {
                    this.scene.add.image(x * tileSize, y * tileSize, this.floorTileKey).setOrigin(0);
                }
            }
        }
    }

    getTileAt(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[x][y];
        }
        return 1; // 맵 밖은 벽으로 처리
    }
}
