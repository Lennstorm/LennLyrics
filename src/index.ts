const apiKey = "1c50006994aa34ad5f138a5b72514ddf";
let lastSearchTerm: string | null = null;

interface Track {
    name: string;
    artist: string;
    url: string;
}

interface Artist {
    name: string;
    url: string;
}

async function searchBySong(query: string): Promise<void> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
    }

    const data = await response.json();
    displayTrackResults(data.results.trackmatches.track);
}

async function searchByArtist(query: string): Promise<void> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
    }

    const data = await response.json();
    displayArtistResults(data.results.artistmatches.artist);
}

function updateHeader(pageId: string, searchTerm: string | null): void {
    const headerElement = document.querySelector("header h1") as HTMLElement;

    if (pageId === "searchResult" && searchTerm) {
        headerElement.textContent = `Sökresultat för "${searchTerm}"`;
    } else if (pageId === "favorite-page") {
        headerElement.textContent = "Dina favoriter";
    } else {
        headerElement.textContent = "Välkommen till din musikdatabas!";
    }
}

function addToFavorites(track: Track): void {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favorites.some((fav: Track) => fav.name === track.name && fav.artist === track.artist)) {
        favorites.push(track);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

function addArtistToFavorites(artist: Artist): void {
    const favorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");
    if (!favorites.some((fav: Artist) => fav.name === artist.name)) {
        favorites.push(artist);
        localStorage.setItem("artistFavorites", JSON.stringify(favorites));
    }
}

function removeFromFavorites(type: "track" | "artist", index: number): void {
    if (type === "track") {
        const trackFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        trackFavorites.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(trackFavorites));
    } else if (type === "artist") {
        const artistFavorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");
        artistFavorites.splice(index, 1);
        localStorage.setItem("artistFavorites", JSON.stringify(artistFavorites));
    }
    displayFavorites();
}

document.addEventListener("DOMContentLoaded", () => {
    showPage("searchPage");
});

document.getElementById("homeBtn")?.addEventListener("click", () => showPage("searchPage"));
document.getElementById("searchPageBtn")?.addEventListener("click", () => showPage("searchResult"));
document.getElementById("favoritesBtn")?.addEventListener("click", () => {
    showPage("favorite-page");
    displayFavorites();
});

document.getElementById("searchSongBtn")?.addEventListener("click", () => {
    const searchInput = document.getElementById("searchSongInput") as HTMLInputElement;
    const query = searchInput.value.trim();
    if (query) {
        showPage("searchResult", query);
        searchBySong(query);
        searchInput.value = "";
    } else {
        console.log("Ange ett låtnamn!");

    }
});

document.getElementById("searchArtistBtn")?.addEventListener("click", () => {
    const searchInput = document.getElementById("searchArtistInput") as HTMLInputElement;
    const query = searchInput.value.trim();
    if (query) {
        showPage("searchResult", query);
        searchByArtist(query);
        searchInput.value = "";
    } else {
        console.log("Ange ett artistnamn!");

    }
});

function showPage(pageId: string, searchTerm?: string): void {
    const pages = document.querySelectorAll("main > section") as NodeListOf<HTMLElement>;
    pages.forEach(page => {
        page.classList.toggle("page--visible", page.id === pageId);
    });

    if (pageId === "searchResult") {
        if (searchTerm) {
            lastSearchTerm = searchTerm;
        } else if (!lastSearchTerm) {
            const resultsContainer = document.getElementById("results") as HTMLElement;
            resultsContainer.innerHTML = "<p class='searchResult--noResult'> Här visas resultat av sökningar.</p>"
        }
    }
    updateHeader(pageId, searchTerm ?? lastSearchTerm)
}

function displayTrackResults(tracks: Track[]): void {
    const resultsContainer = document.getElementById("results") as HTMLElement;
    resultsContainer.innerHTML = "";
    tracks.forEach(track => {
        const item = document.createElement("div");
        item.className = "result-item";
        const starBtn = document.createElement("button");
        starBtn.textContent = "★";
        starBtn.className = "star-button";
        starBtn.addEventListener("click", () => addToFavorites(track));
        item.innerHTML = `
            <h3>${track.name}</h3>
            <p>Artist: ${track.artist}</p>
            <a href="${track.url}" target="_blank">Visa på Last.fm</a>
        `;
        item.appendChild(starBtn);
        resultsContainer.appendChild(item);
    });
}

function displayArtistResults(artists: Artist[]): void {
    const resultsContainer = document.getElementById("results") as HTMLElement;
    resultsContainer.innerHTML = "";
    artists.forEach(artist => {
        const item = document.createElement("div");
        item.className = "result-item";
        const starBtn = document.createElement("button");
        starBtn.textContent = "★";
        starBtn.className = "star-button";
        starBtn.addEventListener("click", () => addArtistToFavorites(artist));
        item.innerHTML = `
            <h3>${artist.name}</h3>
            <a href="${artist.url}" target="_blank">Visa på Last.fm</a>
        `;
        item.appendChild(starBtn);
        resultsContainer.appendChild(item);
    });
}

function displayFavorites(): void {
    const songFavoritesContainer = document.getElementById("songFavorites") as HTMLElement;
    const artistFavoritesContainer = document.getElementById("artistFavorites") as HTMLElement;

    songFavoritesContainer.innerHTML = "";
    artistFavoritesContainer.innerHTML = "";

    const trackFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const artistFavorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");

    if (trackFavorites.length === 0) {
        songFavoritesContainer.innerHTML = "<p>Inga favoritsånger sparade ännu</p>";
    } else {
        trackFavorites.forEach((track: Track, index: number) => {
            const item = document.createElement("div");
            item.className = "favorite-item";

            const starBtn = document.createElement("button");
            starBtn.textContent = "★";
            starBtn.className = "remove-favoriteBtn";
            starBtn.addEventListener("click", () => removeFromFavorites("track", index));

            item.innerHTML = `
                    <h3>${track.name}</h3>
                    <p>Artist: ${track.artist}</p>
                    <a href="${track.url}" target="_blank">Visa på Last.fm</a>
                `;
            item.appendChild(starBtn);
            songFavoritesContainer.appendChild(item);
        });
    }

    if (artistFavorites.length === 0) {
        artistFavoritesContainer.innerHTML = "<p>Inga favoritartister sparade ännu</p>";
    } else {
        artistFavorites.forEach((artist: Artist, index: number) => {
            const item = document.createElement("div");
            item.className = "favorite-item";

            const starBtn = document.createElement("button");
            starBtn.textContent = "★";
            starBtn.className = "remove-favoriteBtn";
            starBtn.addEventListener("click", () => removeFromFavorites("artist", index));

            item.innerHTML = `
                <h3>${artist.name}</h3>
                <a href="${artist.url}" target="_blank">Visa på Last.fm</a>
            `;
            item.appendChild(starBtn);
            artistFavoritesContainer.appendChild(item);
        });
    }
}
