const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
const map = {
    namespaced: true,
    state: {
        map: null,
        center: {
            lng:  13.746175,
            lat: 51.062868
        },
        zoom: 15,
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