import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    category: z.enum(['École 42', 'Personnel', 'Professionnel']),
    featured: z.boolean().default(false),
    monitoringEnabled: z.boolean().default(false),
    monitoringFallback: z.string().optional(),
    featuredOrder: z.number().optional(),
    featuredTitle: z.string().optional(),
    featuredSummary: z.string().optional(),
    featuredTags: z.array(z.string()).optional(),
    objective: z.string().optional(),
    contribution: z.string().optional(),
    learnings: z.string().optional(),
    title: z.string(),
    summary: z.string(),
    status: z.enum(['terminé', 'en cours', 'prévu']),
    tags: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { projects };
