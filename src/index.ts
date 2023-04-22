import { handleGetBirthdaysResponse, handlePostBirthdayResponse } from './birthdays';
import {
  BirthdayRequestSchema,
  BirthdayRequestType,
  CronType,
  CronTypeSchema,
  MethodSchema,
  MethodType,
} from './schemas';

const CronToRequestType = {
  [CronType.Daily]: BirthdayRequestType.Daily,
  [CronType.Weekly]: BirthdayRequestType.Weekly,
  [CronType.Monthly]: BirthdayRequestType.Monthly,
} satisfies Record<CronType, BirthdayRequestType>;

export interface Env {
  STORAGE_URL: string;
  WEBHOOK_URL: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const methodParseResult = MethodSchema.safeParse(request.method);
    if (!methodParseResult.success) {
      return new Response(null, { status: 405 });
    }

    if (methodParseResult.data === MethodType.POST) {
      const bodyParseResult = BirthdayRequestSchema.safeParse(await request.json());
      if (!bodyParseResult.success) {
        return new Response(null, { status: 400 });
      }

      try {
        await handlePostBirthdayResponse({
          type: bodyParseResult.data.type,
          env,
        });
        return new Response(null, { status: 200 });
      } catch (e: any) {
        console.error(e);
        return new Response(null, { status: 500 });
      }
    }

    try {
      const contacts = await handleGetBirthdaysResponse({ env });
      return new Response(JSON.stringify(contacts, null, 2), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    } catch (e: any) {
      console.error(e);
      return new Response(null, { status: 500 });
    }
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const cronParseResult = CronTypeSchema.safeParse(event.cron);
    if (!cronParseResult.success) {
      throw new Error('Invalid cron type');
    }

    await handlePostBirthdayResponse({ type: CronToRequestType[cronParseResult.data], env });
  },
};
