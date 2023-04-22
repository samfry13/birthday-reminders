import {
  isContactsBirthdayThisMonth,
  isContactsBirthdayThisWeek,
  isContactsBirthdayToday,
} from './date';
import { sendDiscordWebhook } from './discord';
import {
  BirthdayRequestSchema,
  BirthdayRequestType,
  ContactSchema,
  MethodSchema,
  MethodType,
} from './schemas';
import { z } from 'zod';

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

    const contactsResponse = await fetch(`${env.STORAGE_URL}/birthdays.json`, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });

    if (!contactsResponse.ok) {
      return new Response(null, { status: 500 });
    }

    const contacts = await contactsResponse.json();
    const contactsParseResult = z.array(ContactSchema).safeParse(contacts);
    if (!contactsParseResult.success) {
      return new Response(
        JSON.stringify({
          error_message: `Error parsing birthdays`,
          error: JSON.parse(contactsParseResult.error.message),
        }),
        {
          status: 500,
          headers: {
            'content-type': 'application/json;charset=UTF-8',
          },
        }
      );
    }

    if (methodParseResult.data === MethodType.POST) {
      const bodyParseResult = BirthdayRequestSchema.safeParse(await request.json());
      if (!bodyParseResult.success) {
        return new Response(null, { status: 400 });
      }

      if (bodyParseResult.data.type === BirthdayRequestType.Daily) {
        const contactsWithBirthdaysToday = contactsParseResult.data.filter(isContactsBirthdayToday);

        if (contactsWithBirthdaysToday.length > 0) {
          const webhookResponse = await sendDiscordWebhook({
            webhook_url: env.WEBHOOK_URL,
            avatar_url: `${env.STORAGE_URL}/avatar.png`,
            title: 'Birthdays Today',
            contacts: contactsWithBirthdaysToday,
          });

          if (!webhookResponse.ok) {
            return new Response(null, { status: 500 });
          }
        }
      } else if (bodyParseResult.data.type === BirthdayRequestType.Weekly) {
        const contactsWithBirthdaysThisWeek = contactsParseResult.data.filter(
          isContactsBirthdayThisWeek
        );

        if (contactsWithBirthdaysThisWeek.length > 0) {
          const webhookResponse = await sendDiscordWebhook({
            webhook_url: env.WEBHOOK_URL,
            avatar_url: `${env.STORAGE_URL}/avatar.png`,
            title: 'Birthdays this Week',
            contacts: contactsWithBirthdaysThisWeek,
          });

          if (!webhookResponse.ok) {
            return new Response(null, { status: 500 });
          }
        }
      } else if (bodyParseResult.data.type === BirthdayRequestType.Monthly) {
        const contactsWithBirthdaysThisMonth = contactsParseResult.data.filter(
          isContactsBirthdayThisMonth
        );

        if (contactsWithBirthdaysThisMonth.length > 0) {
          const webhookResponse = await sendDiscordWebhook({
            webhook_url: env.WEBHOOK_URL,
            avatar_url: `${env.STORAGE_URL}/avatar.png`,
            title: 'Birthdays this Month',
            contacts: contactsWithBirthdaysThisMonth,
          });

          if (!webhookResponse.ok) {
            return new Response(null, { status: 500 });
          }
        }
      }

      return new Response(null, { status: 200 });
    }

    return new Response(JSON.stringify(contacts, null, 2), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
};
