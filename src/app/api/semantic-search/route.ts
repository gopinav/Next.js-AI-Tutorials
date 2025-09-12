import { embed, embedMany, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // Embed all movie descriptions
    const { embeddings: movieEmbeddings } = await embedMany({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      values: movies.map((movie) => movie.description),
    });

    // Embed the search query
    const { embedding: queryEmbedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: query,
    });

    // Calculate similarity between query and each movie
    const moviesWithScores = movies.map((movie, index) => {
      const similarity = cosineSimilarity(
        queryEmbedding,
        movieEmbeddings[index]
      );

      return {
        ...movie,
        similarity,
      };
    });

    // Sort by similarity (highest first)
    moviesWithScores.sort((a, b) => b.similarity - a.similarity);

    // Filter results by similarity threshold
    const threshold = 0.5;
    const relevantResults = moviesWithScores.filter(
      (movie) => movie.similarity >= threshold
    );

    // Return top 3 results
    const topResults = relevantResults.slice(0, 3);

    return Response.json({
      query,
      results: topResults,
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}

const movies = [
  {
    id: 1,
    title: "The Matrix",
    description:
      "A science fiction action film exploring simulated reality and artificial worlds. A computer hacker discovers that reality as he knows it is actually a computer-generated simulation created by sentient machines, forcing him to question what is real versus artificial and choose between comfortable illusion and harsh truth.",
  },
  {
    id: 2,
    title: "Inception",
    description:
      "A science fiction thriller about dreams within dreams and the nature of reality. A skilled thief navigates multiple layers of shared dreaming where physics bends and time dilates, attempting to plant an idea deep in someone's subconscious while constantly questioning which level of reality is real.",
  },
  {
    id: 3,
    title: "The Notebook",
    description:
      "A romantic drama chronicling enduring love across decades and social classes. A young couple falls deeply in love during a magical summer in 1940s South Carolina, their romance surviving separation, war, and ultimately Alzheimer's disease as an elderly man reads their love story to rekindle his wife's fading memories.",
  },
  {
    id: 4,
    title: "Interstellar",
    description:
      "A science fiction epic about space exploration and humanity's survival among the stars. As Earth becomes uninhabitable, astronauts venture through a wormhole to find a new home for humanity, exploring concepts of time dilation, parallel dimensions, and how love transcends space and time.",
  },
  {
    id: 5,
    title: "The Godfather",
    description:
      "A crime drama masterpiece about family, power, and the American Dream's dark side. The youngest son of an Italian-American mafia family reluctantly transforms from war hero seeking legitimacy to ruthless crime boss, navigating loyalty, betrayal, and calculated violence in the criminal underworld.",
  },
  {
    id: 6,
    title: "Blade Runner",
    description:
      "A neo-noir science fiction film questioning humanity and consciousness in a dystopian future. In rain-soaked, neon-lit Los Angeles, a detective hunts bioengineered replicants while grappling with what defines humanity, consciousness, and the soul when artificial beings seem more human than humans.",
  },
  {
    id: 7,
    title: "When Harry Met Sally",
    description:
      "A romantic comedy exploring whether men and women can truly be just friends. Two university graduates repeatedly encounter each other over the years in New York City, debating relationships and friendship through witty banter, failed romances, and late-night conversations before discovering love was there all along.",
  },
  {
    id: 8,
    title: "The Terminator",
    description:
      "A science fiction action thriller about time travel and artificial intelligence gone rogue. A cyborg assassin from a post-apocalyptic future where machines have enslaved humanity travels back to 1984 to kill the mother of the future resistance leader, sparking a desperate race against time and technology.",
  },
];
