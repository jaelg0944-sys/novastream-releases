// src/services/vodService.js
// Catálogo VOD integrado — Películas y Series en Español Latino
// Reproductores activos y estables

const EMBED_MOVIE = 'https://vidsrc.to/embed/movie';
const EMBED_TV = 'https://vidsrc.to/embed/tv';
const POSTER = 'https://image.tmdb.org/t/p/w500';

// ═══════════════════════════════════════════════════════════════
// Helper: genera array de episodios para una temporada
// ═══════════════════════════════════════════════════════════════
function buildEpisodes(tmdbId, season, count) {
  const eps = [];
  for (let i = 1; i <= count; i++) {
    eps.push({
      number: i,
      season: season,
      title: `Temporada ${season} - Episodio ${i}`,
      streamUrl: `${EMBED_TV}/${tmdbId}/${season}/${i}`,
      isIframe: true
    });
  }
  return eps;
}

// ═══════════════════════════════════════════════════════════════
//  CATÁLOGO DE PELÍCULAS  (70+ títulos)
// ═══════════════════════════════════════════════════════════════
const movieCatalog = [
  // ── Estrenos 2025 ──
  { id: 762509, title: 'Mufasa: El Rey León', year: '2024', genre: 'Animación', rating: '7.3', poster: '/lurEK87kukYNQuFBNwH7YCTJ98f.jpg', desc: 'Rafiki narra la leyenda de Mufasa a la joven cachorra de león Kiara.' },
  { id: 1084199, title: 'Nosferatu', year: '2024', genre: 'Terror', rating: '7.1', poster: '/5qGIxdEO841C0TlCaGJNPHkzOek.jpg', desc: 'Una joven obsesionada por un antiguo vampiro de Transilvania que la persigue a través del continente.' },
  { id: 939243, title: 'Sonic 3: La Película', year: '2024', genre: 'Acción', rating: '7.8', poster: '/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg', desc: 'Sonic, Knuckles y Tails se reúnen para enfrentarse a un nuevo y poderoso adversario, Shadow.' },
  { id: 950526, title: 'Moana 2', year: '2024', genre: 'Animación', rating: '7.0', poster: '/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg', desc: 'Moana recibe una llamada inesperada de sus ancestros y debe viajar a los lejanos mares de Oceanía.' },
  { id: 558449, title: 'Gladiador II', year: '2024', genre: 'Acción', rating: '6.8', poster: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', desc: 'Años después de la muerte de Máximo, Lucio se ve obligado a entrar al Coliseo.' },
  { id: 402431, title: 'Wicked', year: '2024', genre: 'Musical', rating: '7.6', poster: '/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg', desc: 'La historia no contada de las brujas de Oz, Elphaba y Glinda, antes de Dorothy.' },
  { id: 1184918, title: 'El Robot Salvaje', year: '2024', genre: 'Animación', rating: '8.3', poster: '/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg', desc: 'Un robot inteligente naufraga en una isla deshabitada y debe aprender a adaptarse a la naturaleza.' },
  { id: 917496, title: 'Beetlejuice Beetlejuice', year: '2024', genre: 'Comedia', rating: '7.0', poster: '/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg', desc: 'Tres generaciones de la familia Deetz regresan a casa en Winter River y Beetlejuice regresa.' },
  { id: 912649, title: 'Venom: El Último Baile', year: '2024', genre: 'Acción', rating: '6.3', poster: '/k42Owka8v91Yw8J3MUPXIuYOmyA.jpg', desc: 'Eddie y Venom están en fuga. Perseguidos por ambos mundos, deben tomar una decisión devastadora.' },
  { id: 698687, title: 'Transformers One', year: '2024', genre: 'Animación', rating: '7.8', poster: '/qbkAqmmEIZfrCO8ZQAuIuVMlWoV.jpg', desc: 'La historia nunca antes contada de Optimus Prime y Megatron, hermanos de armas.' },
  { id: 945961, title: 'Alien: Romulus', year: '2024', genre: 'Terror', rating: '7.2', poster: '/b33nnKl1GSFbao4l3fZDDqsMkhF.jpg', desc: 'Un grupo de jóvenes colonizadores se encuentran cara a cara con los xenomorfos.' },
  { id: 533535, title: 'Deadpool & Wolverine', year: '2024', genre: 'Acción', rating: '7.7', poster: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', desc: 'Deadpool recluta a Wolverine para una misión que cambiará la historia del MCU.' },
  { id: 1022789, title: 'Intensa-Mente 2', year: '2024', genre: 'Animación', rating: '7.6', poster: '/oxxqiyWrnM0XPnBtVe9TgYWnPxT.jpg', desc: 'Riley entra en la adolescencia y nuevas emociones aparecen: Ansiedad, Envidia, Ennui y Vergüenza.' },
  { id: 573435, title: 'Bad Boys: Hasta La Muerte', year: '2024', genre: 'Acción', rating: '7.5', poster: '/oGythE98MYleE6mZlqs5sBos3BI.jpg', desc: 'Mike y Marcus regresan en una nueva aventura llena de acción y comedia.' },
  { id: 519182, title: 'Mi Villano Favorito 4', year: '2024', genre: 'Animación', rating: '7.0', poster: '/wWba3TaojhK7NdB0PieoJugHEhK.jpg', desc: 'Gru, Lucy y las chicas dan la bienvenida a un nuevo miembro de la familia.' },
  { id: 786892, title: 'Furiosa: De la Saga Mad Max', year: '2024', genre: 'Acción', rating: '7.6', poster: '/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', desc: 'La historia de origen de la guerrera Furiosa antes de los eventos de Fury Road.' },
  { id: 746036, title: 'El Especialista', year: '2024', genre: 'Acción', rating: '7.3', poster: '/tSz1qsmSJon0rqjHBxXZmDiKHfB.jpg', desc: 'Un doble de riesgo de Hollywood se ve envuelto en una conspiración durante su última película.' },
  { id: 823464, title: 'Godzilla x Kong: El Nuevo Imperio', year: '2024', genre: 'Acción', rating: '6.4', poster: '/z1p34vh7dEOnLDV8hAOrtGkMclR.jpg', desc: 'Godzilla y Kong deben unirse contra una amenaza escondida en las profundidades de la Tierra.' },
  { id: 653346, title: 'Kung Fu Panda 4', year: '2024', genre: 'Animación', rating: '7.0', poster: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', desc: 'Po debe encontrar y entrenar a un nuevo Guerrero Dragón.' },
  { id: 693134, title: 'Dune: Parte Dos', year: '2024', genre: 'Ciencia Ficción', rating: '8.1', poster: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', desc: 'Paul Atreides se une a los Fremen para vengarse de los conspiradores que destruyeron a su familia.' },
  { id: 748783, title: 'Garfield: Fuera de Casa', year: '2024', genre: 'Animación', rating: '7.1', poster: '/p1xnX5OaKd4GJNsBYcVTvOig9vz.jpg', desc: 'Garfield se embarca en una aventura al aire libre con su padre perdido hace tiempo.' },
  { id: 718821, title: 'Twisters', year: '2024', genre: 'Acción', rating: '7.0', poster: '/pjnD08FlMAIXsfOLKQbvmO0CEuT.jpg', desc: 'Una nueva generación de cazadores de tormentas se enfrenta a fenómenos nunca antes vistos.' },

  // ── Éxitos 2023 ──
  { id: 872585, title: 'Oppenheimer', year: '2023', genre: 'Drama', rating: '8.1', poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', desc: 'La historia de J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.' },
  { id: 346698, title: 'Barbie', year: '2023', genre: 'Comedia', rating: '7.0', poster: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', desc: 'Barbie y Ken se embarcan en una aventura de autodescubrimiento en el mundo real.' },
  { id: 569094, title: 'Spider-Man: A Través del Spider-Verso', year: '2023', genre: 'Animación', rating: '8.4', poster: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', desc: 'Miles Morales regresa para una aventura épica que lo transportará a través del Multiverso.' },
  { id: 385687, title: 'Rápidos y Furiosos X', year: '2023', genre: 'Acción', rating: '7.0', poster: '/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', desc: 'Dom Toretto y su familia son perseguidos por el vengativo hijo de Hernan Reyes.' },
  { id: 447365, title: 'Guardianes de la Galaxia Vol. 3', year: '2023', genre: 'Acción', rating: '7.9', poster: '/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg', desc: 'Peter Quill debe reunir a su equipo para defender al universo y proteger a Rocket.' },
  { id: 940551, title: 'Migration: Un Viaje Patas Arriba', year: '2023', genre: 'Animación', rating: '7.4', poster: '/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg', desc: 'Una familia de patos convence a su padre sobreprotector de unas vacaciones migratorias.' },
  { id: 603692, title: 'John Wick 4', year: '2023', genre: 'Acción', rating: '7.7', poster: '/vZloFAK7NmvMGKE7buEebVSma1g.jpg', desc: 'John Wick encuentra un camino para derrotar a la Alta Mesa, pero debe enfrentarse a un nuevo enemigo.' },
  { id: 502356, title: 'Super Mario Bros: La Película', year: '2023', genre: 'Animación', rating: '7.6', poster: '/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', desc: 'Mario y Luigi son transportados al Reino Champiñón para derrotar a Bowser.' },
  { id: 575264, title: 'Misión Imposible: Sentencia Mortal', year: '2023', genre: 'Acción', rating: '7.6', poster: '/NNxYkU70HPurnNCSiCjYAmacwm.jpg', desc: 'Ethan Hunt enfrenta su misión más peligrosa: una amenaza que afecta a toda la humanidad.' },
  { id: 507089, title: 'Five Nights at Freddy\'s', year: '2023', genre: 'Terror', rating: '6.3', poster: '/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg', desc: 'Un guardia de seguridad descubre que los animatrónicos cobran vida por las noches.' },
  { id: 940721, title: 'Godzilla Minus One', year: '2023', genre: 'Acción', rating: '7.8', poster: '/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg', desc: 'En un Japón devastado por la guerra, surge una nueva amenaza en forma de un monstruo colosal.' },
  { id: 695721, title: 'Los Juegos del Hambre: Balada de Pájaros Cantores', year: '2023', genre: 'Acción', rating: '6.9', poster: '/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg', desc: 'La historia de un joven Coriolanus Snow y la décima edición de los Juegos del Hambre.' },
  { id: 976573, title: 'Elemental', year: '2023', genre: 'Animación', rating: '7.5', poster: '/6oH378KUfCEitzJkm07r97L0RsZ.jpg', desc: 'En una ciudad donde viven fuego, agua, tierra y aire, una joven de fuego y un chico de agua descubren algo elemental.' },
  { id: 609681, title: 'Wonka', year: '2023', genre: 'Comedia', rating: '7.2', poster: '/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', desc: 'La historia del joven Willy Wonka y su sueño de abrir una fábrica de chocolate.' },

  // ── Clásicos recientes ──
  { id: 299534, title: 'Avengers: Endgame', year: '2019', genre: 'Acción', rating: '8.3', poster: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', desc: 'Los Vengadores restantes deben encontrar la forma de recuperar a sus aliados para un enfrentamiento épico con Thanos.' },
  { id: 634649, title: 'Spider-Man: No Way Home', year: '2021', genre: 'Acción', rating: '8.0', poster: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', desc: 'Peter Parker busca la ayuda de Doctor Strange cuando su identidad secreta es revelada al mundo.' },
  { id: 568124, title: 'Encanto', year: '2021', genre: 'Animación', rating: '7.2', poster: '/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg', desc: 'La familia Madrigal vive en las montañas de Colombia en una casa mágica. Todos tienen poderes excepto Mirabel.' },
  { id: 438631, title: 'Dune', year: '2021', genre: 'Ciencia Ficción', rating: '7.8', poster: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', desc: 'Paul Atreides debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia.' },
  { id: 508947, title: 'Red: Crecer es una Bestia', year: '2022', genre: 'Animación', rating: '7.4', poster: '/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg', desc: 'Mei Lee se transforma en un panda rojo gigante cada vez que se emociona demasiado.' },
  { id: 508883, title: 'Luca', year: '2021', genre: 'Animación', rating: '7.5', poster: '/jTswp6KyDYKtvC52GbHagrZbGvD.jpg', desc: 'En la Riviera italiana, un joven monstruo marino pasa un verano inolvidable con su mejor amigo.' },
  { id: 614933, title: 'Batman', year: '2022', genre: 'Acción', rating: '7.7', poster: '/74xTEgt7R36Fpooo50r9T25onhq.jpg', desc: 'Cuando un asesino se dirige a la élite de Gotham, Batman investiga la corrupción oculta de la ciudad.' },
  { id: 361743, title: 'Top Gun: Maverick', year: '2022', genre: 'Acción', rating: '8.2', poster: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', desc: 'Maverick entrena a un grupo de pilotos de élite para una misión imposible.' },
  { id: 315162, title: 'Llegada', year: '2016', genre: 'Ciencia Ficción', rating: '7.6', poster: '/pEzNVQfdzYDzVK9IiSAWsfnT7CE.jpg', desc: 'Una lingüista es reclutada por el ejército para comunicarse con visitantes extraterrestres.' },
  { id: 299536, title: 'Avengers: Infinity War', year: '2018', genre: 'Acción', rating: '8.3', poster: '/7WsyChQLEftFiDhRDfGQ7bIGN8Z.jpg', desc: 'Los Vengadores luchan por proteger al mundo de Thanos, que busca las Gemas del Infinito.' },
  { id: 284053, title: 'Thor: Ragnarok', year: '2017', genre: 'Acción', rating: '7.9', poster: '/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg', desc: 'Thor debe escapar del planeta Sakaar y salvar Asgard de la destructora Hela.' },
  { id: 284054, title: 'Black Panther', year: '2018', genre: 'Acción', rating: '7.3', poster: '/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', desc: 'T\'Challa regresa a Wakanda para asumir el trono, pero un viejo enemigo reaparece.' },
  { id: 496243, title: 'Parásitos', year: '2019', genre: 'Drama', rating: '8.5', poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', desc: 'Una familia pobre se infiltra en la vida de una familia rica con consecuencias inesperadas.' },
  { id: 429617, title: 'Spider-Man: Un Nuevo Universo', year: '2018', genre: 'Animación', rating: '8.4', poster: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', desc: 'Miles Morales se convierte en Spider-Man y conoce a otros Spider-People del multiverso.' },
  { id: 324857, title: 'Spider-Man: Lejos de Casa', year: '2019', genre: 'Acción', rating: '7.4', poster: '/4q2NNj4S5dG2RLF9CevPitEfBQw.jpg', desc: 'Peter Parker viaja a Europa con sus amigos, pero Nick Fury tiene otros planes para él.' },
  { id: 580489, title: 'Venom: Carnage Liberado', year: '2021', genre: 'Acción', rating: '6.8', poster: '/q2CtXYjV5xQnlIiGn0DXSNO8ppL.jpg', desc: 'Eddie Brock y Venom deben enfrentar a un nuevo simbionte: Carnage.' },
  { id: 505642, title: 'Black Panther: Wakanda Forever', year: '2022', genre: 'Acción', rating: '6.7', poster: '/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', desc: 'Wakanda debe protegerse de una nueva amenaza mientras honra la memoria de T\'Challa.' },
];

// ═══════════════════════════════════════════════════════════════
//  CATÁLOGO DE SERIES  (25+ series, con episodios)
// ═══════════════════════════════════════════════════════════════
const seriesCatalog = [
  { id: 93405, title: 'El Juego del Calamar', year: '2021', genre: 'Drama', rating: '7.8', poster: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', desc: 'Cientos de jugadores con problemas de dinero aceptan una extraña invitación a un juego de supervivencia.', seasons: [{ s: 1, eps: 9 }, { s: 2, eps: 7 }] },
  { id: 119051, title: 'Merlina', year: '2022', genre: 'Comedia', rating: '8.2', poster: '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', desc: 'Merlina Addams investiga una serie de asesinatos misteriosos que azotaron a Nevermore Academy.', seasons: [{ s: 1, eps: 8 }] },
  { id: 100088, title: 'The Last of Us', year: '2023', genre: 'Drama', rating: '8.6', poster: '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', desc: 'Joel debe escoltar a Ellie a través de un mundo post-apocalíptico plagado de infectados.', seasons: [{ s: 1, eps: 9 }, { s: 2, eps: 7 }] },
  { id: 111110, title: 'One Piece', year: '2023', genre: 'Aventura', rating: '8.3', poster: '/rVX05xRKS5JhEYQFObCi4lAnZT4.jpg', desc: 'Monkey D. Luffy y su tripulación pirata buscan el tesoro más grande del mundo: el One Piece.', seasons: [{ s: 1, eps: 8 }] },
  { id: 66732, title: 'Stranger Things', year: '2016', genre: 'Ciencia Ficción', rating: '8.6', poster: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', desc: 'Un grupo de niños en los 80s descubre fuerzas sobrenaturales y experimentos secretos del gobierno.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 9 }, { s: 3, eps: 8 }, { s: 4, eps: 9 }] },
  { id: 71446, title: 'La Casa de Papel', year: '2017', genre: 'Acción', rating: '8.2', poster: '/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', desc: 'Un grupo de atracadores lleva a cabo el atraco más perfecto de la historia de España.', seasons: [{ s: 1, eps: 13 }, { s: 2, eps: 9 }, { s: 3, eps: 8 }, { s: 4, eps: 8 }, { s: 5, eps: 10 }] },
  { id: 84958, title: 'Loki', year: '2021', genre: 'Ciencia Ficción', rating: '8.1', poster: '/voHUmluYmKyleFkTu3lOXQG702u.jpg', desc: 'Loki es reclutado por la TVA después de robar el Teseracto, alterando la línea temporal.', seasons: [{ s: 1, eps: 6 }, { s: 2, eps: 6 }] },
  { id: 77169, title: 'Cobra Kai', year: '2018', genre: 'Acción', rating: '8.1', poster: '/6POBWybSBBKC7t0N3AYjsZPGRIX.jpg', desc: 'Décadas después de su rivalidad, Daniel LaRusso y Johnny Lawrence reabren el dojo Cobra Kai.', seasons: [{ s: 1, eps: 10 }, { s: 2, eps: 10 }, { s: 3, eps: 10 }, { s: 4, eps: 10 }, { s: 5, eps: 10 }, { s: 6, eps: 15 }] },
  { id: 94605, title: 'Arcane', year: '2021', genre: 'Animación', rating: '8.7', poster: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', desc: 'En las ciudades de Piltover y Zaun, dos hermanas luchan en bandos opuestos de una guerra.', seasons: [{ s: 1, eps: 9 }, { s: 2, eps: 9 }] },
  { id: 82856, title: 'The Mandalorian', year: '2019', genre: 'Ciencia Ficción', rating: '8.5', poster: '/eU1i6eHXlzMOlEq0ku1Bxm8qiHk.jpg', desc: 'Un cazarrecompensas solitario en los confines de la galaxia protege a una misteriosa criatura.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }, { s: 3, eps: 8 }] },
  { id: 63351, title: 'Narcos', year: '2015', genre: 'Drama', rating: '8.0', poster: '/rTmal9fDbwh5F0waol2hq35U4ah.jpg', desc: 'La historia real del narcotráfico en Colombia y la persecución de Pablo Escobar.', seasons: [{ s: 1, eps: 10 }, { s: 2, eps: 10 }, { s: 3, eps: 10 }] },
  { id: 1396, title: 'Breaking Bad', year: '2008', genre: 'Drama', rating: '8.9', poster: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', desc: 'Un profesor de química con cáncer terminal se convierte en fabricante de metanfetaminas.', seasons: [{ s: 1, eps: 7 }, { s: 2, eps: 13 }, { s: 3, eps: 13 }, { s: 4, eps: 13 }, { s: 5, eps: 16 }] },
  { id: 60574, title: 'Peaky Blinders', year: '2013', genre: 'Drama', rating: '8.5', poster: '/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg', desc: 'Una familia de gánsteres en Birmingham, Inglaterra, lucha por poder y territorio después de la Primera Guerra Mundial.', seasons: [{ s: 1, eps: 6 }, { s: 2, eps: 6 }, { s: 3, eps: 6 }, { s: 4, eps: 6 }, { s: 5, eps: 6 }, { s: 6, eps: 6 }] },
  { id: 71912, title: 'The Witcher', year: '2019', genre: 'Fantasía', rating: '8.0', poster: '/7vjaCdMw15FEbXyLQTVa04URsPm.jpg', desc: 'Geralt de Rivia, un cazador de monstruos mutante, lucha por encontrar su lugar en un mundo lleno de maldad.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }, { s: 3, eps: 8 }] },
  { id: 96677, title: 'Lupin', year: '2021', genre: 'Acción', rating: '7.8', poster: '/sgxawbFBYBFAMGPRDFxlEKOdPFr.jpg', desc: 'Inspirado por Arsène Lupin, un ladrón caballeroso busca venganza contra la familia que arruinó a su padre.', seasons: [{ s: 1, eps: 5 }, { s: 2, eps: 5 }, { s: 3, eps: 5 }] },
  { id: 76669, title: 'Élite', year: '2018', genre: 'Drama', rating: '7.5', poster: '/3NTAbAiao4JLzFQw6YjXUI3TzJF.jpg', desc: 'Tres estudiantes de clase baja llegan a un colegio exclusivo de España, desatando conflictos y misterios.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }, { s: 3, eps: 8 }, { s: 4, eps: 8 }] },
  { id: 70523, title: 'Dark', year: '2017', genre: 'Ciencia Ficción', rating: '8.7', poster: '/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg', desc: 'La desaparición de niños en una pequeña ciudad alemana revela relaciones y viajes en el tiempo.', seasons: [{ s: 1, eps: 10 }, { s: 2, eps: 8 }, { s: 3, eps: 8 }] },
  { id: 110316, title: 'Alice in Borderland', year: '2020', genre: 'Acción', rating: '8.1', poster: '/20mOwAAPwZ1vLQkuf3sVScXAhpT.jpg', desc: 'Un joven gamer y sus amigos se ven atrapados en una Tokio abandonada donde deben jugar para sobrevivir.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }] },
  { id: 130392, title: 'Estamos Muertos', year: '2022', genre: 'Terror', rating: '8.0', poster: '/pMFmaL03gRNiNcAZMrG88moMUER.jpg', desc: 'Un grupo de estudiantes queda atrapado en su escuela cuando un virus zombi se desata.', seasons: [{ s: 1, eps: 12 }] },
  { id: 85937, title: 'Demon Slayer', year: '2019', genre: 'Animación', rating: '8.7', poster: '/wrCVHdkBlBWdPhCxGkcHlWLLsV7.jpg', desc: 'Tanjiro busca una cura para su hermana convertida en demonio mientras se une a los cazadores de demonios.', seasons: [{ s: 1, eps: 26 }, { s: 2, eps: 18 }, { s: 3, eps: 11 }, { s: 4, eps: 8 }] },
  { id: 95557, title: 'Invencible', year: '2021', genre: 'Animación', rating: '8.7', poster: '/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg', desc: 'Mark Grayson hereda los poderes de su padre, el superhéroe más poderoso del planeta, y descubre oscuros secretos.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }] },
  { id: 114461, title: 'Ahsoka', year: '2023', genre: 'Ciencia Ficción', rating: '7.5', poster: '/laCJxobHoPVaLQTKxc14Y2zV64J.jpg', desc: 'Ahsoka Tano investiga una amenaza emergente para la galaxia tras la caída del Imperio.', seasons: [{ s: 1, eps: 8 }] },
  { id: 203057, title: 'Shōgun', year: '2024', genre: 'Drama', rating: '8.7', poster: '/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg', desc: 'Un náufrago inglés llega al Japón feudal y se ve envuelto en una lucha por el poder entre señores de la guerra.', seasons: [{ s: 1, eps: 10 }] },
  { id: 237019, title: 'El Problema de los 3 Cuerpos', year: '2024', genre: 'Ciencia Ficción', rating: '7.5', poster: '/pFqzXacKsi3Wyfx7Wd6dOpSHA4T.jpg', desc: 'Científicos de todo el mundo se enfrentan a una amenaza existencial que trasciende el tiempo y el espacio.', seasons: [{ s: 1, eps: 8 }] },
  { id: 125988, title: 'Reacher', year: '2022', genre: 'Acción', rating: '8.1', poster: '/dNJNy2vBfNVJfvhEuK5aX7DmhLa.jpg', desc: 'Jack Reacher, un ex investigador militar, llega a un pueblo pequeño y se ve envuelto en una conspiración mortal.', seasons: [{ s: 1, eps: 8 }, { s: 2, eps: 8 }] },
];

// Series custom locales del usuario
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

// ═══════════════════════════════════════════════════════════════
//  Funciones del servicio
// ═══════════════════════════════════════════════════════════════

function formatMovie(m) {
  return {
    id: m.id.toString(),
    title: m.title,
    type: 'movie',
    poster: `${POSTER}${m.poster}`,
    url: `${EMBED_MOVIE}/${m.id}`,
    description: m.desc,
    rating: m.rating,
    year: m.year,
    genre: m.genre
  };
}

function formatSeries(s) {
  // Generar episodios de TODAS las temporadas
  let allEpisodes = [];
  for (const season of s.seasons) {
    allEpisodes = allEpisodes.concat(buildEpisodes(s.id, season.s, season.eps));
  }
  return {
    id: s.id.toString(),
    title: s.title,
    type: 'series',
    poster: `${POSTER}${s.poster}`,
    url: s.id.toString(),
    description: s.desc,
    rating: s.rating,
    year: s.year,
    genre: s.genre,
    episodes: allEpisodes,
    seasons: s.seasons
  };
}

// Cargar cartelera
export const fetchRepelisCartelera = async (type = 'pelicula', page = 1) => {
  if (type === 'serie') {
    // Retornar series del catálogo
    return seriesCatalog.map(formatSeries);
  }
  // Retornar películas
  return movieCatalog.map(formatMovie);
};

// Buscar
export const searchRepelis = async (query) => {
  const q = query.toLowerCase().trim();
  const movieResults = movieCatalog
    .filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.year.includes(q))
    .map(formatMovie);
  const seriesResults = seriesCatalog
    .filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.year.includes(q))
    .map(formatSeries);
  return [...movieResults, ...seriesResults];
};

// Detalles de película (servidores de reproducción)
export const fetchRepelisDetails = async (url) => {
  const tmdbId = url.split('/').filter(Boolean).pop();
  const movie = movieCatalog.find(m => m.id.toString() === tmdbId);
  return {
    postId: tmdbId,
    description: movie ? movie.desc : '',
    options: [
      { nume: '1', type: `https://vidsrcme.ru/embed/movie/${tmdbId}`, post: tmdbId, server: 'Servidor 1 (vidsrc.me)', lang: 'Latino / Multi', embedUrl: `https://vidsrcme.ru/embed/movie/${tmdbId}` },
      { nume: '2', type: `https://www.2embed.cc/embed/${tmdbId}`, post: tmdbId, server: 'Servidor 2 (2embed)', lang: 'Latino / Multi', embedUrl: `https://www.2embed.cc/embed/${tmdbId}` },
      { nume: '3', type: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`, post: tmdbId, server: 'Servidor 3 (Multiembed)', lang: 'Latino / Multi', embedUrl: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
      { nume: '4', type: `https://vidsrc.to/embed/movie/${tmdbId}`, post: tmdbId, server: 'Servidor 4 (vidsrc.to)', lang: 'Latino / Multi', embedUrl: `https://vidsrc.to/embed/movie/${tmdbId}` },
    ]
  };
};

// Embed URL
export const fetchRepelisEmbed = async (post, type, nume) => {
  if (type && type.startsWith('http')) return type;
  return `https://vidsrc.to/embed/movie/${post}`;
};
