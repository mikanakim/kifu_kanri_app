// ローカルのthree.jsモジュールをインポート
import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControls } from 'OrbitControls';

const port=8000;

/**
 * レンダラーの設定
 */
// シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2.5, 7, 2.5);
const renderer = new THREE.WebGLRenderer();

// デフォルトの解像度よりも高い解像度で描画
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// `renderer` をHTMLの指定位置に追加
const rendererContainer = document.getElementById('renderer-container');
rendererContainer.appendChild(renderer.domElement);

// rendererをHTMLの指定サイズに変更
const width = rendererContainer.clientWidth;
const height = rendererContainer.clientHeight;
renderer.setSize(width, height);

// 背景色を白に設定
renderer.setClearColor(0xaeaeae, 1); // (色, アルファ)

// ライトの追加
const light = new THREE.AmbientLight(0xf7f7f7, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 3, 0).normalize();
scene.add(directionalLight);

// GLTFLoaderでモデルを読み込む
const loader = new GLTFLoader();
let model;

/**
 * モデルの配置
 * 盤面のモデルと球のモデル
 */
// モデルのパス（複数のモデル）
// 色は後で変えるので実は何でもいい
const modelPaths = [
    '/models/white_sphere.glb',
    '/models/black_sphere.glb'
];

// 盤面だけを単独で表示する
loader.load(
    '/models/board.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model); // モデルをシーンに追加
        model.position.set(0, -1.5, 0); // モデルの位置を調整

        // 特定のオブジェクトの座標を変更
        model.traverse((child) => {
            if (child.name === '円柱001') {
                child.position.set(0.75, 1.85, -0.75);

            }else if (child.name === '円柱002') {
                child.position.set(0.75, 1.85, -0.75-1.25);
            
            }else if (child.name === '円柱003') {
                child.position.set(0.75, 1.85, -0.75-2.5);
            
            }else if (child.name === '円柱004') {
                child.position.set(0.75, 1.85, -0.75-3.75);
            
            }else if (child.name === '円柱005') {
                child.position.set(0.75+1.25, 1.85, -0.75);
            
            }else if (child.name === '円柱006') {
                child.position.set(0.75+1.25, 1.85, -0.75-1.25);
            
            }else if (child.name === '円柱007') {
                child.position.set(0.75+1.25, 1.85, -0.75-2.5);
            
            }else if (child.name === '円柱008') {
                child.position.set(0.75+1.25, 1.85, -0.75-3.75);
            
            }else if (child.name === '円柱009') {
                child.position.set(0.75+2.5, 1.85, -0.75);
            
            }else if (child.name === '円柱010') {
                child.position.set(0.75+2.5, 1.85, -0.75-1.25);
            
            }else if (child.name === '円柱011') {
                child.position.set(0.75+2.5, 1.85, -0.75-2.5);
            
            }else if (child.name === '円柱012') {
                child.position.set(0.75+2.5, 1.85, -0.75-3.75);
            
            }else if (child.name === '円柱013') {
                child.position.set(0.75+3.75, 1.85, -0.75);
            
            }else if (child.name === '円柱014') {
                child.position.set(0.75+3.75, 1.85, -0.75-1.25);
            
            }else if (child.name === '円柱015') {
                child.position.set(0.75+3.75, 1.85, -0.75-2.5);
            
            }else if (child.name === '円柱016') {
                child.position.set(0.75+3.75, 1.85, -0.75-3.75);

            }
        });

        model.traverse((child) => {
            if (child.name === '立方体') {
                child.scale.set(2.75, 0.075, 2.75);
                child.position.set(2.65, 0, -2.65);
            }else if(child.name == '円柱001'||child.name == '円柱002'||child.name == '円柱003'||child.name == '円柱004'||
                child.name == '円柱005'||child.name == '円柱006'||child.name == '円柱007'||child.name == '円柱008'||
                child.name == '円柱009'||child.name == '円柱010'||child.name == '円柱011'||child.name == '円柱012'||
                child.name == '円柱013'||child.name == '円柱014'||child.name == '円柱015'||child.name == '円柱016'){
                child.scale.set(0.08, 1.75, 0.08); 
            }
        });
        renderer.domElement.addEventListener('click', onClick);
    },
    undefined, 
    (error) => {
        console.error('An error happened:', error);
    }
);

let num_load_sphere = 0;

// 配置した球を追跡するための履歴
// どちらもFILO(First in Last out)
let placedBalls = [];
let removedBalls = [];

