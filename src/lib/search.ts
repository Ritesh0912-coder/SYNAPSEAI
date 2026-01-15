
/**
 * Professional Web Search using SearchAPI.io
 * Provides clean JSON responses for DuckDuckGo results
 */

const SEARCHAPI_KEY = process.env.SEARCHAPI_KEY;
const SEARCHAPI_BASE = "https://www.searchapi.io/api/v1/search";

export async function performWebSearch(query: string): Promise<string> {
    try {
        console.log(`[WebSearch] Using SearchAPI.io | Query: ${query}`);

        if (!SEARCHAPI_KEY) {
            return "Search API key not configured. Please add SEARCHAPI_KEY to your .env file.";
        }

        const url = new URL(SEARCHAPI_BASE);
        url.searchParams.set('engine', 'duckduckgo');
        url.searchParams.set('q', query);
        url.searchParams.set('api_key', SEARCHAPI_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`SearchAPI returned status ${response.status}`);
        }

        const data = await response.json();

        // Build formatted response
        let resultText = "";

        // AI Overview (if available)
        if (data.ai_overview) {
            resultText += `### AI Overview\n${data.ai_overview.answer}\n\n`;
        }

        // Knowledge Graph (for entities like people, companies)
        if (data.knowledge_graph) {
            const kg = data.knowledge_graph;
            resultText += `### ${kg.title}\n`;
            if (kg.subtitle) resultText += `*${kg.subtitle}*\n\n`;
            if (kg.description) resultText += `${kg.description}\n\n`;

            if (kg.facts) {
                resultText += "**Key Facts:**\n";
                for (const [key, value] of Object.entries(kg.facts)) {
                    resultText += `- **${key}**: ${value}\n`;
                }
                resultText += "\n";
            }
        }

        // Top Stories (for news queries)
        if (data.top_stories && data.top_stories.length > 0) {
            resultText += "### Latest News\n";
            for (const story of data.top_stories.slice(0, 5)) {
                resultText += `- **[${story.title}](${story.link})** (${story.source}, ${new Date(story.date).toLocaleDateString()})\n`;
                if (story.snippet) resultText += `  ${story.snippet}\n`;
            }
            resultText += "\n";
        }

        // Organic Results
        if (data.organic_results && data.organic_results.length > 0) {
            if (!resultText) resultText += "### Search Results\n";
            for (const result of data.organic_results.slice(0, 5)) {
                resultText += `**[${result.title}](${result.link})**\n`;
                resultText += `${result.snippet}\n\n`;
            }
        }

        if (!resultText) {
            return "No results found for this query.";
        }

        return resultText.trim();

    } catch (error) {
        console.error("SearchAPI Error:", error);
        return `Search error: ${(error as Error).message}`;
    }
}
