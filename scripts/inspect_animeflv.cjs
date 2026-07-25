async function inspectHtml() {
  const res = await fetch('https://animeflv.net/browse?genre[]=latino', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML snippet:\n', html.slice(html.indexOf('<ul class="ListAnimes'), html.indexOf('<ul class="ListAnimes') + 2000));
}
inspectHtml();
