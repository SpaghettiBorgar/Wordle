const fs = require('fs');

async function read() {
	console.log("reading");
	return fs.readFileSync('lemma.en.txt').toString().split('\n').filter(i=>!i.startsWith(';'));
	console.log("reading done");
}

(async ()=>{
	const data = await read();
	console.log(data.length);

	console.log('initialized');

	data.map(i=>i.split('/')[0]);

})();
