
export const getFormattedDateTime = () => {
  const now = new Date();

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;

  return `${dayName}, ${date} ${month} ${year} at ${formattedHour}:${minutes} ${ampm}`;
};