const testUrls = [
  { name: 'Ecuavisa Google DAI', url: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8' },
  { name: 'Teleamazonas', url: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8' },
  { name: 'Oromar TV', url: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8' },
  { name: 'TVC', url: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8' },
  { name: 'RTS', url: 'https://d2w3o8zn50cs1k.cloudfront.net/ts:abr.m3u8' },
  { name: 'La 1', url: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8' },
  { name: 'ESPN 1', url: 'http://200.115.120.1:8000/play/ca040/index.m3u8' },
  { name: 'ESPN 2', url: 'http://200.115.120.1:8000/play/ca041/index.m3u8' },
];

async function runTest() {
  for (const item of testUrls) {
    try {
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const isM3U8 = text.includes('#EXTM3U');
      console.log(`[${isM3U8 ? 'VALID M3U8' : 'FAIL (' + res.status + ')'}] ${item.name}: ${text.slice(0, 80).replace(/\n/g, ' ')}`);
    } catch (e) {
      console.log(`[ERR] ${item.name}: ${e.message}`);
    }
  }
}

runTest();
