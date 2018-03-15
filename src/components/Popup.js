import React from 'react';

export default function Popup(props) {
    return (
        <div style={{display: "none"}}>
            <div id="popup">
                {props.name}
                <div style={{color: "rgba(0, 0, 0, 0.54)", fontSize: "13px"}}>
                    {props.email}
                </div>
            </div>
        </div>
    )
}