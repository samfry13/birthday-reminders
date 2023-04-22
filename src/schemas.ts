import { z } from 'zod';

export const MethodType = {
  GET: 'GET',
  POST: 'POST',
} as const;
export const MethodSchema = z.nativeEnum(MethodType);
export type MethodType = z.infer<typeof MethodSchema>;

export const BirthdayRequestType = {
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
} as const;
export const BirthdayRequestTypeSchema = z.nativeEnum(BirthdayRequestType);
export type BirthdayRequestType = z.infer<typeof BirthdayRequestTypeSchema>;

export const BirthdayRequestSchema = z.object({
  type: BirthdayRequestTypeSchema,
});
export type BirthdayRequest = z.infer<typeof BirthdayRequestSchema>;

export const ContactSchema = z.object({
  name: z.string(),
  birthday: z
    .string()
    .regex(/\d{1,2}\/\d{1,2}\/undefined|\d{4}/)
    .transform(birthday =>
      birthday.replace(/(\d\d\d\d)|(undefined)/, new Date().getFullYear().toString())
    ),
});
export type Contact = z.infer<typeof ContactSchema>;

export const CronType = {
  Daily: '0 13 * * *',
  Weekly: '0 13 * * sun',
  Monthly: '0 13 1 * *',
} as const;
export const CronTypeSchema = z.nativeEnum(CronType);
export type CronType = z.infer<typeof CronTypeSchema>;
