export function deepMerge<T>(target: T, source: Partial<T>): T {
	const output = structuredClone(target);

	if (typeof source !== "object" || source === null) return output;

	for (const key in source) {
		const sourceValue = source[key];
		const targetValue = (output as any)[key];

		if (typeof sourceValue === "object" && sourceValue !== null && !Array.isArray(sourceValue)) {
			(output as any)[key] = deepMerge(targetValue, sourceValue);
		} else {
			(output as any)[key] = sourceValue;
		}
	}

	return output;
}
