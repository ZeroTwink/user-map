import React, {Component} from 'react';
import {connect} from 'react-redux';
import Drawer from 'material-ui/Drawer';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import {blue100} from 'material-ui/styles/colors';
import RadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked';

import './index.scss';

import axios from 'axios';

import loadUsers from './actions/actionLoadUsers';

import Map from './components/Map';
import Popup from './components/Popup';

const ol = window.ol;
const moscowCord = [4188426.7147939987, 7508764.236877314];

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeUser: null,
            userName: "",
            userEmail: ""
        };

        this.popup = null;

        this.view = null;
    }

    /**
     * Рисует карту с точками(юзерами)
     * @param users {[]} Массив юзеров получиных с beckend
     */
    drawMap(users) {
        let count = users.length;
        let features = new Array(count);

        for (let i = 0; i < count; ++i) {
            features[i] = new ol.Feature({
                geometry: new ol.geom.Point([
                    users[i]['geometry']['coordinates'][0] + moscowCord[0],
                    users[i]['geometry']['coordinates'][1] + moscowCord[1]
                ]),
                i: i
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

        let view = this.view = new ol.View({
            center: [moscowCord[0], moscowCord[1]],
            zoom: 18
        });

        let map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                new ol.layer.Vector({
                    source: vectorSource
                })
            ],
            target: document.getElementById('map'),
            view: view
        });

        this.popup = new ol.Overlay({
            element: document.getElementById('popup'),
            positioning: 'bottom-center'
        });
        map.addOverlay(this.popup);

        map.on('click', (evt) => {
            let feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                    return feature;
                });

            if (feature) {
                let index = feature.get('i');

                this.popup.setPosition([
                    users[index]['geometry']['coordinates'][0] + moscowCord[0],
                    users[index]['geometry']['coordinates'][1] + moscowCord[1]
                ]);

                this.setState({
                    activeUser: index,
                    userName: users[index]['properties']['userName'],
                    userEmail: users[index]['properties']['email']
                });
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

    /**
     * Клик на юзера из списка
     * перемещает по карте в поиске точки юзера
     * @param i {int} index юзера в массиве
     * @param e {{}} event события клик
     */
    clickOnItem(i, e) {
        let {users} = this.props;

        let x = users[i]['geometry']['coordinates'][0] + moscowCord[0],
            y = users[i]['geometry']['coordinates'][1] + moscowCord[1];

        this.popup.setPosition([x, y]);

        this.view.animate({
            center: [x, y],
            zoom: 18,
            duration: 1000
        }, {
            zoom: 19,
            duration: 1000
        });

        this.setState({
            activeUser: i,
            userName: users[i]['properties']['userName'],
            userEmail: users[i]['properties']['email']
        });
    }

    componentDidMount() {
        axios.get("http://localhost:3007/features")
            .then(res => {
                let users = res.data.features.slice(900);

                this.props.loadUsers(users);

                this.drawMap(users);
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
                        {this.props.users.length && this.props.users.map((e, i) => (
                            <ListItem
                                key={e.id}
                                hoverColor={blue100}
                                rightIcon={this.state.activeUser === i ?
                                    <RadioButtonChecked color={this.props.users[i]['properties']['color']} /> : null}
                                leftAvatar={<Avatar src={e.properties.avatar} />}
                                onClick={this.clickOnItem.bind(this, i)}
                                secondaryText={e.properties.email}>
                                {e.properties.userName}
                            </ListItem>
                        ))}
                    </List>
                </Drawer>

                <Map/>

                <Popup name={this.state.userName} email={this.state.userEmail} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        users: state.users
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loadUsers: function(users) {
            dispatch(loadUsers(users));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
