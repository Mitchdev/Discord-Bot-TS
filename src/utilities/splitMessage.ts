export default function splitMessage(text: string): string[] {
	if (text.length <= 2000) return [text];
	const parts = [];
	let curPart = '';
	let chunkStartIndex = 0;
	let prevDelim = '';
	function addChunk(chunkEndIndex: number, nextDelim: string) {
		const nextChunk = text.substring(chunkStartIndex, chunkEndIndex);
		const lengthWithChunk = (curPart.length + prevDelim.length + nextChunk.length);
		if (lengthWithChunk > 2000) {
			parts.push(curPart);
			curPart = nextChunk;
		} else curPart += prevDelim + nextChunk;
		prevDelim = nextDelim;
		chunkStartIndex = chunkEndIndex + prevDelim.length;
	}
	for (const match of text.matchAll(/\n/g)) addChunk(match.index, match[0]);
	addChunk(text.length - 1, '');
	parts.push(curPart);
	console.log(encodeURIComponent(text));
	console.log(parts.map((t) => encodeURIComponent(t)));
	return parts;
}
