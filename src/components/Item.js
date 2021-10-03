import React from "react";

export default class Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: "",                                                     //more like a buffer
            editActive: false,
        }
    }
    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = (event) => {
        if(this.state.item === ""){
            this.setState({item: this.props.item});
            this.handleToggleEdit();
        }else{
            console.log("Item handleChange: " + this.state.item);
            this.props.renameItemCallback(this.props.id,this.state.item);
            this.setState({item: ""});
            this.handleToggleEdit();
        }
    }

    handleDragStart = (event) =>{
        event.dataTransfer.setData("src", this.props.id);
    }

    handleDragover = (event) =>{
        event.preventDefault();
    }
    
    handleDrop = (event) =>{
        event.preventDefault();
        this.props.moveItemCallback(event.dataTransfer.getData("src"),event.target.id);
    }


    handleUpdate = (event) => {
        this.setState({ item: event.target.value });
    }
    render() {
        const {name, id} = this.props;
        if (this.state.editActive) {
            return (
                <div id={id} className="top5-item">
                <input
                    id={"item-" + id}
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={name}
                />
                </div>
            )
        }
        else{
            return (
                <div id={id} className="top5-item" onClick={this.handleClick} 
                draggable="true" onDragStart={this.handleDragStart} 
                onDragOver={this.handleDragover} onDrop={this.handleDrop}>{name}</div>
            )
        }
    }
}