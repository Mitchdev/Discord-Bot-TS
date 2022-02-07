export interface ImdbSearch extends ImdbError {
  searchType: string;
  expression: string;
  results: ImdbSearchResult[]
}

interface ImdbError {
  errorMessage: string;
}

interface ImdbSearchResult {
  id: string;
  resultType: string;
  image: string;
  title: string;
  description: string;
}

export interface ImdbTitle extends ImdbTitleLong, ImdbError {
  originalTitle: string;
  type: string;
  releaseDate: string;
  runtimeMins: string;
  runtimeStr: string;
  plotLocal: string;
  plotLocalIsRtl: boolean;
  awards: string;
  directorList: ImdbTitleStarShort[];
  writers: string;
  writerList: ImdbTitleStarShort[];
  starList: ImdbTitleStarShort[];
  actorList: ImdbTitleActorShort[];
  fullCast: ImdbTitleFullCast;
  genreList: ImdbTitleGenericKV[];
  companies: string;
  companyList: ImdbTitleCompany[];
  countries: string;
  countryList: ImdbTitleGenericKV[];
  languages: string;
  languageList: ImdbTitleGenericKV[];
  contentRating: string;
  imDbRatingVotes: string;
  metacriticRating: string;
  ratings: ImdbTitleRatings;
  wikipedia: ImdbTitleWikipedia;
  posters: ImdbTitlePosters;
  images: ImdbTitleImages;
  trailer: ImdbTitleTrailer;
  boxOffice: ImdbTitleBoxOffice;
  tagline: string;
  keywords: string;
  keywordsList: string[];
  similars: ImdbTitleLong[];
}

interface ImdbTitleStarShort {
  id: string;
  name: string;
}

interface ImdbTitleActorShort extends ImdbTitleStarShort {
  image: string;
  asCharacter: string;
}

interface ImdbTitleFullCast extends ImdbTitleShort, ImdbError {
  directors: ImdbTitleFullCastJob;
  writers: ImdbTitleFullCastJob;
  actors: ImdbTitleActorShort[];
  others: ImdbTitleFullCastJob[];
}

interface ImdbTitleShort {
  imDbId: string;
  title: string;
  fullTitle: string;
  type: string;
  year: string;
}

interface ImdbTitleLong {
  id: string;
  title: string;
  fullTitle: string;
  year: string;
  image: string;
  plot: string;
  directors: string;
  stars: string;
  genres: string;
  imDbRating: string;
}

interface ImdbTitleFullCastJob {
  job: string;
  items: ImdbTitleFullCastJobStar[];
}

interface ImdbTitleFullCastJobStar extends ImdbTitleStarShort {
  description: string;
}

interface ImdbTitleGenericKV {
  key: string;
  value: string;
}

interface ImdbTitleCompany {
  id: string;
  name: string;
}

interface ImdbTitleRatings extends ImdbTitleShort, ImdbError {
  imDb: string;
  metacritic: string;
  theMovieDb: string;
  rottenTomatoes: string;
  tV_com: string;
  filmAffinity: string;
}

interface ImdbTitleWikipedia extends ImdbTitleActorShort, ImdbError {
  language: string;
  titleInLanguage: string;
  url: string;
  plotShort: ImdbTitleWikipediaText;
  plotFull: ImdbTitleWikipediaText;
}

interface ImdbTitleWikipediaText {
  plaintext: string;
}

interface ImdbTitlePosters extends ImdbTitleShort, ImdbError {
  posters: ImdbTitlePoster[];
  backdrops: ImdbTitleBackdrop[];
}

interface ImdbTitlePoster {
  id: string;
  link: string;
  aspectRatio: number;
  language: string;
  width: number;
  height: number;
}

interface ImdbTitleBackdrop extends ImdbTitlePoster {}

interface ImdbTitleImages extends ImdbTitleShort, ImdbError {
  items: ImdbTitleImage[];
}

interface ImdbTitleImage extends ImdbTitleShort {
  title: string;
  image: string;
}

interface ImdbTitleTrailer extends ImdbTitleShort, ImdbError {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  thumbnailUrl: string;
  uploadDate: string;
  link: string;
  linkEmbed: string;
}

interface ImdbTitleBoxOffice {
  budget: string;
  openingWeekendUSA: string;
  grossUSA: string;
  cumulativeWorldwideGross: string;
}

export interface ImdbTitleAlt {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Lanuage: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: ImdbTitleAltRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Produciton: string;
  Website: string;
  Response: string;
  Error: string;
}

interface ImdbTitleAltRating {
  Source: string;
  Value: string;
}
