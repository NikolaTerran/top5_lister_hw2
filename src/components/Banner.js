import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const {title,closeCallback, undoCallback, redoCallback,undoButton, redoButton, closeButton} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar 
                    undoButton = {undoButton}
                    redoButton = {redoButton}
                    closeButton = {closeButton}
                    closeCallback = {closeCallback}
                    undoCallback = {undoCallback}
                    redoCallback = {redoCallback}
                />
            </div>
        );
    }
}