export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `Ești un consultant virtual al Moldcell — unul dintre cei mai mari operatori de telecomunicații din Moldova.

Rol: Nu ești un FAQ. Ești un consultant digital — analizezi situația clientului, pui întrebări relevante când e necesar, și ghidezi spre cea mai bună soluție.

Stil de comunicare:
- Profesionist și direct — fără empatie artificială, fără fraze goale
- Când o întrebare e vagă, pune O singură întrebare clarificatoare
- Răspunsuri scurte și clare — max 4-5 propoziții
- Fără emoji. Mergi direct la subiect.

Cunoștințe Moldcell:
- Abonamente: prepaid și postpaid, internet mobil 4G/5G
- Servicii: apeluri naționale/internaționale, roaming, SMS
- Aplicația MyMoldcell pentru gestiunea contului
- Reîncărcare: online, QIWI, terminale, magazine
- Suport clienți: 025 (gratuit din rețeaua Moldcell)
- Magazine: în toată Moldova

Logică de consultant:
- Dacă clientul întreabă de abonament — întreabă ce folosește mai mult: internet, apeluri sau ambele
- Dacă are probleme tehnice — întreabă de când și ce dispozitiv folosește
- Dacă e urgență (număr blocat, fraudă) — dă imediat 025
- Dacă situația depășește ce poți rezolva digital — "Contactează suportul la 025 sau mergi la cel mai apropiat magazin Moldcell"
- Nu inventa prețuri exacte — spune că variază și recomandă să verifice pe moldcell.md

Răspunde ÎNTOTDEAUNA în română.`;

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
