// Configuración de la API (Para producción se usan variables de entorno)
const API_KEY = window.ENV?.TMDB_API_KEY || 'TU_API_KEY_AQUI'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearch = '';

// Elementos del DOM
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPageDisplay = document.getElementById('currentPage');
const sectionTitle = document.getElementById('sectionTitle');

// Cargar películas al inicio
document.addEventListener('DOMContentLoaded', () => fetchMovies());

async function fetchMovies(page = 1, query = '') {
    let url = query 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&language=es-ES`
        : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=es-ES`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // TMDB entrega 20 por defecto. Para cumplir "12 por página" cortamos el array
        displayMovies(data.results.slice(0, 12));
        updatePagination(data.total_pages);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

function displayMovies(movies) {
    movieGrid.innerHTML = '';
    
    if(movies.length === 0) {
        movieGrid.innerHTML = `<h3 class="text-center w-100 mt-5 opacity-50">No se encontraron resultados...</h3>`;
        return;
    }

    movies.forEach(movie => {
        const movieCard = `
            <div class="col">
                <div class="card movie-card h-100">
                    <div class="card-img-container">
                        <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" 
                             class="card-img-top" alt="${movie.title}">
                        <div class="rating-badge">
                            <i class="fas fa-star text-warning"></i> ${movie.vote_average.toFixed(1)}
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-truncate">${movie.title}</h5>
                        <p class="synopsis">${movie.overview || 'Sinopsis no disponible en español.'}</p>
                    </div>
                </div>
            </div>
        `;
        movieGrid.innerHTML += movieCard;
    });
}

// Búsqueda Dinámica (con debounce para no saturar la API)
let timeout = null;
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 1;
        sectionTitle.innerHTML = currentSearch ? `Resultados para: <span class="text-danger">${currentSearch}</span>` : `Películas <span class="text-danger">Populares</span>`;
        fetchMovies(currentPage, currentSearch);
    }, 500);
});

// Eventos de Paginación
nextPage.addEventListener('click', () => {
    currentPage++;
    fetchMovies(currentPage, currentSearch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

prevPage.addEventListener('click', () => {
    if(currentPage > 1) {
        currentPage--;
        fetchMovies(currentPage, currentSearch);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

function updatePagination(totalPages) {
    currentPageDisplay.innerText = currentPage;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
}