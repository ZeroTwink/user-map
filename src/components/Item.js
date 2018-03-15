import React, {Component} from 'react';
import Avatar from 'material-ui/Avatar';
import {ListItem} from 'material-ui/List';
import {blue100} from 'material-ui/styles/colors';
import RadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked';

export default class Item extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.isActive !== nextProps.isActive;
    }

    render() {
        return (
            <ListItem
                hoverColor={blue100}
                rightIcon={this.props.isActive ? <RadioButtonChecked color={this.props.color} /> : null}
                leftAvatar={<Avatar src={this.props.avatar} />}
                onClick={this.props.onClickItem}
                secondaryText={this.props.secondaryText}>
                {this.props.name}
            </ListItem>
        )
    }
}