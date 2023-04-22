import { Env } from '.';
import {
  isContactsBirthdayThisMonth,
  isContactsBirthdayThisWeek,
  isContactsBirthdayToday,
} from './date';
import { sendDiscordWebhook } from './discord';
import { BirthdayRequestType, ContactSchema } from './schemas';
import { z } from 'zod';

export const handlePostBirthdayResponse = async ({
  type,
  env,
}: {
  type: BirthdayRequestType;
  env: Env;
}) => {
  const contactsResponse = await fetch(`${env.STORAGE_URL}/birthdays.json`, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });

  if (!contactsResponse.ok) {
    throw new Error('Failed to fetch contacts list');
  }

  const contacts = await contactsResponse.json();
  const contactsParseResult = z.array(ContactSchema).safeParse(contacts);
  if (!contactsParseResult.success) {
    throw new Error(
      `Error parsing contacts: ${JSON.stringify(JSON.parse(contactsParseResult.error.message))}`
    );
  }

  if (type === BirthdayRequestType.Daily) {
    const contactsWithBirthdaysToday = contactsParseResult.data.filter(isContactsBirthdayToday);

    if (contactsWithBirthdaysToday.length > 0) {
      const webhookResponse = await sendDiscordWebhook({
        webhook_url: env.WEBHOOK_URL,
        avatar_url: `${env.STORAGE_URL}/avatar.png`,
        title: 'Birthdays Today',
        contacts: contactsWithBirthdaysToday,
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to POST Discord webhook');
      }
    }
  } else if (type === BirthdayRequestType.Weekly) {
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
        throw new Error('Failed to POST Discord webhook');
      }
    }
  } else if (type === BirthdayRequestType.Monthly) {
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
        throw new Error('Failed to POST Discord webhook');
      }
    }
  }
};

export const handleGetBirthdaysResponse = async ({ env }: { env: Env }) => {
  const contactsResponse = await fetch(`${env.STORAGE_URL}/birthdays.json`, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });

  if (!contactsResponse.ok) {
    throw new Error('Failed to fetch contacts list');
  }

  const contacts = await contactsResponse.json();
  const contactsParseResult = z.array(ContactSchema).safeParse(contacts);
  if (!contactsParseResult.success) {
    throw new Error(
      `Error parsing contacts: ${JSON.stringify(JSON.parse(contactsParseResult.error.message))}`
    );
  }

  return contactsParseResult.data;
};
