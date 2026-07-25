const CHANNELS = [
  { id: 'ec1',  name: 'Ecuavisa', streamUrl: 'https://dai.google.com/linear/hls/event/GyPkTVDZSXGhpOvxPK7m2g/master.m3u8' },
  { id: 'ec2',  name: 'Teleamazonas', streamUrl: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8' },
  { id: 'ec3',  name: 'Oromar TV', streamUrl: 'https://stream.oromar.tv/hls/oromartv_hi/index.m3u8' },
  { id: 'ec4',  name: 'TVC', streamUrl: 'https://library-getafix.fireclip.tv/56e2d24bfdcf13ab4a321867/live/live_1.m3u8' },
  { id: 'ec5',  name: 'Gamavisión', streamUrl: 'http://45.224.97.181:9999/Gamavision/index.m3u8' },
  { id: 'ec6',  name: 'TC Televisión', streamUrl: 'http://179.60.51.134:8888/TC/index.m3u8' },
  { id: 'ec7',  name: 'RTS', streamUrl: 'https://d2w3o8zn50cs1k.cloudfront.net/ts:abr.m3u8' },
  { id: 'es1',  name: 'La 1', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8' },
  { id: 'es2',  name: 'La 2', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main_dvr.m3u8' },
  { id: 'es3',  name: 'Canal 24H', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main_dvr.m3u8' },
  { id: 'es5',  name: 'Teledeporte', streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8' },
  { id: 'es6',  name: 'Real Madrid TV', streamUrl: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8' },
  { id: 'rd1',  name: 'ESPN', streamUrl: 'http://200.115.120.1:8000/play/ca040/index.m3u8' },
  { id: 'rd2',  name: 'ESPN 2', streamUrl: 'http://200.115.120.1:8000/play/ca041/index.m3u8' },
  { id: 'rd3',  name: 'ESPN 3', streamUrl: 'http://200.115.120.1:8000/play/ca042/index.m3u8' },
  { id: 'ki1',  name: 'Canela Kids', streamUrl: 'https://amg00658-amg00658c47-canelatv-international-7222.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-canelakids-canelatvinternational/playlist.m3u8' },
  { id: 'f01',  name: 'Disney Channel', streamUrl: 'http://45.185.163.75:8000/play/a02j/index.m3u8' },
  { id: 'nv1',  name: 'Novelas Turcas', streamUrl: 'https://amg00658-amg00658c102-canelatv-international-7231.playouts.now.amagi.tv/playlist/amg00658-canelamediafast-novelasturcas-canelatvinternational/playlist.m3u8' },
  { id: 'dp1',  name: 'Fox Sports', streamUrl: 'https://jmp2.uk/plu-5a74b8e1e22a61737979c6bf.m3u8' },
  { id: 'dp6',  name: 'Red Bull TV', streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8' },
  { id: 'in4',  name: 'El Trece', streamUrl: 'https://livetrx01.vodgc.net/eltrecetv/index.m3u8' },
  { id: 'in5',  name: 'Azteca Internacional', streamUrl: 'https://azt-mun.otteravision.com/azt/mun/mun.m3u8' }
];

async function checkStreams() {
  for (const ch of CHANNELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(ch.streamUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      console.log(`[${res.ok ? 'OK' : 'FAIL ' + res.status}] ${ch.name}: ${ch.streamUrl}`);
    } catch (err) {
      console.log(`[ERR] ${ch.name}: ${err.message}`);
    }
  }
}

checkStreams();
