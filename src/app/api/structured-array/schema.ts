import { z } from "zod";

export const pokemonSchema = z.object({
  name: z.string(),
  abilities: z.array(z.string()),
});

export const pokemonUISchema = z.array(pokemonSchema);
