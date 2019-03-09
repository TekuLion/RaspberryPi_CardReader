// カード読み込みパッケージ
const NfcpyId = require('node-nfcpy-id').default;
const nfc = new NfcpyId().start();
// MySQLコネクション接続パッケージ
const request = require('request');
// シェル実行パッケージ
const exec = require('child_process').exec;

// MySQLコネクション接続(カード情報登録製品へのアクセス)
var mysql = require('mysql');
var con = mysql.createConnection({
	host     : 'ipadress',
	user     : 'db_user',
	database : 'database_name',
	password : 'password'
});

// カードタッチのアクション
nfc.on('touchstart', (card) => {
	// 読み込んだカードのIDを取得（本来はこの先のクエリ内で使用）
	var card_id = card.id;

	// カード情報登録製品のDBにクエリを発行（なくても良い）
	// クエリ部分は製品に合わせて適宜変更（resultsも製品によって変わる）
	con.query('query', function(error, results, fields) {
		if(error) {
			console.log('read_error: ' + error);
		}

		if(results === 'undefined') {
			console.log('情報は存在しません');
		} else {
			// シェルコマンドで音を出す(何となくおまけ)
			exec('aplay /usr/share/sounds/alsa/Front_Center.wav', (err, stdout, stderr) => {
				if(err) {
					console.log(err);
				}
			});
			console.log(results);
		}
	});
});

// カードを離した際のアクション
nfc.on('touchend', (card) => {
	// Slack通知オプション（適宜変更）
	var message = '@here\n' +
		results + 'さんが来ました。';
	var payload = {
		channel : 'channel_name',
		username : 'title',
		text : message,
		link_names : true
	};

	payload = JSON.stringify(payload);

	var options = {
		url : 'slack_webhook',
		form : payload,
		json : true
	};

	// Slack通知
	request.post(options, function(error, response, body) {
		if(error) {
			console.log('send_error: ' + response.statusCode + body);
		} else {
			console.log(body);
			}
	});
});

nfc.on('error', (err) => {
	console.error('\u001b[31m', err, '\u001b[0m');
});
