import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser'; // POSTリクエストのボディを解析するために必要
import { spawn } from 'child_process'; // Pythonスクリプトを呼び出すために必要
import { stringify } from 'csv-stringify';

const app = express();
const port = 8000;

// __dirnameの代わりに以下のように設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORSを許可する
app.use(cors()); // 全てのリクエストに対してCORSを許可

// JSONリクエストボディをパース
app.use(bodyParser.json());

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.stack });
});

// csvにstateを保存
// auto_analysis_kifu.pyを実行
app.post('/append-csv', (req, res) => {
    const data = req.body; // クライアントから送られたデータ

    // データが1次元配列の場合は2次元配列に変換
    const formattedData = Array.isArray(data[0]) ? data : [data];

    const pythonProcess = spawn('python3', [path.join(__dirname, '/public/python/auto_analysis_kifu.py')]);
    pythonProcess.stdin.write(JSON.stringify({ slist: formattedData[0] }));
    pythonProcess.stdin.end();

    let pythonResult = '';
    pythonProcess.stdout.on('data', (data) => {
        pythonResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Pythonエラー:', data.toString());  // エラーメッセージをコンソールに表示
        res.status(500).json({ error: 'Pythonスクリプト実行エラー', details: data.toString() });  // エラーメッセージをレスポンスとして送信
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Pythonプロセスが失敗しました。終了コード: ${code}`);
            return res.status(500).json({ error: 'Pythonスクリプト実行エラー' });
        }

        const result = JSON.parse(pythonResult);
        res.json(result);

        // CSV生成と追記の処理
        stringify(formattedData, { header: false }, (err, output) => {
            if (err) {
                console.error('CSV生成エラー:', err);
                return res.status(500).json({ error: 'CSV生成に失敗しました' });
            }
        });
    });
});


// ハッシュ検索を行うエンドポイント
// unhash.pyを実行
app.post('/unhash', (req, res) => {
    const userInput = req.body;  // クライアントから送信されたハッシュ値

    if (!userInput) {
        return res.status(400).json({ error: 'ハッシュ値が提供されていません' });
    }

    // unhash.pyを実行
    const pythonProcess = spawn('python3', [path.join(__dirname, './public/python/unhash.py')]);

    // 標準入力にデータを送信
    pythonProcess.stdin.write(JSON.stringify(userInput)); // 文字列に変換
    pythonProcess.stdin.end();

    let pythonResult = '';
    pythonProcess.stdout.on('data', (data) => {
        pythonResult += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Pythonエラー:', data.toString());
        res.status(500).json({ error: 'Pythonスクリプト実行エラー', details: data.toString() });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Pythonプロセスが失敗しました。終了コード: ${code}`);
            return res.status(500).json({ error: 'Pythonスクリプト実行エラー' });
        }

        // Pythonの結果を返す
        // 不要な文字を取り除く
        pythonResult = pythonResult
            .replace(/^,|,$/g, '') // 先頭や末尾のカンマを削除
            .replace(/"/g, '');   // ダブルクオートを削除
        res.json(pythonResult);
    });
});


// サーバー起動時に実行されたPythonスクリプトの出力を保存する変数
let scriptOutput = null;

// Pythonスクリプトを非同期で実行する関数
const runPythonScript = (scriptPath, args = []) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args]);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}: ${error}`));
            }
            resolve(output);
        });
    });
};

// サーバー起動時にtree.pyを実行
(async () => {
    const scriptPath = path.join(__dirname, '/public/python/tree.py');
    try {
        const output = await runPythonScript(scriptPath);
        scriptOutput = output; // 出力をグローバル変数に保存

    } catch (error) {
        console.error('Failed to execute Python script:', error);
        scriptOutput = null;
    }
})();

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// スクリプトの出力結果を取得するエンドポイント
app.get('/script-output', (req, res) => {
    if (scriptOutput === null) {
        return res.status(503).json({ message: 'スクリプト実行結果はまだ利用できません。' });
    }
    const result = JSON.parse(scriptOutput);
    console.log('Python結果:', result);
    res.json(result);  // ここで 'result' を返す
});
