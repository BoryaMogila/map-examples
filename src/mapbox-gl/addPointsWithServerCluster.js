import qs from 'qs';
import debounce from 'lodash/debounce'

function getPoints(params) {
    return fetch(`/clustered?${qs.stringify(params, {indices: false})}`, ).then(res => res.json());
}

function createPoints(map, initData) {
    map.addSource('points', {
        type: 'geojson',
        data: initData,
    });
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'points',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'points',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'points',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
    map.on('click', 'clusters', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        var clusterId = features[0].properties.cluster_id;
        map.getSource('points').getClusterExpansionZoom(
            clusterId,
            function(err, zoom) {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    map.on('mouseenter', 'clusters', function() {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function() {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'clusters', function() {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function() {
        map.getCanvas().style.cursor = '';
    });

    const addPoints = () => {
        const bounds = map.getBounds();
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
        const zoom = map.getZoom();
        getPoints({ bbox, zoom })
            .then(data => {
                const source = map.getSource('points')
                source.setData(data);
            })
    }
    const addPointsDebounced = debounce(addPoints, 100);

    map.on('mouseup', addPointsDebounced);
    map.on('zoom', addPointsDebounced);
}

export default ({ map }) => {
    const bounds = map.getBounds();
    const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    const zoom = map.getZoom();
    getPoints({ bbox, zoom })
        .then(data => createPoints(map, data))

};
