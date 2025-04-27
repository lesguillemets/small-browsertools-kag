export function init() {
	const w = {};
	document.getElementById("input")?.addEventListener("keyup", (e) => {
		console.log("Got change: ", e);
		checktext(w);
	});
}

function checktext(w: Record<string, CharInfo>) {
	const inputElement = document.getElementById("input") as HTMLTextAreaElement;
	const inp: Array<string> = Array.from(inputElement.value);
	// take first n characters
	const trunc = document.getElementById("trunc") as HTMLInputElement;
	const take_n: number = Math.min(inp.length, Number.parseInt(trunc.value));
	clearResult();
	const resultElement = document.getElementById("result");
	const the_result_tree = document.createElement("ul");
	for (let i = 0; i < take_n; i++) {
		const c = inp[i];
		const item = document.createElement("li");
		reportChar(w, item, c);
		the_result_tree.appendChild(item);
	}
	resultElement?.appendChild(the_result_tree);
}

function clearResult() {
	document.getElementById("result")!.innerHTML = "";
}

async function reportChar(
	w: Record<string, CharInfo>,
	li: HTMLLIElement,
	c: string,
): Promise<HTMLLIElement> {
	let reportText = `<pre class="single-char">${c}</pre>`;
	const codePointStr: string = c
		.codePointAt(0)
		?.toString(16)
		.toUpperCase()
		.padStart(4, "0")!;
	console.log(`codepoint: ${codePointStr}`);
	reportText += ` : <code>U+${codePointStr}</code> `;
	// 最後の2文字を除いた残りでファイルに分けてる
	if (w[codePointStr] === undefined) {
		const searchHeader = codePointStr.slice(0, codePointStr.length - 2);
		await loadDataFor(w, searchHeader);
	}
	reportText += w[codePointStr].charName;
	li.innerHTML = reportText;
	return li;
}

async function loadDataFor(
	w: Record<string, CharInfo>,
	searchHeader: string,
): Promise<void> {
	// このファイル読むの初めてなので読み出す
	const response = await fetch(
		`/static/unicode-org/Public/UCD/latest/ucd/UnicodeData/${searchHeader}.txt`,
	);
	if (!response.ok) {
		console.log(`ERROR response in looking for ${searchHeader}: ${response}`);
	} else {
		const t = await response.text();
		const characters: Array<CharInfo> = [];
		for (const line of t.split(/\r?\n/)) {
			if (line.length > 0) {
				const ci = CharInfo.fromLine(line);
				w[ci.codepoint] = ci;
			}
		}
	}
}

class CharInfo {
	c: string;
	codepoint: string;
	charName: string;
	generalCategory: string;
	canonicalCombiningClass: string;
	bidiClass: string;
	decompTypeMap: string;
	numericTypeValue0: string;
	numericTypeValue1: string;
	numericTypeValue2: string;
	bidiMirrored: string;
	unicodeOneName: string;
	isoComment: string;
	simpleUppercaseMapping: string;
	simpleLowerCaseMapping: string;
	simpleTitlecaseMapping: string;

	constructor(
		c: string,
		codepoint: string,
		name: string,
		generalCategory: string,
		canonicalCombiningClass: string,
		bidiClass: string,
		decompTypeMap: string,
		numericTypeValue0: string,
		numericTypeValue1: string,
		numericTypeValue2: string,
		bidiMirrored: string,
		unicodeOneName: string,
		isoComment: string,
		simpleUppercaseMapping: string,
		simpleLowerCaseMapping: string,
		simpleTitlecaseMapping: string,
	) {
		this.c = c;
		this.codepoint = codepoint.toUpperCase();
		this.charName = name;
		this.generalCategory = generalCategory;
		this.canonicalCombiningClass = canonicalCombiningClass;
		this.bidiClass = bidiClass;
		this.decompTypeMap = decompTypeMap;
		this.numericTypeValue0 = numericTypeValue0;
		this.numericTypeValue1 = numericTypeValue1;
		this.numericTypeValue2 = numericTypeValue2;
		this.bidiMirrored = bidiMirrored;
		this.unicodeOneName = unicodeOneName;
		this.isoComment = isoComment;
		this.simpleUppercaseMapping = simpleUppercaseMapping;
		this.simpleLowerCaseMapping = simpleLowerCaseMapping;
		this.simpleTitlecaseMapping = simpleTitlecaseMapping;
	}

	static fromLine(s: string): CharInfo {
		const fields = s.split(";");
		const c = String.fromCodePoint(Number.parseInt(fields[0], 16));
		// should be better written using spread syntax
		return new CharInfo(
			c,
			fields[0],
			fields[1],
			fields[2],
			fields[3],
			fields[4],
			fields[5],
			fields[6],
			fields[7],
			fields[8],
			fields[9],
			fields[10],
			fields[11],
			fields[12],
			fields[13],
			fields[14],
		);
	}
}

window.addEventListener("load", init);
