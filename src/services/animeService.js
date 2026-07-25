// src/services/animeService.js
// Servicio dedicado exclusivamente a la sección de Anime (Audio Latino)

export const LATINO_ANIMES = [
  {
    id: 'db-super',
    slug: 'dragon-ball-super',
    title: 'Dragon Ball Super (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21175-97w42aWf21X2.jpg',
    synopsis: 'Después de derrotar a Majin Boo, la paz regresa a la Tierra. Son Goku ahora trabaja como agricultor pero sigue entrenando. Aparece Bills, el Dios de la Destrucción.',
    rating: '9.2',
    year: '2015',
    episodesCount: 131,
    genre: 'Acción, Artes Marciales, Fantasía',
    audio: 'Español Latino',
    tmdbId: '62715',
    type: 'tv'
  },
  {
    id: 'db-z',
    slug: 'dragon-ball-z',
    title: 'Dragon Ball Z (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx813-w0C4f2kIomx7.jpg',
    synopsis: 'Cinco años después del torneo de artes marciales, Raditz llega a la Tierra para revelar el verdadero origen de Goku como un guerrero Saiyajin.',
    rating: '9.5',
    year: '1989',
    episodesCount: 291,
    genre: 'Acción, Clásico, Artes Marciales',
    audio: 'Español Latino',
    tmdbId: '12971',
    type: 'tv'
  },
  {
    id: 'dragon-ball',
    slug: 'dragon-ball',
    title: 'Dragon Ball (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx223-scE5uJfXqqj8.png',
    synopsis: 'Son Goku es un niño solitario que vive en el bosque hasta que conoce a Bulma, una joven en busca de las 7 Esferas del Dragón.',
    rating: '8.8',
    year: '1986',
    episodesCount: 153,
    genre: 'Acción, Aventura, Clásico',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'demon-slayer',
    slug: 'kimetsu-no-yaiba',
    title: 'Demon Slayer: Kimetsu no Yaiba (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
    synopsis: 'Tanjiro Kamado vive pacíficamente hasta que su familia es masacrada por un demonio. Su hermana Nezuko sobrevive transformada en demonio.',
    rating: '9.3',
    year: '2019',
    episodesCount: 55,
    genre: 'Demonios, Sobrenatural, Acción',
    audio: 'Español Latino',
    tmdbId: '85937',
    type: 'tv'
  },
  {
    id: 'naruto-shippuden',
    slug: 'naruto-shippuden',
    title: 'Naruto Shippuden (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png',
    synopsis: 'Han pasado dos años y medio desde que Naruto Uzumaki dejó Konohagakure para entrenar con Jiraiya. La organización Akatsuki comienza su movimiento.',
    rating: '9.0',
    year: '2007',
    episodesCount: 500,
    genre: 'Ninja, Shounen, Aventura',
    audio: 'Español Latino',
    tmdbId: '31910',
    type: 'tv'
  },
  {
    id: 'naruto',
    slug: 'naruto',
    title: 'Naruto (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-dE6UHbFFg1A5.jpg',
    synopsis: 'Naruto Uzumaki es un ninja hiperactivo de Konoha que sueña con convertirse en el Hokage definitivo de su aldea.',
    rating: '8.7',
    year: '2002',
    episodesCount: 220,
    genre: 'Ninja, Aventura, Clásico',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'attack-on-titan',
    slug: 'shingeki-no-kyojin',
    title: 'Shingeki no Kyojin / Attack on Titan (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
    synopsis: 'Hace cien años, la humanidad fue llevada al borde de la extinción por monstruos gigantescos llamados Titanes.',
    rating: '9.6',
    year: '2013',
    episodesCount: 89,
    genre: 'Acción, Suspenso, Militar',
    audio: 'Español Latino',
    tmdbId: '1429',
    type: 'tv'
  },
  {
    id: 'one-piece',
    slug: 'one-piece',
    title: 'One Piece (Audio Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
    synopsis: 'Monkey D. Luffy se hace a la mar con sus nakamas para encontrar el legendario tesoro One Piece y convertirse en el Rey de los Piratas.',
    rating: '9.4',
    year: '1999',
    episodesCount: 1090,
    genre: 'Piratas, Aventura, Fantasía',
    audio: 'Español Latino',
    tmdbId: '37854',
    type: 'tv'
  },
  {
    id: 'jujutsu-kaisen',
    slug: 'jujutsu-kaisen-tv',
    title: 'Jujutsu Kaisen (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
    synopsis: 'Yuuji Itadori es un estudiante con una fuerza física descomunal. Tras comer un dedo del Rey de las Maldiciones, Ryomen Sukuna, ingresa a la escuela de hechicería.',
    rating: '9.1',
    year: '2020',
    episodesCount: 47,
    genre: 'Hechicería, Acción, Sobrenatural',
    audio: 'Español Latino',
    tmdbId: '95479',
    type: 'tv'
  },
  {
    id: 'saint-seiya',
    slug: 'saint-seiya',
    title: 'Los Caballeros del Zodiaco (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/1254.jpg',
    synopsis: 'Cinco jóvenes guerreros conocidos como los Caballeros juran proteger a la reencarnación de la diosa Atenea frente a las fuerzas del mal.',
    rating: '9.4',
    year: '1986',
    episodesCount: 114,
    genre: 'Mitología, Clásico, Acción',
    audio: 'Español Latino',
    tmdbId: '4626',
    type: 'tv'
  },
  {
    id: 'sailor-moon',
    slug: 'sailor-moon',
    title: 'Sailor Moon (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx530-O8q6KpJ244Qk.jpg',
    synopsis: 'Usagi Tsukino conoce a una gata parlante llamada Luna que le otorga el poder de transformarse en Sailor Moon para proteger a la Tierra.',
    rating: '9.0',
    year: '1992',
    episodesCount: 200,
    genre: 'Magical Girl, Clásico, Romance',
    audio: 'Español Latino',
    tmdbId: '3697',
    type: 'tv'
  },
  {
    id: 'pokemon',
    slug: 'pokemon',
    title: 'Pokémon: Serie Original (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx138699-V0PBmiG6hnuf.jpg',
    synopsis: 'Ash Ketchum cumple 10 años y comienza su viaje como entrenador Pokémon junto a Pikachu para convertirse en el Maestro Pokémon definitivo.',
    rating: '8.9',
    year: '1997',
    episodesCount: 276,
    genre: 'Aventura, Clásico, Infantil',
    audio: 'Español Latino',
    tmdbId: '60572',
    type: 'tv'
  },
  {
    id: 'solo-leveling',
    slug: 'ore-dake-level-up-na-ken',
    title: 'Solo Leveling (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png',
    synopsis: 'En un mundo donde cazadores humanos enfrentan monstruos, Sung Jinwoo, el cazador más débil, descubre un sistema secreto para subir de nivel infinitamente.',
    rating: '9.4',
    year: '2024',
    episodesCount: 12,
    genre: 'Acción, Sistema, Fantasía Oscura',
    audio: 'Español Latino',
    tmdbId: '205096',
    type: 'tv'
  },
  {
    id: 'chainsaw-man',
    slug: 'chainsaw-man',
    title: 'Chainsaw Man (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png',
    synopsis: 'Denji trabaja como cazador de demonios para saldar las deudas de su padre fallecido. Tras ser traicionado, renace como el Demonio Motosierra.',
    rating: '9.0',
    year: '2022',
    episodesCount: 12,
    genre: 'Acción, Gore, Sobrenatural',
    audio: 'Español Latino',
    tmdbId: '114410',
    type: 'tv'
  },
  {
    id: 'bleach',
    slug: 'bleach',
    title: 'Bleach: Thousand-Year Blood War (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg',
    synopsis: 'Ichigo Kurosaki vuelve a la batalla cuando el Rey Quincy, Yhwach, declara la guerra a la Sociedad de Almas.',
    rating: '9.3',
    year: '2022',
    episodesCount: 26,
    genre: 'Shinigami, Acción, Sobrenatural',
    audio: 'Español Latino',
    tmdbId: '30984',
    type: 'tv'
  },
  {
    id: 'my-hero-academia',
    slug: 'boku-no-hero-academia',
    title: 'My Hero Academia (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg',
    synopsis: 'En un mundo donde el 80% de la población posee súper poderes, Izuku Midoriya nace sin poderes pero sueña con ser el héroe número uno.',
    rating: '8.8',
    year: '2016',
    episodesCount: 138,
    genre: 'Superhéroes, Escolar, Acción',
    audio: 'Español Latino',
    tmdbId: '65930',
    type: 'tv'
  },
  {
    id: 'death-note',
    slug: 'death-note',
    title: 'Death Note (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
    synopsis: 'Un estudiante de secundaria encuentra una libreta sobrenatural que le permite matar a cualquier persona escribiendo su nombre en ella.',
    rating: '9.5',
    year: '2006',
    episodesCount: 37,
    genre: 'Suspenso Psicológico, Detectives',
    audio: 'Español Latino',
    tmdbId: '13916',
    type: 'tv'
  },
  {
    id: 'hunter-x-hunter',
    slug: 'hunter-x-hunter-2011',
    title: 'Hunter x Hunter 2011 (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-y5gsT1hoHuHw.png',
    synopsis: 'Gon Freecss descubre que su padre está vivo y es un legendario Cazador. Decide tomar el peligroso examen de Cazador para encontrarlo.',
    rating: '9.6',
    year: '2011',
    episodesCount: 148,
    genre: 'Aventura, Nen, Shounen',
    audio: 'Español Latino',
    tmdbId: '46298',
    type: 'tv'
  },
  {
    id: 'tokyo-ghoul',
    slug: 'tokyo-ghoul',
    title: 'Tokyo Ghoul (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg',
    synopsis: 'En Tokio acechan misteriosos Ghouls que devoran humanos. Ken Kaneki se transforma en un híbrido mitad humano mitad Ghoul.',
    rating: '8.6',
    year: '2014',
    episodesCount: 12,
    genre: 'Acción, Gore, Sobrenatural',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'black-clover',
    slug: 'black-clover',
    title: 'Black Clover (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97940-fyh8o7gNbha0.png',
    synopsis: 'En un mundo donde la magia lo es todo, Asta nace sin un ápice de magia pero sueña con ser el Rey Mago.',
    rating: '8.9',
    year: '2017',
    episodesCount: 170,
    genre: 'Acción, Magia, Shounen',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'one-punch-man',
    slug: 'one-punch-man',
    title: 'One Punch Man (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg',
    synopsis: 'Saitama es un héroe tan poderoso que derrota a cualquier enemigo de un solo puñetazo, buscando abrumado un oponente digno.',
    rating: '9.2',
    year: '2015',
    episodesCount: 12,
    genre: 'Acción, Comedia, Héroes',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'spy-x-family',
    slug: 'spy-x-family',
    title: 'Spy x Family (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg',
    synopsis: 'El espía Twilight crea una familia falsa con una asesina y una niña telépata para cumplir una misión secreta.',
    rating: '9.1',
    year: '2022',
    episodesCount: 25,
    genre: 'Espías, Comedia, Acción',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'fullmetal-alchemist-brotherhood',
    slug: 'fullmetal-alchemist-brotherhood',
    title: 'Fullmetal Alchemist Brotherhood (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-nSWCgQlmOMtj.jpg',
    synopsis: 'Los hermanos Edward y Alphonse Elric buscan la Piedra Filosofal para recuperar sus cuerpos tras un fallido ritual de alquimia.',
    rating: '9.7',
    year: '2009',
    episodesCount: 64,
    genre: 'Alquimia, Aventura, Clásico',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'overlord',
    slug: 'overlord',
    title: 'Overlord (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20832-vUNm5zrYWifc.jpg',
    synopsis: 'Momonga se queda atrapado en el MMORPG Yggdrasil tras el cierre de sus servidores, gobernando el Gran Laberinto de Nazarick.',
    rating: '8.8',
    year: '2015',
    episodesCount: 13,
    genre: 'Isekai, Fantasía, Magia',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'inuyasha',
    slug: 'inuyasha',
    title: 'Inuyasha (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx249-jVBkyLnBvnRE.png',
    synopsis: 'Kagome viaja 500 años al pasado a la época feudal de Japón y une fuerzas con el h полу-demonio Inuyasha para reunir la Perla de Shikon.',
    rating: '9.0',
    year: '2000',
    episodesCount: 167,
    genre: 'Fantasía, Romance, Clásico',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'digimon-adventure',
    slug: 'digimon-adventure',
    title: 'Digimon Adventure (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx552-zad0ts5hylQJ.jpg',
    synopsis: 'Siete niños elegidos son transportados al Mundo Digital donde forjan amistad con monstruos digitales para salvar ambos mundos.',
    rating: '8.8',
    year: '1999',
    episodesCount: 54,
    genre: 'Aventura, Clásico, Digital',
    audio: 'Español Latino',
    type: 'tv'
  },
  {
    id: 'ranma-1-2',
    slug: 'ranma-1-2',
    title: 'Ranma 1/2 (Latino)',
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx210-qgahLDYT0t9b.png',
    synopsis: 'Tras caer en un manantial maldito en China, Ranma Saotome se transforma en chica al mojarse con agua fría.',
    rating: '8.7',
    year: '1989',
    episodesCount: 161,
    genre: 'Comedia, Artes Marciales, Clásico',
    audio: 'Español Latino',
    type: 'tv'
  }
];

const DEFAULT_ANIME_POSTER = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21175-97w42aWf21X2.jpg';

// Obtener catálogo de Anime desde API pública (TioAnime Audio Latino)
export const fetchAnimeCatalog = async (query = '') => {
  try {
    const apiUrl = `https://novastream-resolver.vercel.app/api/anime?type=catalog${query ? `&search=${encodeURIComponent(query)}` : ''}`;
    console.log('[AnimeService] Obteniendo catálogo TioAnime Audio Latino:', apiUrl);
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.items && data.items.length > 0) {
        return data.items;
      }
    }
  } catch (err) {
    console.warn('[AnimeService] Resolver API error, usando catálogo local:', err.message);
  }
  return LATINO_ANIMES;
};
