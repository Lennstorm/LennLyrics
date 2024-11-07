"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c, _d, _e;
const apiKey = "1c50006994aa34ad5f138a5b72514ddf";
let lastSearchTerm = null;
function searchBySong(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;
        const response = yield fetch(url);
        if (!response.ok) {
            console.error("Error fetching data:", response.statusText);
            return;
        }
        const data = yield response.json();
        displayTrackResults(data.results.trackmatches.track);
    });
}
function searchByArtist(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;
        const response = yield fetch(url);
        if (!response.ok) {
            console.error("Error fetching data:", response.statusText);
            return;
        }
        const data = yield response.json();
        displayArtistResults(data.results.artistmatches.artist);
    });
}
function updateHeader(pageId, searchTerm) {
    const headerElement = document.querySelector("header h1");
    if (pageId === "searchResult" && searchTerm) {
        headerElement.textContent = `Sökresultat för "${searchTerm}"`;
    }
    else if (pageId === "favorite-page") {
        headerElement.textContent = "Dina favoriter";
    }
    else {
        headerElement.textContent = "Välkommen till din musikdatabas!";
    }
}
function addToFavorites(track) {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favorites.some((fav) => fav.name === track.name && fav.artist === track.artist)) {
        favorites.push(track);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}
function addArtistToFavorites(artist) {
    const favorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");
    if (!favorites.some((fav) => fav.name === artist.name)) {
        favorites.push(artist);
        localStorage.setItem("artistFavorites", JSON.stringify(favorites));
    }
}
function removeFromFavorites(type, index) {
    if (type === "track") {
        const trackFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        trackFavorites.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(trackFavorites));
    }
    else if (type === "artist") {
        const artistFavorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");
        artistFavorites.splice(index, 1);
        localStorage.setItem("artistFavorites", JSON.stringify(artistFavorites));
    }
    displayFavorites();
}
document.addEventListener("DOMContentLoaded", () => {
    showPage("searchPage");
});
(_a = document.getElementById("homeBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => showPage("searchPage"));
(_b = document.getElementById("searchPageBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => showPage("searchResult"));
(_c = document.getElementById("favoritesBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
    showPage("favorite-page");
    displayFavorites();
});
(_d = document.getElementById("searchSongBtn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
    const searchInput = document.getElementById("searchSongInput");
    const query = searchInput.value.trim();
    if (query) {
        showPage("searchResult", query);
        searchBySong(query);
        searchInput.value = "";
    }
    else {
        console.log("Ange ett låtnamn!");
    }
});
(_e = document.getElementById("searchArtistBtn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
    const searchInput = document.getElementById("searchArtistInput");
    const query = searchInput.value.trim();
    if (query) {
        showPage("searchResult", query);
        searchByArtist(query);
        searchInput.value = "";
    }
    else {
        console.log("Ange ett artistnamn!");
    }
});
function showPage(pageId, searchTerm) {
    const pages = document.querySelectorAll("main > section");
    pages.forEach(page => {
        page.classList.toggle("page--visible", page.id === pageId);
    });
    if (pageId === "searchResult") {
        if (searchTerm) {
            lastSearchTerm = searchTerm;
        }
        else if (!lastSearchTerm) {
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = "<p class='searchResult--noResult'> Här visas resultat av sökningar.</p>";
        }
    }
    updateHeader(pageId, searchTerm !== null && searchTerm !== void 0 ? searchTerm : lastSearchTerm);
}
function displayTrackResults(tracks) {
    const resultsContainer = document.getElementById("results");
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
function displayArtistResults(artists) {
    const resultsContainer = document.getElementById("results");
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
function displayFavorites() {
    const songFavoritesContainer = document.getElementById("songFavorites");
    const artistFavoritesContainer = document.getElementById("artistFavorites");
    songFavoritesContainer.innerHTML = "";
    artistFavoritesContainer.innerHTML = "";
    const trackFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const artistFavorites = JSON.parse(localStorage.getItem("artistFavorites") || "[]");
    if (trackFavorites.length === 0) {
        songFavoritesContainer.innerHTML = "<p>Inga favoritsånger sparade ännu</p>";
    }
    else {
        trackFavorites.forEach((track, index) => {
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
    }
    else {
        artistFavorites.forEach((artist, index) => {
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
