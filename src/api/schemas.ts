import { z } from 'zod';

export const publicSettingsSchema = z
  .object({
    whatsappNumber: z.string().regex(/^\+?\d{10,13}$/, 'número de WhatsApp em formato inesperado'),
  })
  .loose();

export const errorBodySchema = z
  .object({
    message: z.string().optional(),
    error: z.string().optional(),
    code: z.string().optional(),
  })
  .loose();

/** O front aceita créditos em vários campos (ver resolveProfileCredits no main.js do site). */
export const profileSchema = z
  .object({
    creditos: z.number().nonnegative().optional(),
    credits: z.number().nonnegative().optional(),
    consultasDisponiveis: z.number().nonnegative().optional(),
    usuario: z
      .object({
        email: z.email().optional(),
        creditos: z.number().nonnegative().optional(),
        credits: z.number().nonnegative().optional(),
      })
      .loose()
      .optional(),
  })
  .loose();

export function creditsFrom(profile: z.infer<typeof profileSchema>): number | undefined {
  return (
    profile.creditos ??
    profile.credits ??
    profile.consultasDisponiveis ??
    profile.usuario?.creditos ??
    profile.usuario?.credits
  );
}
