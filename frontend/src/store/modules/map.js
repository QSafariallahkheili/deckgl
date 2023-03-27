const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
const map = {
    namespaced: true,
    state: {
        map: null,
        center: {
            lng:  13.05,
            lat: 52.404
        },
        zoom: 13.3,
        minZoom: 4,
        maxZoom: 23,
        maxPitch: 85,
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${apiKey}`
    },
    mutations:{

    },
    actions:{

    },
    getters:{

    }

}

export default map