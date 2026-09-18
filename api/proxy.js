const ALLOWED=new Set(['query1.finance.yahoo.com','query2.finance.yahoo.com','news.google.com','www.nseindia.com','nsearchives.nseindia.com']);
module.exports=async function(req,res){
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 const raw=Array.isArray(req.query.url)?req.query.url[0]:req.query.url;
 let u;try{u=new URL(raw)}catch{return res.status(400).json({error:'Invalid URL'})}
 if(u.protocol!=='https:'||!ALLOWED.has(u.hostname))return res.status(403).json({error:'Host not allowed'});
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),20000);
 try{
  const r=await fetch(u,{signal:ctl.signal,redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; NSE-Research-Portal/1.0)','Accept':'application/json, application/xml, text/xml, text/plain, */*','Accept-Language':'en-IN,en;q=0.9'}});
  const b=Buffer.from(await r.arrayBuffer());
  res.setHeader('Content-Type',r.headers.get('content-type')||'application/octet-stream');
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  return res.status(r.status).send(b);
 }catch(e){return res.status(e&&e.name==='AbortError'?504:502).json({error:e&&e.name==='AbortError'?'Upstream timeout':'Upstream request failed'});}finally{clearTimeout(timer)}
};
