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

    drawMap(users) {
        let count = users.length;
        let features = new Array(count);

        for (let i = 0; i < count; ++i) {
            features[i] = new ol.Feature({
                'geometry': new ol.geom.Point([
                    users[i]['geometry']['coordinates'][0] + 4188426.7147939987,
                    users[i]['geometry']['coordinates'][1] + 7508764.236877314
                ]),
                'i': i
            });

            features[i].setStyle(
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({color: users[i]['properties']['color']})
                    })
                })
            );
        }

        let vectorSource = new ol.source.Vector({
            features: features,
            wrapX: false
        });
        let vector = new ol.layer.Vector({
            source: vectorSource
        });

        let map = new ol.Map({
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

        let popup = new ol.Overlay({
            element: document.getElementById('popup'),
            positioning: 'bottom-center'
        });
        map.addOverlay(popup);

        map.on('click', function(evt) {
            let feature = map.forEachFeatureAtPixel(evt.pixel,
                function(feature) {
                    return feature;
                });
            if (feature) {
                console.log(users[feature.get('i')]['properties']['userName']);
                popup.setPosition([
                    users[feature.get('i')]['geometry']['coordinates'][0] + 4188426.7147939987,
                    users[feature.get('i')]['geometry']['coordinates'][1] + 7508764.236877314
                ]);
            } else {
                console.log(0);
            }
        });

        map.on('pointermove', function(evt) {
            if (evt.dragging) {
                return;
            }
            let pixel = map.getEventPixel(evt.originalEvent);
            let hit = map.hasFeatureAtPixel(pixel);
            if (hit) {
                map.getTarget().style.cursor = 'pointer';
            } else {
                map.getTarget().style.cursor = '';
            }
        });
    }

    componentDidMount() {
        axios.get("http://localhost:3007/features")
            .then(res => {
                let users = res.data.features.slice(900);

                this.setState({
                    users: users
                });

                this.drawMap(users);
            })
            .catch(error => {
                console.log(error);
            });
    }

    sert4(i, e) {
        console.log(this.state.users[i]['properties']['userName'], i);
        console.log(this.state.users[i]['geometry']['coordinates']);
    }

    render() {
        return (
            <div>
                <Drawer open={true} width={310}>
                    <List>
                        {this.state.users.map((e, i) => {
                            return (
                                <ListItem
                                    key={e.id}
                                    hoverColor={blue100}
                                    leftAvatar={<Avatar src={e.properties.avatar} />}
                                    onClick={this.sert4.bind(this, i)}
                                    secondaryText={e.properties.email}>
                                    {e.properties.userName}
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>

                <div id="content">
                    <div id="map" />
                </div>

                <div style={{display: "none"}}>
                    <div id="popup">
                        dfsfdfds
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