// 球を表示する関数
async function loadModel(path, scale, position, color) {
    loader.load(
        path, // モデルのパス
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            model.position.set(position.x, position.y, position.z);
            model.traverse((object) => {
                if (object.isMesh) { // メッシュのみ対象
                    object.material.color.set(color);
                    if (color === 0xc8b182) {
                        object.name = 'white_sphere';
                    } else if (color === 0x5d503c) {
                        object.name = 'black_sphere';
                    }
                }
            });
            num_load_sphere+=1;

            scene.add(model);
            placedBalls.push(model);

        },
        undefined,
        (error) => {
            console.error('An error happened:', error);
        }
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
}

/**
 * ボタン操作
 */
// 戻るボタン
document.getElementById('undo-button').addEventListener('click', () => {
    if (placedBalls.length > 0) {
        const lastBall = placedBalls.pop(); // 最新の球を履歴から削除
        removedBalls.push(lastBall);// 削除した球リストに追加
        scene.remove(lastBall); // シーンから削除
        if (lastBall.geometry) lastBall.geometry.dispose(); 
        if (lastBall.material) lastBall.material.dispose();
        num_load_sphere += -1;
    } else {
        console.log("戻す球がありません。");
    }
});

// 球を再出現させるボタン
document.getElementById('reset-balls-btn').addEventListener('click', () => {
    if (removedBalls.length > 0){
        const redisplayBall = removedBalls.pop();
        if (num_load_sphere%2 == 0){
            loadModel(modelPaths[0], 0.45, redisplayBall.position, 0xc8b182);
        }else{
            loadModel(modelPaths[0], 0.45, redisplayBall.position, 0x5d503c);
        }
    }else{
        console.log('再出現させる球がありません');
    }
});

// リセットボタン
document.getElementById('all-reset-btn').addEventListener('click', async() => {
    if (placedBalls.length > 0) {
        console.log('placed balls: ', placedBalls);
        async function remove_all_balls() {
            while (placedBalls.length > 0) { // 配列に要素がある限り削除を繰り返す
                const lastBall = placedBalls.pop();
                removedBalls.push(lastBall);
                scene.remove(lastBall);
                num_load_sphere -= 1;

                if (lastBall.geometry) lastBall.geometry.dispose(); 
                if (lastBall.material) lastBall.material.dispose();

            }
        }

        // 完全に削除が完了するまで待機
        await remove_all_balls();
        placedBalls = [];
        removedBalls = [];
    }
});

// saveボタン
// サーバーにstateのリストデータを送信し、csvに保存
document.getElementById('save-state-btn').addEventListener('click', () =>{
    // データ生成
    let dataList = [];
    if (placedBalls.length == 0){
        console.log('履歴が空です');
        return
    };
    // 球の座標を立体四目のidに変換
    placedBalls.forEach((ball) => {
        if (ball.position.x == 0.75 && ball.position.z == -4.5){
            dataList.push(0);
        }else if(ball.position.x == 2 && ball.position.z == -4.5){
            dataList.push(1);
        }else if(ball.position.x == 3.25 && ball.position.z == -4.5){
            dataList.push(2);
        }else if(ball.position.x == 4.5 && ball.position.z == -4.5){
            dataList.push(3);
        }else if(ball.position.x == 0.75 && ball.position.z == -3.25){
            dataList.push(4);
        }else if(ball.position.x == 2 && ball.position.z == -3.25){
            dataList.push(5);
        }else if(ball.position.x == 3.25 && ball.position.z == -3.25){
            dataList.push(6);
        }else if(ball.position.x == 4.5 && ball.position.z == -3.25){
            dataList.push(7);
        }else if(ball.position.x == 0.75 && ball.position.z == -2){
            dataList.push(8);
        }else if(ball.position.x == 2 && ball.position.z == -2){
            dataList.push(9);
        }else if(ball.position.x == 3.25 && ball.position.z == -2){
            dataList.push(10);
        }else if(ball.position.x == 4.5 && ball.position.z == -2){
            dataList.push(11);
        }else if(ball.position.x == 0.75 && ball.position.z == -0.75){
            dataList.push(12);
        }else if(ball.position.x == 2 && ball.position.z == -0.75){
            dataList.push(13);
        }else if(ball.position.x == 3.25 && ball.position.z == -0.75){
            dataList.push(14);
        }else if(ball.position.x == 4.5 && ball.position.z == -0.75){
            dataList.push(15);
        }
    });

    // // コンテナ内のサーバーにデータを送信
    fetch(`http://localhost:${port}/append-csv`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataList)
    })
        .then(response => {
            if (response.ok) {
                return response.json();  // Pythonからのレスポンスをテキストとして受け取る
            } else {
                console.error('エラーが発生しました。');
                throw new Error('通信エラー');
            }
        })
        .then(pythonResult => {
            // Pythonスクリプトからの結果をHTMLに表示
            const resultDiv = document.getElementById('renderer_yoko');  // HTMLの表示領域
            resultDiv.innerHTML = `<pre>${pythonResult.result}</pre>`;  // 受け取った結果を表示
        })
        .catch(error => {
            console.error('通信エラー:', error);
        });
});

