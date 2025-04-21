export function status(update: string, currentStatus: string): string {
    // Combine new update with the current status content
    return `${update}\n${currentStatus}`;
}

export function random(botNameList: string): string {
    // Shuffle the list of names (split by newlines)
    const botNames = botNameList.split("\n");
    const shuffledNames = shuffle(botNames);
    return shuffledNames.join("\n");
}

export async function inputNames(): Promise<string> {
    // Fetch names.txt and return its contents
    const response = await fetch("./names.txt");
    return await response.text();
}

export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, temporaryValue: T, randomIndex: number;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export function simpleBotName(prefix: string, suffix: string): string {
    return `${prefix}${suffix}`;
}
