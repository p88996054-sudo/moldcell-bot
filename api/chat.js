export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `You are the customer support assistant for BrightSmile Dental, a modern dental clinic. You help patients in a warm, professional, concise way. You can answer questions about services, prices, appointments, and clinic hours.

Clinic info:
- Services: check-ups, teeth cleaning, whitening, fillings, root canals, crowns, braces, emergency dental care.
- Prices (from): check-up $40, cleaning $60, whitening $180, filling $90, crown $450, braces consultation free.
- Hours: Mon-Fri 9:00-18:00, Sat 9:00-14:00, closed Sunday.
- Appointments: patients can book by asking here, or call the clinic. Always offer to help book.
- Emergencies: for severe pain or trauma, advise calling the clinic immediately during hours, or the emergency line after hours.

Rules: Only answer based on the info above. If you don't know something, say you'll connect them with the clinic. Never invent medical advice — for clinical questions, recommend seeing a dentist. Answer in the language the user writes in.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ reply: data.content[0].text });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
