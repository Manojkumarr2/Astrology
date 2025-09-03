// Example: Simulate fetching horoscope for a sign
async function getHoroscope(sign) {
  // Replace with a real API call if available!
  const horoscopes = {
    Aries: "Today you will feel energetic and confident.",
    Taurus: "A great day for financial decisions.",
    Gemini: "Communication brings opportunities.",
    Cancer: "Family brings support and joy.",
    Leo: "Your leadership will be appreciated.",
    Virgo: "Attention to detail pays off.",
    Libra: "Harmony in relationships.",
    Scorpio: "Transformative energies surround you.",
    Sagittarius: "Adventure awaits.",
    Capricorn: "Hard work brings results.",
    Aquarius: "Innovation is your strength.",
    Pisces: "Follow your intuition."
  };
  return horoscopes[sign] || "No horoscope found for this sign.";
}
module.exports = { getHoroscope };