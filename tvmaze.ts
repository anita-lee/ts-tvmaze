import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodeButton = $(".Show-getEpisodes")

const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";
const API_BASE_URL = "https://api.tvmaze.com";

interface IShow {
  id: number;
  name: string;
  summary: string;
  image: { medium:string};
}

interface IEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShow[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${API_BASE_URL}/search/shows?q=${term}`);

  return response.data.map((result: { show: IShow }) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image.medium || MISSING_IMAGE_URL,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows:IShow[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Image for ${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: any = <string | number>$("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id:number): Promise<IEpisode[]> {
  const response = await axios.get(`${API_BASE_URL}/shows/${id}/episodes`);
  $episodesArea.show();

  return response.data.map((episode: IEpisode) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });
 }

/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes:IEpisode[]) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
        `<li>
        ${episode.name} (season ${episode.season}, number ${episode.number})
        </li>
      `);

    $episodesList.append($episode);  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

 async function searchForEpisodeAndDisplay(evt: JQuery.ClickEvent):Promise<void> {
  console.log("evt target", evt.target)
  const showId = $(evt.target).closest(".Show").data("show-id");
  console.log("SHOW ID", showId)
  const episodes = await getEpisodesOfShow(showId);

  $episodesArea.show();
  populateEpisodes(episodes);
}

//event delegation
$("#showsList").on('click', ".Show-getEpisodes", searchForEpisodeAndDisplay);

