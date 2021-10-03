import React from "react";
import Item from "./Item";

export default class Workspace extends React.Component {
    render() {
        const {currentList,renameItemCallback} = this.props;
        const isNull = (currentList === null)
        let counter = 0;
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div>
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                    {isNull ?
                        <div id="edit-items">                    
                            <div id="item-1" className="top5-item"></div>
                            <div id="item-2" className="top5-item"></div>
                            <div id="item-3" className="top5-item"></div>
                            <div id="item-4" className="top5-item"></div>
                            <div id="item-5" className="top5-item"></div>
                        </div>
                        :
                        <div id="edit-items">
                            {currentList.items.map((item) => (
                                <Item
                                    key = {counter}
                                    id = {counter++}
                                    name = {item}
                                    renameItemCallback={renameItemCallback}
                                />
                            ))}
                        </div>
                    }
                </div>
            </div>
        )
    }
}