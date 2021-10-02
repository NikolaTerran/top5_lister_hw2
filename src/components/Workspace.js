import React from "react";

export default class Workspace extends React.Component {
    render() {
        const {currentList} = this.props;
        const isNull = (currentList === null)
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
                        <div id="item-1" className="top5-item"></div>
                        <div id="item-1" className="top5-item"></div>
                        <div id="item-1" className="top5-item"></div>
                        <div id="item-1" className="top5-item"></div>
                        </div>
                        :
                        <div id="edit-items">
                            <div id="item-1" className="top5-item">{currentList.items[0]}</div>
                            <div id="item-1" className="top5-item">{currentList.items[1]}</div>
                            <div id="item-1" className="top5-item">{currentList.items[2]}</div>
                            <div id="item-1" className="top5-item">{currentList.items[3]}</div>
                            <div id="item-1" className="top5-item">{currentList.items[4]}</div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}