// ハッシュ検索ボタンのクリックイベント
document.getElementById('search-hash-btn').addEventListener('click', () => {
    sendHashRequest();
});

// returnキーが押されたときにも送信する
document.getElementById('hash-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendHashRequest();
    }
});

// unhashのためのリクエスト送信
let kifu_element;
function sendHashRequest() {
    // 入力されたハッシュ値を取得
    const hashInput = document.getElementById('hash-input').value;
    
    if (!hashInput) {
        console.log('ハッシュ値を入力してください');
        return;
    }

    // サーバーに検索リクエストを送信
    fetch(`http://localhost:${port}/unhash`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hash_value: hashInput })  // 入力されたハッシュ値を送信
    })
    .then(response => {
        if (response.ok) {
            return response.json();  // サーバーからのレスポンスをJSONとして取得
        } else {
            console.error('エラーが発生しました。');
            throw new Error('通信エラー');
        }
    })
    .then(pythonResult => {
        // サーバーからの結果をHTMLに表示
        const resultDiv = document.getElementById('show-hash-result');  // 結果表示領域
        resultDiv.innerHTML = `<pre>${pythonResult}</pre>`;  // 結果を表示
        
        kifu_element = pythonResult.split(',').map(Number);
    })
    .catch(error => {
        console.error('通信エラー:', error);
    });
}

// 棋譜の状態を盤面にセットする
document.getElementById('set-state-btn').addEventListener('click', async () => {
    // まずは盤面をリセットする
    if (placedBalls.length > 0) {
        console.log('placed balls: ', placedBalls);
        async function remove_all_balls() {
            while (placedBalls.length > 0) { // 配列に要素がある限り削除を繰り返す
                const lastBall = placedBalls.pop();
                removedBalls.push(lastBall);
                scene.remove(lastBall);
                num_load_sphere -= 1;
                
                if (lastBall.geometry) lastBall.geometry.dispose(); 
                if (lastBall.material) lastBall.material.dispose();
                
            }
        }

        // 完全に削除が完了するまで待機
        await remove_all_balls();
        placedBalls = [];
        removedBalls = [];
    }
        
    // 棋譜の要素をロードする
    // y座標は後で変更するので適当な値
    const positions = [
        {x: 0.75, y: 0.85, z: -4.5}, // 0
        {x: 2, y: 0.85, z: -4.5},    // 1
        {x: 3.25, y: 0.85, z: -4.5}, // 2
        {x: 4.5, y: 0.85, z: -4.5},  // 3
        {x: 0.75, y: 0.85, z: -3.25},// 4
        {x: 2, y: 0.85, z: -3.25},   // 5
        {x: 3.25, y: 0.85, z: -3.25},// 6
        {x: 4.5, y: 0.85, z: -3.25}, // 7
        {x: 0.75, y: 0.85, z: -2},   // 8
        {x: 2, y: 0.85, z: -2},      // 9
        {x: 3.25, y: 0.85, z: -2},   // 10
        {x: 4.5, y: 0.85, z: -2},    // 11
        {x: 0.75, y: 0.85, z: -0.75},// 12
        {x: 2, y: 0.85, z: -0.75},   // 13
        {x: 3.25, y: 0.85, z: -0.75},// 14
        {x: 4.5, y: 0.85, z: -0.75}  // 15
    ];

    let pos_counter = Array(16).fill(0); // カウンタ初期化
    let position;

    // 非同期でモデルをロードする
    for (let i=0; i<kifu_element.length; i++) {
        position = {...positions[kifu_element[i]]};
        position.y = -1 + (0.8 * pos_counter[kifu_element[i]]);
        pos_counter[kifu_element[i]] += 1;

        // モデルの色を交互に設定してロード
        if (i % 2 == 0) {
            await loadModel(modelPaths[0], 0.45, position, 0xc8b182);
        } else {
            await loadModel(modelPaths[0], 0.45, position, 0x5d503c);
        }
    }
});

/**
 * クリックイベントを追加
 * クリックしたら球が配置され、ドラッグしたらクリック判定にはならない
 */
