/* A viagem começa à meia-noite de 14/11/2026, no horário de Brasília. */
const TRIP_DATE = '2026-11-14T00:00:00-03:00';
const TRIP_TIMESTAMP = Date.parse(TRIP_DATE);
function getCountdown(now = Date.now()) {
  const total = Math.max(0, Math.floor((TRIP_TIMESTAMP - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    arrived: now >= TRIP_TIMESTAMP,
    travelDay: now >= TRIP_TIMESTAMP && now < TRIP_TIMESTAMP + 86400000
  };
}
