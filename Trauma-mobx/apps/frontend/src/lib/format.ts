export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(new Date(value));

export const personName = (person: {
  first_name: string;
  last_name: string;
  patronymic: string | null;
}) => [person.last_name, person.first_name, person.patronymic].filter(Boolean).join(" ");

export const inputDate = (value: string) => value.slice(0, 10);

export const combineDateTime = (date: string, time: string) => {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}`).toISOString();
};
