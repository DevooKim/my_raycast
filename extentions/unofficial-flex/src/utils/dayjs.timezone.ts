import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with timezone capabilities
dayjs.extend(utc);
dayjs.extend(timezone);

// Create a dayjs instance with Asia/Seoul as default timezone
const seoulDayjs = dayjs.tz.bind(dayjs.tz.setDefault("Asia/Seoul"));
const utcDayjs = dayjs.utc.bind(dayjs.utc());

export { seoulDayjs, utcDayjs };
