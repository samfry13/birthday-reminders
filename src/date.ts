import { Contact } from './schemas';

export const isContactsBirthdayToday = (contact: Contact) => {
  const today = new Date();
  const birthday = new Date(contact.birthday);

  return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
};

export const isContactsBirthdayThisWeek = (contact: Contact) => {
  const today = new Date();
  const todayDate = today.getDate();
  const todayDay = today.getDay();

  const firstDayOfWeek = new Date(today.setDate(todayDate - todayDay));

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

  const birthday = new Date(contact.birthday);

  return birthday >= firstDayOfWeek && birthday <= lastDayOfWeek;
};

export const isContactsBirthdayThisMonth = (contact: Contact) => {
  const today = new Date();
  const birthday = new Date(contact.birthday);

  return birthday.getMonth() === today.getMonth();
};
