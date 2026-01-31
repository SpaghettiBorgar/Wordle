var numWords = 6;
var numLetters = 5;

var words;
var word;

var running = false;



/* TODO
 * maybe use hide() and show()
 * lose popup
 * word api
 * dictionary checking
 * theme switcher
 * custom game
*/

var curWord = 1;
var curLetter = 1;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

String.prototype.replaceAt = function(index, replacement) {
	return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function tableEntry(row, column) {
	return $(`#wordtable tr:nth-child(${row}) td:nth-child(${column})`);
}

function input(letter) {
	if(curWord <= numWords && curLetter <= numLetters) {
		tableEntry(curWord, curLetter).text(letter);
		curLetter++;
	}
}

function backspace() {
	if(curLetter > 1) {
		curLetter--;
		tableEntry(curWord, curLetter).text("");
	}
}

function markLetter(row, col, state) {
	let cell = tableEntry(row, col);
	cell.removeClass("blank").addClass(state);
	let key = $(`.key:contains(${cell.text()})`).removeClass("blank");
	if(!key.hasClass("correct"))
		key.addClass(state);
}

async function enter() {
	if(!running || curWord > numWords)
		return;
	if(curLetter != numLetters + 1)
		return toast("Not enough letters", 1000);

	let row = curWord;
	let guess = $(`#wordtable tr:nth-child(${row})`).text().trim();

	if(!words.includes(guess.toLowerCase()))
		return toast("Word not in dictionary", 1000);

	curWord++;
	curLetter = 1;

	let wordcp = word;
	let marks = [];

	for(let i = 0; i < numLetters; i++) {
		if(guess.charAt(i) == wordcp.charAt(i)) {
			marks[i] = "correct";
			wordcp = wordcp.replaceAt(i, '_');
			guess = guess.replaceAt(i, '_');
		}
	}

	for(let i = 0; i < numLetters; i++) {
		if(guess.charAt(i) != '_' && wordcp.includes(guess.charAt(i))) {
			marks[i] = "misplaced";
			wordcp = wordcp.replace(guess.charAt(i), '_');
			guess = guess.replaceAt(i, '_');
		}
	}

	for(let i = 0; i < numLetters; i++) {
		if(guess.charAt(i) != '_') {
			marks[i] = "absent";
		}
	}

	for(let i = 0; i < numLetters; i++) {
		markLetter(row, i + 1, `flipped ${marks[i]}`);
		await sleep(200);
	}

	if($(`#wordtable tr:nth-child(${row})`).text().trim() == word)
		return win(row);

	if(curWord > numWords)
		return lose(row);
}

function getResults() {
	res = "";
	for(i = 1; i <= curWord - 1; i++) {
		res += '\n';
		for(j = 1; j <= numLetters; j++) {
			let cell = tableEntry(i, j);
			if(cell.hasClass("correct")) {
				res += '🟩';
			} else if(cell.hasClass("misplaced")) {
				res += '🟨';
			} else {
				res += '⬜';
			}
		}
	}

	return res;
}

async function win(tries) {
	running = false;
	let msg;
	switch(tries) {
		case 1:
			msg = "WOOOOOOOOOW!";
			break;
		case 2:
			msg = "WOOOOOOW!";
			break;
		case 3:
			msg = "WOOOW!";
			break;
		case 4:
			msg = "WOW!";
			break;
		case 5:
			msg = "wow";
			break;
		default:
			msg = "ok";
	}
	toast(msg, 3000);
	await sleep(1000);

	$("#scorepopup .popuptitle").text("Wow you won!");
	$("#potat").attr("src", "happypotat.png");

	$("#results").prepend(`<span>${tries}/${numWords}</span>`);
	$("#results").append(getResults());

	$(".overlay").removeClass("hidden");
	$("#scorepopup").removeClass("hidden");
}

function lose(tries) {
	running = false;
	toast("very sad", 1000);
	$("#popuptitle").text("You lost");

	$("#potat").attr("src", "sadpotat.webp");

	$("#results").prepend(`<h3>X/${numWords}</h3>`);
	$("#results").append(getResults());

	$(".overlay").removeClass("hidden");
	$("#scorepopup").removeClass("hidden");
}

async function toast(msg, timeout) {
	e = $("#alert");
	e.text(msg);
	e.addClass("toasted");
	await sleep(timeout);
	e.removeClass("toasted");
}

$("document").ready(function() {
	$(".key").click(function() {
		if(!running)
			return;
		if($(this).text().match(/[A-Z]/))
			input($(this).text());
		else if($(this).attr("id") == "backspace")
			backspace();
		else if($(this).attr("id") == "enter")
			enter();
	});

	$("html").keydown(async function(event) {
		if(!running)
			return;
		const char = String.fromCharCode(event.which);
		if(event.which >= 65 && event.which <= 90 && char.match(/[a-zA-Z]/))
			input(char.toUpperCase());
		else if(event.which == 8)
			backspace();
		else if(event.which == 13)
			await enter();
	});

	$("#share").click(async function() {
		navigator.clipboard.writeText($("#results").text());
		$(this).text("Copied!");
		await sleep(2000);
		$(this).text("Copy results");
	});

	$("#play").click(function() {
		numLetters = parseInt($("input[name=wordlength]").val());
		$("#startpopup").addClass("hidden");
		$(".overlay").addClass("hidden");

		fetch(`words/wordle${numLetters}`).then(async data => {
			const words_ = (await data.text()).split('\n');
			console.log(`got ${words_.length} words`);
			// word = words_[Math.floor(Math.random() * words_.length)].toUpperCase();
			word = words_[Math.floor((new Date()) / 8.64e7) % words_.length].toUpperCase();
		});
		
		fetch(`words/wordlist${numLetters}`).then(async data => {
			words = await data.text();
		});

		for(let i = 0; i < numWords; i++) {
			let tr = $("<tr></tr>").appendTo("#wordtable");
			for(let j = 0; j < numLetters; j++) {
				tr.append("<td class></td>");
			}
		}

		$(".key, #wordtable td").addClass("flippable blank shadow");

		running = true;
	});

	$(".overlay").click(function(e) {
		if(e.target == this && !$("#scorepopup").hasClass("hidden")) {
			$("#scorepopup, .overlay").addClass("hidden");
		}
	});
});