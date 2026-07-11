// src/services/vodService.js
// Servicio VOD con catálogo integrado + reproductor embed.su
// No requiere API key, no requiere scraping, no requiere proxy CORS

const EMBED_BASE = 'https://embed.su/embed/movie';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

// ═══════════════════════════════════════════════════════════
// Catálogo de películas populares con IDs de TMDB
// ═══════════════════════════════════════════════════════════
const movieCatalog = [
  // ── Estrenos 2025-2026 ──
  { id: 1197306, title: 'Un Viaje de Diez Metros', year: '2025', genre: 'Comedia', rating: '7.3', poster: '/pxJbfnMIQQxCrdeLD0zQnWr6ouL.jpg', desc: 'Hassan Kadam y su familia emigran de la India a un pueblo del sur de Francia donde abren un restaurante.' },
  { id: 939243, title: 'Sonic 3: La Película', year: '2024', genre: 'Acción', rating: '7.8', poster: '/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg', desc: 'Sonic, Knuckles y Tails se reúnen para enfrentarse a un nuevo y poderoso adversario, Shadow.' },
  { id: 1105407, title: 'Kraven El Cazador', year: '2024', genre: 'Acción', rating: '5.9', poster: '/i47IUSsN126K11JUzqQIOi1Mg1M.jpg', desc: 'La brutal historia de cómo Sergei Kravinoff se convirtió en uno de los villanos más temidos de Marvel.' },
  { id: 762509, title: 'Mufasa: El Rey León', year: '2024', genre: 'Animación', rating: '7.3', poster: '/lurEK87kukYNQuFBNwH7YCTJ98f.jpg', desc: 'Rafiki narra la leyenda de Mufasa a la joven cachorra de león Kiara.' },
  { id: 1084199, title: 'Nosferatu', year: '2024', genre: 'Terror', rating: '7.1', poster: '/5qGIxdEO841C0TlCaGJNPHkzOek.jpg', desc: 'Una joven obsesionada por un antiguo vampiro de Transilvania que la persigue a través del continente.' },
  { id: 539972, title: 'Kraven the Hunter', year: '2024', genre: 'Acción', rating: '6.1', poster: '/i47IUSsN126K11JUzqQIOi1Mg1M.jpg', desc: 'Historia de origen del cazador más letal del universo Marvel.' },
  { id: 912649, title: 'Venom: El Último Baile', year: '2024', genre: 'Acción', rating: '6.3', poster: '/k42Owka8v91Yw8J3MUPXIuYOmyA.jpg', desc: 'Eddie Brock y Venom están en fuga. Perseguidos por ambos mundos, la pareja se ve obligada a tomar una decisión devastadora.' },
  { id: 698687, title: 'Transformers One', year: '2024', genre: 'Animación', rating: '7.8', poster: '/qbkAqmmEIZfrCO8ZQAuIuVMlWoV.jpg', desc: 'La historia nunca antes contada de Optimus Prime y Megatron, mejor conocidos como hermanos de armas.' },
  { id: 1034541, title: 'Terrifier 3', year: '2024', genre: 'Terror', rating: '6.9', poster: '/63xYQj1BwRFielxsBDXvHIJyXVm.jpg', desc: 'Art el Payaso desata el caos entre los desprevenidos habitantes del Condado de Miles durante la Navidad.' },
  { id: 945961, title: 'Alien: Romulus', year: '2024', genre: 'Terror', rating: '7.2', poster: '/b33nnKl1GSFbao4l3fZDDqsMkhF.jpg', desc: 'Un grupo de jóvenes colonizadores se encuentran cara a cara con la forma de vida más aterradora del universo.' },
  { id: 533535, title: 'Deadpool & Wolverine', year: '2024', genre: 'Acción', rating: '7.7', poster: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', desc: 'Deadpool recibe una oferta de la TVA para unirse al MCU, pero en su lugar recluta a Wolverine para salvar su universo.' },
  { id: 1022789, title: 'Intensa-Mente 2', year: '2024', genre: 'Animación', rating: '7.6', poster: '/oxxqiyWrnM0XPnBtVe9TgYWnPxT.jpg', desc: 'Riley entra en la adolescencia y nuevas emociones aparecen en su cuartel general: Ansiedad, Envidia, Ennui y Vergüenza.' },
  { id: 823464, title: 'Godzilla x Kong: El Nuevo Imperio', year: '2024', genre: 'Acción', rating: '6.4', poster: '/z1p34vh7dEOnLDV8hAOrtGkMclR.jpg', desc: 'Godzilla y Kong deben unirse contra una colosal amenaza no descubierta escondida en nuestro mundo.' },
  { id: 653346, title: 'Kung Fu Panda 4', year: '2024', genre: 'Animación', rating: '7.0', poster: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', desc: 'Po es elegido para convertirse en el Líder Espiritual del Valle de la Paz y debe encontrar un nuevo Guerrero Dragón.' },
  { id: 693134, title: 'Dune: Parte 2', year: '2024', genre: 'Ciencia Ficción', rating: '8.1', poster: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', desc: 'Paul Atreides se une a los Fremen para vengarse de los conspiradores que destruyeron a su familia.' },
  
  // ── Clásicos populares ──
  { id: 299534, title: 'Avengers: Endgame', year: '2019', genre: 'Acción', rating: '8.3', poster: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', desc: 'Los Vengadores restantes deben encontrar la forma de recuperar a sus aliados para un enfrentamiento épico con Thanos.' },
  { id: 299536, title: 'Avengers: Infinity War', year: '2018', genre: 'Acción', rating: '8.3', poster: '/7WsyChQLEftFiDhRDfGQ7bIGN8Z.jpg', desc: 'Los Vengadores y sus aliados luchan por proteger al mundo de la amenaza más poderosa de la galaxia: Thanos.' },
  { id: 634649, title: 'Spider-Man: No Way Home', year: '2021', genre: 'Acción', rating: '8.0', poster: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', desc: 'Peter Parker busca la ayuda de Doctor Strange para que el mundo olvide su identidad secreta.' },
  { id: 505642, title: 'Black Panther: Wakanda Forever', year: '2022', genre: 'Acción', rating: '6.7', poster: '/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', desc: 'La reina Ramonda, Shuri, MBaku, Okoye y las Dora Milaje luchan por proteger su nación.' },
  { id: 436270, title: 'Black Adam', year: '2022', genre: 'Acción', rating: '6.8', poster: '/3zXceNTtyj5FLjwQXuPvLYK5YYL.jpg', desc: 'Casi 5,000 años después de haber sido otorgado los poderes omnipotentes de los dioses egipcios, Black Adam es liberado.' },
  { id: 447365, title: 'Guardianes de la Galaxia Vol. 3', year: '2023', genre: 'Acción', rating: '7.9', poster: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', desc: 'Peter Quill debe reunir a su equipo para defender al universo y proteger a uno de los suyos.' },
  { id: 385687, title: 'Rápidos y Furiosos X', year: '2023', genre: 'Acción', rating: '7.0', poster: '/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', desc: 'Dom Toretto y su familia son perseguidos por el vengativo hijo de Hernan Reyes.' },
  { id: 569094, title: 'Spider-Man: A Través del Spider-Verso', year: '2023', genre: 'Animación', rating: '8.4', poster: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', desc: 'Miles Morales regresa para una aventura épica que transportará a los Spider-Man a través del Multiverso.' },
  { id: 872585, title: 'Oppenheimer', year: '2023', genre: 'Drama', rating: '8.1', poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', desc: 'La historia de J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.' },
  { id: 346698, title: 'Barbie', year: '2023', genre: 'Comedia', rating: '7.0', poster: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', desc: 'Barbie y Ken se embarcan en una aventura de autodescubrimiento en el mundo real.' },
  { id: 609681, title: 'Wonka', year: '2023', genre: 'Comedia', rating: '7.2', poster: '/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', desc: 'Basada en el personaje extraordinario del mejor vendedor de chocolate del mundo: Willy Wonka.' },
  { id: 466420, title: 'Killers of the Flower Moon', year: '2023', genre: 'Drama', rating: '7.5', poster: '/dB6Krk806zeqd0YNp2ngQ9zXteR.jpg', desc: 'Miembros de la nación Osage son asesinados uno a uno en los años 20 cuando se descubre petróleo en sus tierras.' },
  
  // ── Películas Latino populares ──
  { id: 568124, title: 'Encanto', year: '2021', genre: 'Animación', rating: '7.2', poster: '/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg', desc: 'La familia Madrigal vive escondida en las montañas de Colombia en una casa mágica. Todos tienen poderes excepto Mirabel.' },
  { id: 508947, title: 'Turning Red', year: '2022', genre: 'Animación', rating: '7.4', poster: '/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg', desc: 'Mei Lee, una adolescente de 13 años, se transforma en un panda rojo gigante cada vez que se emociona demasiado.' },
  { id: 502356, title: 'Super Mario Bros: La Película', year: '2023', genre: 'Animación', rating: '7.6', poster: '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', desc: 'Mario y su hermano Luigi son transportados al Reino Champiñón donde deben derrotar a Bowser.' },
  { id: 1011985, title: 'Kung Fu Panda 4', year: '2024', genre: 'Animación', rating: '6.9', poster: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', desc: 'Po debe encontrar y entrenar a un nuevo Guerrero Dragón antes de convertirse en Líder Espiritual.' },
  { id: 508883, title: 'Luca', year: '2021', genre: 'Animación', rating: '7.5', poster: '/jTswp6KyDYKtvC52GbHagrZbGvD.jpg', desc: 'En una hermosa ciudad costera de la Riviera italiana, un joven pasa un verano inolvidable con su nuevo mejor amigo.' },
  { id: 438631, title: 'Dune', year: '2021', genre: 'Ciencia Ficción', rating: '7.8', poster: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', desc: 'Paul Atreides, un joven brillante destinado a un gran futuro, debe viajar al planeta más peligroso del universo.' },
  { id: 614933, title: 'Batman', year: '2022', genre: 'Acción', rating: '7.7', poster: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', desc: 'Cuando un asesino se dirige a la élite de Gotham, Batman investiga la corrupción oculta de la ciudad.' },
  { id: 315162, title: 'Llegada', year: '2016', genre: 'Ciencia Ficción', rating: '7.6', poster: '/pEzNVQfdzYDzVK9IiSAWsfnT7CE.jpg', desc: 'Una lingüista es reclutada por el ejército para descubrir cómo comunicarse con visitantes extraterrestres.' },
  { id: 640146, title: 'Ant-Man y la Avispa: Quantumania', year: '2023', genre: 'Acción', rating: '6.1', poster: '/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg', desc: 'Scott Lang y Hope Van Dyne son arrastrados al Reino Cuántico junto con la familia de Hope.' },
  
  // ── Terror y Suspenso ──
  { id: 1008042, title: 'Hablar con Extraños', year: '2024', genre: 'Terror', rating: '6.6', poster: '/f4oZTcfGrVTXKTWg157AwikXqmA.jpg', desc: 'Una joven artista descubre algo aterrador sobre su misterioso vecino en una comunidad rural.' },
  { id: 950396, title: 'The Watchers', year: '2024', genre: 'Terror', rating: '5.6', poster: '/vZVEUPychdvZLrTNwWErr9xZATd.jpg', desc: 'Mina se queda varada en un bosque del oeste de Irlanda, donde es vigilada por criaturas misteriosas cada noche.' },
  { id: 762441, title: 'Un Lugar en Silencio: Día Uno', year: '2024', genre: 'Terror', rating: '6.8', poster: '/hU42CRBGAo0gFyJH1eYj6wAk16Z.jpg', desc: 'La historia de la invasión de las criaturas que cazan por el sonido, vista desde el primer día en Nueva York.' },
  { id: 1001311, title: 'Bajo el Puente', year: '2024', genre: 'Suspenso', rating: '6.2', poster: '/wWBA8TGJoSWRKJpejqVLPSwGeds.jpg', desc: 'Un aterrador descubrimiento debajo de un puente desata una investigación que sacude a una pequeña comunidad.' },
  
  // ── Comedia y Drama ──
  { id: 646097, title: 'Rebel Moon: Parte Uno', year: '2023', genre: 'Ciencia Ficción', rating: '5.6', poster: '/ui4DrH1cKk2vkHshcUcGt2lKxCm.jpg', desc: 'Una joven busca guerreros de otros planetas para derrotar a un tirano que amenaza su colonia pacífica.' },
  { id: 572802, title: 'Aquaman y el Reino Perdido', year: '2023', genre: 'Acción', rating: '6.1', poster: '/8xV47NDrjdZDpkVcCFqkdHa3T5C.jpg', desc: 'Arthur Curry debe forjar una alianza incómoda con su hermano para proteger Atlantis.' },
  { id: 940721, title: 'Godzilla Minus One', year: '2023', genre: 'Acción', rating: '7.8', poster: '/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg', desc: 'En un Japón devastado por la guerra, surge una nueva amenaza en forma de un monstruo colosal.' },
  { id: 787699, title: 'Wonka', year: '2023', genre: 'Comedia', rating: '7.1', poster: '/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', desc: 'La historia del joven Willy Wonka y su sueño de abrir una fábrica de chocolate.' },
  { id: 1096197, title: 'No Hard Feelings', year: '2023', genre: 'Comedia', rating: '6.5', poster: '/gD72DhJ7NbfxvtxGiAzLaa0xaoj.jpg', desc: 'Una mujer desesperada acepta un trabajo inusual: hacer que el hijo tímido de unos padres adinerados salga de su caparazón.' },
  { id: 976573, title: 'Elemental', year: '2023', genre: 'Animación', rating: '7.5', poster: '/6oH378KUfCEitzJkm07r97L0RsZ.jpg', desc: 'En una ciudad donde los residentes de fuego, agua, tierra y aire viven juntos, una joven de fuego y un chico de agua descubren algo elemental.' },
  { id: 901362, title: 'Trolls 3: Se Armó La Banda', year: '2023', genre: 'Animación', rating: '6.7', poster: '/bkpPTZUdq31UGDovmszsg2CchiR.jpg', desc: 'Poppy y Branch descubren que una vez fueron parte del grupo más famoso, BroZone.' },
];

// ── Series personalizadas del usuario ──
export const customSeries = [
  {
    id: 'custom-asi-aprenderas',
    title: 'Así Aprenderás',
    description: 'Drama coreano de suspenso y acción. Un maestro busca justicia por sus alumnos.',
    poster: '/assets/asi_aprenderas.jpg',
    category: 'Series',
    type: 'series',
    episodes: [
      { number: 1, title: 'Capítulo 1', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/c0f3c30d-cff2-45c5-a0fd-d269c718cda6/720p-h264/720p-h264.m3u8?token=1780985491_31af3a3b38d8d0e86dc6a2dad4ae09abfbd6701605811863e909bc9fa5dfb55c&requestType=manifest&sessionId=a1954e59-2e17-4e4e-ba5c-a05b64730791&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 2, title: 'Capítulo 2', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/5fffd86e-6006-4b79-b568-55cda6ebbc9a/720p-h264/720p-h264.m3u8?token=1780985644_9425a1f209ea0c6c64c39e1ac73044ca8d9008bfe9806a783221bb88bfa5f3c7&requestType=manifest&sessionId=b3bd8d0d-da96-48e9-a98b-d3e7c8ce0497&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 3, title: 'Capítulo 3', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/101b753d-8446-4181-856c-b5c007b318e7/720p-h264/720p-h264.m3u8?token=1780985715_c3c7f46b956f720077fe6f07d6b7d22ff1b6d831ae2eda8eab8d0a94220ec3ca&requestType=manifest&sessionId=6b160e56-23a6-4c7f-b255-e6e5bae6d20e&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 4, title: 'Capítulo 4', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/16453582-a230-4e7b-a4f4-97f8dd8fe3ac/720p-h264/720p-h264.m3u8?token=1780985787_79852c751eec631a03c3f48a4b31c7529480042c521650aae9a8315217582ccd&requestType=manifest&sessionId=c2ed3b24-5070-4eeb-8356-9d125a645867&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 5, title: 'Capítulo 5', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/685f3cd0-3596-4634-95e1-72d13454b57e/720p-h264/720p-h264.m3u8?token=1780985843_0bb4ac98d35f2db08e6c5414cee0100e10800939a8097ce944bd8c07d313211d&requestType=manifest&sessionId=7431e99a-3784-4ec3-b7b2-79306f16a17c&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
      { number: 6, title: 'Capítulo 6', streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/274ebd11-44e3-4df7-8d6c-a3c5282b8ccd/720p-h264/720p-h264.m3u8?token=1780985892_8b8d9348628644ea2feaa0baea054013d6c7de11a1ca6ee72b5a1be713978824&requestType=manifest&sessionId=30e8dab8-65ac-474a-b478-d450ebb0494a&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf' },
    ],
    streamUrl: 'https://ny1.primecdn.co/stream/hls/51accc1d-3a6c-45e3-bca6-07841d27fd84/c0f3c30d-cff2-45c5-a0fd-d269c718cda6/720p-h264/720p-h264.m3u8?token=1780985491_31af3a3b38d8d0e86dc6a2dad4ae09abfbd6701605811863e909bc9fa5dfb55c&requestType=manifest&sessionId=a1954e59-2e17-4e4e-ba5c-a05b64730791&fingerprint=26e45f3cd9681087130241dbddce1cb889de94a63d53eaf0d0252559b2f03fdf'
  }
];

// ═══════════════════════════════════════════════════════════
// Funciones públicas del servicio
// ═══════════════════════════════════════════════════════════

// Cargar cartelera de películas
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  // Retornar las películas del catálogo estático
  // Simular paginación: 15 por página
  const perPage = 15;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const slice = movieCatalog.slice(start, end);

  return slice.map(m => ({
    id: m.id.toString(),
    title: m.title,
    type: 'movie',
    poster: `${POSTER_BASE}${m.poster}`,
    url: `${EMBED_BASE}/${m.id}`,
    description: m.desc,
    rating: m.rating,
    year: m.year,
    genre: m.genre
  }));
};

// Buscar películas
export const searchRepelis = async (query) => {
  const q = query.toLowerCase().trim();
  const results = movieCatalog.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genre.toLowerCase().includes(q) ||
    m.desc.toLowerCase().includes(q) ||
    m.year.includes(q)
  );
  return results.map(m => ({
    id: m.id.toString(),
    title: m.title,
    type: 'movie',
    poster: `${POSTER_BASE}${m.poster}`,
    url: `${EMBED_BASE}/${m.id}`,
    description: m.desc,
    rating: m.rating,
    year: m.year,
    genre: m.genre
  }));
};

// Obtener detalles + opciones de reproducción
export const fetchRepelisDetails = async (url) => {
  // Extraer el TMDB ID de la URL
  const tmdbId = url.split('/').filter(Boolean).pop();

  // Buscar la película en el catálogo
  const movie = movieCatalog.find(m => m.id.toString() === tmdbId);
  const description = movie ? movie.desc : '';

  return {
    postId: tmdbId,
    description,
    options: [
      {
        nume: '1',
        type: `https://embed.su/embed/movie/${tmdbId}`,
        post: tmdbId,
        server: 'Servidor 1 (HD)',
        lang: 'Multi Audio',
        embedUrl: `https://embed.su/embed/movie/${tmdbId}`
      },
      {
        nume: '2',
        type: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        post: tmdbId,
        server: 'Servidor 2',
        lang: 'Multi Audio',
        embedUrl: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
      },
      {
        nume: '3',
        type: `https://vidsrc.pro/embed/movie/${tmdbId}`,
        post: tmdbId,
        server: 'Servidor 3',
        lang: 'Multi Audio',
        embedUrl: `https://vidsrc.pro/embed/movie/${tmdbId}`
      }
    ]
  };
};

// Obtener embed URL directamente
export const fetchRepelisEmbed = async (post, type, nume) => {
  // Si type ya es una URL (de embed.su, multiembed, etc.) retornar directamente
  if (type && type.startsWith('http')) {
    return type;
  }
  // Fallback: construir con embed.su
  return `${EMBED_BASE}/${post}`;
};
