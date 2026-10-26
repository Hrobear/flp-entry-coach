export default {
 async fetch(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGIN || '';
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if (origin === allowed && allowed) headers['Access-Control-Allow-Origin']=origin;
  if (request.method==='OPTIONS') return new Response(null,{status:origin===allowed?204:403,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'POST, OPTIONS'}});
  if (request.method!=='POST') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
  if (!allowed || origin!==allowed) return new Response(JSON.stringify({error:'Forbidden origin'}),{status:403,headers});
  if (!env.GEMINI_API_KEY || !env.ACCESS_TOKEN) return new Response(JSON.stringify({error:'Server configuration incomplete'}),{status:503,headers});
  if (request.headers.get('Authorization') !== 'Bearer '+env.ACCESS_TOKEN) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
  if (Number(request.headers.get('Content-Length')||0)>35000) return new Response(JSON.stringify({error:'Request too large'}),{status:413,headers});
  let body;
  try {body=await request.json()}catch{return new Response(JSON.stringify({error:'Invalid JSON'}),{status:400,headers})}
  if (typeof body.prompt!=='string'||!body.prompt.trim()||body.prompt.length>16000) return new Response(JSON.stringify({error:'Invalid prompt'}),{status:400,headers});
  const model=env.GEMINI_MODEL||'gemini-2.5-flash';
  try {
   const resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({systemInstruction:{parts:[{text:'日本語で大学生のエントリーシート作成を支援する。経験や成績を捏造せず本人の主体性を尊重し、追加質問・良い点・改善点・文章案を具体的に示す。'}]},contents:[{role:'user',parts:[{text:body.prompt}]}],generationConfig:{temperature:0.5,maxOutputTokens:1800}})
   });
   const data=await resp.json();
   if(!resp.ok) return new Response(JSON.stringify({error:'Gemini API error ('+resp.status+')'}),{status:502,headers});
   const answer=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('\n');
   return new Response(JSON.stringify({text:answer||'応答がありませんでした。'}),{headers});
  }catch{return new Response(JSON.stringify({error:'AI service unavailable'}),{status:502,headers})}
 }
};