// Raycasterとマウス座標を設定
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let mouseDownPosition = null; // マウスが押された位置

// マウスが押されたときの処理
renderer.domElement.addEventListener('mousedown', (event) => {
    isDragging = false; // ドラッグ状態をリセット
    mouseDownPosition = { x: event.clientX, y: event.clientY }; // マウス押下位置を記録
});

// マウスを動かしたときの処理
renderer.domElement.addEventListener('mousemove', (event) => {
    if (!mouseDownPosition) return;

    // マウス移動距離が一定以上ならドラッグと判定
    const distance = Math.sqrt(
        Math.pow(event.clientX - mouseDownPosition.x, 2) +
        Math.pow(event.clientY - mouseDownPosition.y, 2)
    );
    if (distance > 2) { // ドラッグとみなす移動距離（例: 5px）
        isDragging = true;
    }
});

// マウスが離されたときの処理
renderer.domElement.addEventListener('mouseup', (event) => {
    if (isDragging) {
        // ドラッグ状態ならクリック処理をスキップ
        return;
    }

    const mouse = {
        x: (event.offsetX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1
    };

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(model, true);
    if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;
        const object = intersects[0].object; // クリックしたオブジェクト

        // 円柱に関連する処理
        if (object.name.startsWith('円柱')) {

            // スナップ処理
            const snapUnit = 0.25; // スナップ単位
            const snappedPosition = {
                x: Math.round(intersectPoint.x / snapUnit) * snapUnit,
                y: Math.round(intersectPoint.y / snapUnit) * snapUnit,
                z: Math.round(intersectPoint.z / snapUnit) * snapUnit
            };            

            // 配置された球の位置を追跡するための変数
            let ballCount = 0;
            let existingBall = null;
            let existingBallYMax = -Infinity; // 最も大きいy座標を追跡

            // すでにその位置に球があるかを確認
            scene.children.forEach((child) => {
                if (child instanceof THREE.Group) {  // childがGroupか確認
                    child.traverse((object) => {  // Group内のすべてのオブジェクトを確認
                        if (object.isMesh && (object.name == 'white_sphere' || object.name == 'black_sphere')) {
                            const ballPosition = child.position;
                            // console.log(`child nameの位置:`, child.position);
                            if (Math.abs(ballPosition.x - snappedPosition.x) < 0.5 &&
                                Math.abs(ballPosition.z - snappedPosition.z) < 0.5) {
                                ballCount++; // 同じ位置にある球の数をカウント
                                if (ballPosition.y > existingBallYMax) {
                                    existingBallYMax = ballPosition.y;
                                }
                                existingBall = object;
                            }
                        }
                    });
                }
            });

            if (ballCount >= 4) {
                console.log("この位置にはすでに4つの球があります。配置できません。");
                return; // 球を配置せずに処理を終了
            }

            // 最も高い位置にある球があった場合、その位置に0.8増加した位置に配置
            if (existingBallYMax > -Infinity) {
                snappedPosition.y = existingBallYMax + 0.8;
            } else {
                // 球がない場合はy = -1で配置
                snappedPosition.y = -1;
            }

            // モデルを色分けして配置
            if (num_load_sphere % 2 === 0) {
                loadModel(modelPaths[0], 0.45, snappedPosition, 0xc8b182);
            } else {
                loadModel(modelPaths[1], 0.45, snappedPosition, 0x5d503c);
            }
            removedBalls = [];
        }
    }
});

// カメラの位置設定
camera.position.z = 5;

// OrbitControlsの設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // 滑らかな動き
controls.dampingFactor = 0.5;  // 動きの滑らかさ
controls.screenSpacePanning = false; // パン操作を制限

controls.target.set(2.45, 0, -2.5);  // 回転中心を設定

// fps設定
let lastTime = 0; // 最後に描画した時間
const fps = 30; // 設定したいFPS
const interval = 1000 / fps; // 描画間隔を計算（ms単位）

// アニメーションループ
function animate(time) {
    requestAnimationFrame(animate);

    // 時間差を計算してFPS制御
    const delta = time - lastTime;
    if (delta > interval) {
        lastTime = time - (delta % interval); // 時間を調整

        // カメラの位置に合わせて光源の位置を更新
        // モデルを見るとき、常に明るくなるように
        directionalLight.position.copy(camera.position);

        controls.update(); // OrbitControlsの更新
        renderer.render(scene, camera); // レンダリング
    }
}

// アニメーションループを開始
animate(0);

// ウィンドウのリサイズに対応
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});