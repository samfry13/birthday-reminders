import { Contact } from './schemas';

export const sendDiscordWebhook = async ({
  webhook_url,
  avatar_url,
  title,
  contacts,
}: {
  webhook_url: string;
  avatar_url: string;
  title: string;
  contacts: Contact[];
}) =>
  fetch(webhook_url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: 'Birthday Bot',
      avatar_url,
      embeds: [
        {
          title,
          color: 5814783,
          fields: contacts.map(contact => {
            const birthday = new Date(contact.birthday);
            return {
              name: contact.name,
              value: birthday.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              }),
              inline: true,
            };
          }),
        },
      ],
    }),
  });
