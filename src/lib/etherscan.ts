export async function fetchContractSource(address: string, chainId: number = 1) {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    // Fallback to a free key or handle error if missing
    if (!apiKey) console.warn("Missing ETHERSCAN_API_KEY");

    // V2 API requires chainid parameter
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1") {
        throw new Error(`Etherscan API error: ${data.message || data.result}`);
    }

    if (!data.result[0]?.SourceCode) {
        throw new Error(`Contract not verified on Etherscan: ${address}`);
    }

    let source = data.result[0].SourceCode;
    // Handle verified contracts wrapped in {{ }}
    if (source.startsWith('{{')) {
        source = source.slice(1, -1);
    }

    return source;
}