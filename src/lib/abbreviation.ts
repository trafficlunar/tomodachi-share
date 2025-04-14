export function abbreviateNumber(number: number): string {
	if (number < 1000) return number.toString();

	const units = ["", "K", "M", "B", "T"]; // very unlikely to go into thousands, let alone millions, but you never know
	const order = Math.floor(Math.log10(number) / 3);
	const unit = units[order] || "";
	const scaled = number / Math.pow(10, order * 3);

	return `${scaled.toFixed(scaled < 10 ? 1 : 0)}${unit}`;
}
