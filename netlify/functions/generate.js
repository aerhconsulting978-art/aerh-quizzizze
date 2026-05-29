/* Build 20260529_020412 */
exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};

  // GET = test de vie de la fonction
  if (event.httpMethod === 'GET') {
    return {statusCode:200, headers, body: JSON.stringify({status:'alive', build:'20260529_020412'})};
  }
  if (event.httpMethod === 'OPTIONS') return {statusCode:200, headers, body:'{}'};
  if (event.httpMethod !== 'POST') return {statusCode:405, headers, body:JSON.stringify({error:'Method not allowed'})};

  try {
    const body = JSON.parse(event.body || '{}');
    const theme = body.theme;
    const apiKey = body.apiKey;

    if (!theme || !apiKey) {
      return {statusCode:400, headers, body:JSON.stringify({error:'theme et apiKey requis'})};
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: `Tu es un expert en formation professionnelle pour adultes en Polynésie française.
RÈGLES: 1)Juridique/RH/Social: CTPF, Lois du Pays, CPS, DICP, FPG - chiffres EXACTS. 2)Bureautique/Informatique(Excel,Word,PPT): fonctionnalités, raccourcis - pas de contexte PF. 3)Technique/Métier: bonnes pratiques, normes. 4)Général: méthodes pro.
JSON UNIQUEMENT sans markdown. Format: {"questions":[{"question":"...?","answers":["A","B","C","D"],"correct":0,"time":30,"source":"ref"}]}`,
        messages: [{role:'user', content:`Génère exactement 8 questions sur : "${theme}". Formation professionnelle adultes Polynésie française.`}]
      })
    });

    const data = await resp.json();
    if (data.error) return {statusCode:400, headers, body:JSON.stringify({error: data.error.message})};

    const txt = (data.content||[]).find(b=>b.type==='text')?.text || '';
    const parsed = JSON.parse(txt.replace(/```json|```/g,'').trim());

    return {statusCode:200, headers, body:JSON.stringify({questions: parsed.questions})};

  } catch(e) {
    return {statusCode:500, headers, body:JSON.stringify({error: e.message})};
  }
};
