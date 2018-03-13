import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import {blue100} from 'material-ui/styles/colors';

import './index.scss';

import axios from 'axios';

const ol = window.ol;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    componentDidMount() {
        axios.get("http://localhost:3007/features")
            .then(res => {
                console.log(res);
                this.setState({
                    users: res.data.features.slice(900)
                });

                let users = res.data.features.slice(900);

                var count = users.length;
                var features = new Array(count);
                for (let i = 0; i < count; ++i) {
                    features[i] = new ol.Feature({
                        'geometry': new ol.geom.Point([users[i].geometry.coordinates[0] + 4188426.7147939987, users[i].geometry.coordinates[1] + 7508764.236877314]),
                        'i': i
                    });

                    features[i].setStyle(
                        new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 10,
                                fill: new ol.style.Fill({color: users[i]['properties']['color']})
                            })
                        })
                    );
                }

                var vectorSource = new ol.source.Vector({
                    features: features,
                    wrapX: false
                });
                var vector = new ol.layer.Vector({
                    source: vectorSource
                });

                var map = new ol.Map({
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM()
                        }),
                        vector
                    ],
                    target: document.getElementById('map'),
                    view: new ol.View({
                        center: [ 4188426.7147939987, 7508764.236877314 ],
                        zoom: 18
                    })
                });

                map.on('click', function(evt) {
                    var feature = map.forEachFeatureAtPixel(evt.pixel,
                        function(feature) {
                            return feature;
                        });
                    if (feature) {
                        console.log(users[feature.get('i')]['properties']['userName']);
                    } else {
                        console.log(0);
                    }
                });

                map.on('pointermove', function(evt) {
                    if (evt.dragging) {
                        return;
                    }
                    var pixel = map.getEventPixel(evt.originalEvent);
                    var hit = map.hasFeatureAtPixel(pixel);
                    if (hit) {
                        map.getTarget().style.cursor = 'pointer';
                    } else {
                        map.getTarget().style.cursor = '';
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        return (
            <div>
                <Drawer open={true} width={310}>
                    <List>
                        {this.state.users.map((e) => {
                            return (
                                <ListItem
                                    key={e.id}
                                    hoverColor={blue100}
                                    leftAvatar={<Avatar src={e.properties.avatar} />}
                                    onClick={(e) => {console.log(e)}}
                                    secondaryText={e.properties.email}>
                                    {e.properties.userName}
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>

                <div id="content">
                    <div id="map">

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
