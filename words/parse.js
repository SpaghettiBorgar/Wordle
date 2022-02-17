const { MongoClient } = require('mongodb');
const fs = require('fs');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

var db;
var collection;

async function read() {
	console.log("reading");
	return fs.readFileSync('lemma.en.txt').toString().split('\n').filter(i=>!i.startsWith(';'));
	console.log("reading done");
}

async function connect() {
	await client.connect();
	console.log('Connected');

	return;
}

(async ()=>{
	await connect();
	const data = await read();
	console.log(data.length);

	db = client.db('words');
	collection = db.collection('english-lemmas');
	console.log('initialized');

	for(l of data) {
		const s1 = l.split(' -> ');
		const s2 = s1[0].split('/');
		const s3 = s1[1].split(',');
		console.log(s2[0]);
		collection.insertOne({
			lemma: s2[0],
			freq:  s2[1],
			forms: s3
		}).then(console.log);
	}
})();
